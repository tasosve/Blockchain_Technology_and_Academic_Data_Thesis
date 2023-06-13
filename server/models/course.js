const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
    course: {
        type: String,
        required: true,
    },
    ects: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value",
        },
    },
    type: {
        type: String,
        enum: ["mandatory", "choice"],
        required: true,
    },
    courseSemester: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[1-9]$|^[E]$/.test(v)
            },
            message: (props) =>
                `${props.value} is not a valid course semester.`,
        },
    },
    studentId: {
        type: String,
        required: true,
    },
    grade: {
        type: Number,
        min: 0,
        max: 10,
        required: true,
    },
})

module.exports = mongoose.model("Course", courseSchema)
