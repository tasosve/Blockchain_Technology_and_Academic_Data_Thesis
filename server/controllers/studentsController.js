const Student = require("../models/student")
const asyncHandler = require("express-async-handler")

// @desc Get a student
// @route GET /students
// @access Private
const getStudent = asyncHandler(async (req, res) => {
    const address = req.params.address
    if (!address) {
        return res.status(400).json({ message: "Address is required" })
    }
    const student = await Student.findOne({ address }).lean()
    if (!student) {
        return res.status(400).json({ message: "Does not exist" })
    }
    res.json(student)
})

module.exports = {
    getStudent,
}
