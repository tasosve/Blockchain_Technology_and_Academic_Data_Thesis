const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", false)
        await mongoose.connect(process.env.DATABASE_URI)
        console.log("Connected to mongoDB")
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB
