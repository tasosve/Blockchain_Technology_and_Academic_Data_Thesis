require("dotenv").config()
const { ethers } = require("hardhat")
const Student = require("../models/student")
const Course = require("../models/course")
const PDFDocument = require("pdfkit")
const fs = require("fs")
const asyncHandler = require("express-async-handler")

// @desc Connects to provider,
// Calculates if the student can graduate,
// If yes: Requests token generation from the smart contract,
// then creates the pdf degree.
// @route GET /degrees
// @access Private
const degreeRequest = asyncHandler(async (req, res) => {
    const signer = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY)
    const provider = new ethers.providers.JsonRpcProvider(
        process.env.SEPOLIA_RPC_URL
    )
    const connectedSigner = signer.connect(provider)
    const contractAddress = "0x787569790F8715911aAbBf56b5080cDb59AF2e9e"
    const studentAddress = req.params.address
    const oracleContract = await ethers.getContractAt(
        "OracleContract",
        contractAddress,
        connectedSigner
    )

    var canGraduate = false

    const student = await Student.findOne({ address: studentAddress })

    const { id: studentId } = student

    const mandatoryCourses = await Course.aggregate([
        {
            $match: {
                studentId: studentId,
                type: { $eq: "mandatory" },
                grade: { $gte: 5 },
            },
        },
    ])

    if (mandatoryCourses.length == 43) {
        const seventhSemesterCources = await choiceCourses("7", 3, studentId)
        const eighthSemesterCources = await choiceCourses("8", 3, studentId)
        const ninethSemesterCources = await choiceCourses("9", 5, studentId)
        const thesis = await choiceCourses("E", null, studentId)
        const courses = mandatoryCourses.concat(
            seventhSemesterCources,
            eighthSemesterCources,
            ninethSemesterCources
        )
        const coursesAndThesis = courses.concat(thesis)
        const ects = coursesAndThesis.map((student) => student.ects)
        const ectsSum = ects.reduce((acc, curr) => acc + curr, 0)
        if (courses.length == 54) {
            if (ectsSum >= 300) {
                const { semester: studentSemester } = student
                if (studentSemester >= 10) {
                    const CoursesEcts = courses.map((student) => student.ects)
                    const CoursesGrades = courses.map(
                        (student) => student.grade
                    )

                    const multiplyArrays = (arr1, arr2) => {
                        return arr1.map(
                            (element, index) => element * arr2[index]
                        )
                    }
                    ectsAndGradesMult = multiplyArrays(
                        CoursesEcts,
                        CoursesGrades
                    )
                    const ectsAndGradesSum = ectsAndGradesMult.reduce(
                        (acc, curr) => acc + curr,
                        0
                    )

                    const thesisEcts = thesis.map((student) => student.ects)
                    const thesisGrade = thesis.map((student) => student.grade)
                    const thesisEctsAndGradesMult =
                        thesisEcts[0] * thesisGrade[0]

                    const coursesEcts = courses.map((student) => student.ects)
                    const coursesEctsSum = coursesEcts.reduce(
                        (acc, curr) => acc + curr,
                        0
                    )

                    const degreeGrade =
                        (ectsAndGradesSum + thesisEctsAndGradesMult) /
                        (coursesEctsSum + thesisEcts[0])

                    if (degreeGrade <= 6.49) {
                        var degreeCharacterization = "Good"
                    } else if (degreeGrade <= 8.49) {
                        var degreeCharacterization = "Very Good"
                    } else if (degreeGrade <= 10) {
                        var degreeCharacterization = "Excellent"
                    }

                    canGraduate = true

                    const smartContractResponce = await smartContractCalls(
                        oracleContract,
                        studentAddress,
                        canGraduate
                    )
                    const studentTokenId = smartContractResponce.toNumber()

                    if (studentTokenId) {
                        const doc = new PDFDocument()

                        doc.pipe(
                            fs.createWriteStream(
                                `degrees/${studentTokenId}.pdf`
                            )
                        )

                        doc.image("../server/public/pada-logo.jpg", {
                            fit: [315, 315],
                            align: "center",
                            absolutePosition: { x: 0, y: 0 },
                        })

                        doc.moveDown()
                            .font("Helvetica-Bold")
                            .fontSize(36)
                            .text("University of West Attica", {
                                align: "center",
                            })

                        doc.moveDown()
                            .font("Helvetica-Bold")
                            .fontSize(30)
                            .text(student.department, {
                                align: "center",
                            })

                        doc.moveDown()
                            .font("Helvetica")
                            .fontSize(24)
                            .text(student.name, { align: "center" })

                        doc.moveDown().fontSize(18).text(`ID: ${studentId}`, {
                            align: "center",
                        })

                        doc.moveDown()
                            .fontSize(18)
                            .text(
                                `With a Grade of: ${degreeGrade} ${degreeCharacterization}`,
                                { align: "center" }
                            )

                        doc.end()

                        doc.on("end", () => {
                            console.log("PDF file generated successfully")
                            const jsonResponse = {
                                tokenId: `${studentTokenId}.pdf`,
                            }
                            res.send(jsonResponse)
                        })

                        doc.on("error", (err) => {
                            console.error(err)
                            res.status(500).json({
                                error: "Failed to generate PDF file",
                            })
                        })
                    } else {
                        res.status(404).json({
                            error: "No reponse from the smart contract",
                        })
                    }
                } else {
                    res.status(404).json({
                        error: "Student is not on 10th or higher Semester",
                    })
                }
            } else {
                res.status(404).json({
                    error: "ECTS lower than 300",
                })
            }
        } else {
            res.status(404).json({
                error: "Not all courses completed",
            })
        }
    } else {
        res.status(404).json({
            error: "Not enough mandatory Courses passed",
        })
    }
})

async function smartContractCalls(oracleContract, address, _canGraduate) {
    await oracleContract.hasToken(address)
    var tokenId = await getTokenURI(oracleContract)
    if (tokenId == 0) {
        await oracleContract.graduationCheck(_canGraduate)
        await oracleContract.safeMint(address)
        tokenId = await getTokenURI(oracleContract)
        return tokenId
    }
    return tokenId
}

async function choiceCourses(semester, numbOfCourses, _studentId) {
    try {
        if (numbOfCourses === null) {
            const choiceCourses = await Course.aggregate([
                {
                    $match: {
                        studentId: _studentId,
                        courseSemester: { $eq: semester },
                        type: { $eq: "choice" },
                        grade: { $gte: 5 },
                    },
                },
            ])
            return choiceCourses
        }
        const choiceCourses = await Course.aggregate([
            {
                $match: {
                    studentId: _studentId,
                    courseSemester: { $eq: semester },
                    type: { $eq: "choice" },
                    grade: { $gte: 5 },
                },
            },
            { $sort: { grade: -1 } },
            { $limit: numbOfCourses },
        ])
        return choiceCourses
    } catch (err) {
        console.log(err)
        throw err
    }
}

async function getTokenURI(oracleContract) {
    return new Promise((resolve, reject) => {
        oracleContract.on("tokenMinted", (tokenURI) => {
            resolve(tokenURI)
        })
    })
}

module.exports = { degreeRequest }
