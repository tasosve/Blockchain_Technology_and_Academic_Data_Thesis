const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    semester: {
        type: Number,
        min: 1,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value",
        },
    },
    nonce: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model("Student", studentSchema)
