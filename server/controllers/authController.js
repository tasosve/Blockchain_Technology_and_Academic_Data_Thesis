const Student = require("../models/student")
const asyncHandler = require("express-async-handler")
const sigUtil = require("eth-sig-util")
const ethUtil = require("ethereumjs-util")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const fs = require("fs")

//desc getNonce
//@route GET /auth/nonce
//@access Public
const getNonce = asyncHandler(async (req, res) => {
    const address = req.params.address

    if (!address) {
        return res.status(400).json({ message: "Address is required" })
    }

    const { nonce } = await Student.findOne({ address }).lean()

    if (!nonce) {
        return res.status(400).json({ message: "Does not exist" })
    }

    res.json(nonce)
})

//desc Login
//@route POST /auth
//@access Public
const login = asyncHandler(async (req, res) => {
    const { address, signature } = req.body

    if (!address || !signature) {
        res.status(400).json({ message: "All fields are required" })
    }

    const foundStudent = await Student.findOne({ address }).exec()

    if (!foundStudent) {
        res.status(401).json({ message: "Unauthorized" })
    }

    const msg = `I am signing my one-time nonce: ${foundStudent.nonce}`
    const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, "utf8"))

    const recoveredAddress = sigUtil.recoverPersonalSignature({
        data: msgBufferHex,
        sig: signature,
    })

    console.log(recoveredAddress)

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        const accessToken = jwt.sign(
            { StudentInfo: { address: foundStudent.address } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            { StudentInfo: { address: foundStudent.address } },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "6h" }
        )

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 6 * 60 * 60 * 1000,
        })

        const newNonce = await crypto.randomBytes(16).toString("hex")
        const updatedNonce = await Student.updateOne(
            { address: address },
            { nonce: newNonce }
        )
        console.log(updatedNonce)

        res.json({ accessToken })
    } else {
        res.status(401).json({ message: "Unauthorized" })
    }
})

//desc Refresh
//@route GET /auth/refresh
//@access Public
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies.jwt) {
        res.status(401).json({ message: "Unauthorized" })
    }

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
                res.status(403).json({ message: "Forbidden" })
            }

            const foundStudent = await Student.findOne({
                address: decoded.StudentInfo.address,
            }).exec()

            if (!foundStudent) {
                res.status(401).json({ message: "Unathorized" })
            }

            const accessToken = jwt.sign(
                {
                    StudentInfo: { address: foundStudent.address },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            )

            res.json({ accessToken })
        })
    )
}

//desc DeletePdf
//@route POST /auth/delete
//@access Public
const deletePdf = (req, res) => {
    const { tokenId } = req.body
    const studentPdf = `../server/degrees/${tokenId}`

    const deletePdfFile = (filePath) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete PDF file: ${filePath}`, err)
            } else {
                console.log(`PDF file deleted: ${filePath}`)
            }
        })
    }
    deletePdfFile(studentPdf)
}

//desc Logout
//@route POST /auth/logout
//@access Public
const logout = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) {
        res.sendStatus(204)
    }

    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    })

    res.json({ message: "Cookies cleared" })
}

module.exports = {
    getNonce,
    login,
    refresh,
    deletePdf,
    logout,
}
