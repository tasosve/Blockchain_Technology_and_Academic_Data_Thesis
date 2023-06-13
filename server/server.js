require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const { logger } = require("./middleware/logger")
const errorHandler = require("./middleware/errorHandler")
const cors = require("cors")
const corsOptions = require("./config/corsOptions")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/dbConnection")
const mongoose = require("mongoose")
const { logEvents } = require("./middleware/logger")
const PORT = process.env.PORT || 3500

connectDB()

app.use(logger)

app.use(cookieParser())

app.use(cors(corsOptions))

app.use(express.json())

// loads css for root page
app.use("/", express.static(path.join(__dirname, "public")))

app.use("/", require("./routes/root"))

app.use("/auth", require("./routes/authRoutes"))

app.use("/students", require("./routes/studentRoutes"))

app.use("/oracle", require("./routes/oracleRoutes"))

app.use("/degrees", require("./routes/degreesRoutes"))

//routes to 404 page
app.all("*", (req, res) => {
    res.status(404)
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "views", "404.html"))
    } else if (req.accepts("json")) {
        res.json({ message: "404 Not Found" })
    } else {
        res.type("txt").send("404 Not Found")
    }
})

app.use(errorHandler)

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on("error", (err) => {
    console.log(err)
    logEvents(
        `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
        "mongoErrLog.log"
    )
})
