const fs = require("fs")
const asyncHandler = require("express-async-handler")

// @desc Get a pdf file
// @route GET /degrees
// @access Private
const getPDF = asyncHandler(async (req, res) => {
    const filename = req.params.filename
    const filePath = `../server/degrees/${filename}`
    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const fileStream = fs.createReadStream(filePath)
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Length", fileSize)
    fileStream.pipe(res)
})

module.exports = { getPDF }
