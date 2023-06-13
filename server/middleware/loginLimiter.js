const rateLimit = require("express-rate-limit")
const { logEvents } = require("./logger")

const loginLimiter = rateLimit({
    windowMs: 60 * 100,
    mas: 5,
    message: {
        message: "To many attemts from this IP, try again after 60 seconds",
    },
    handler: (req, res, next, options) => {
        logEvents(
            `To many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.header.origin}`,
            "error.Log"
        )
        res.status(options.statusCode).send(options.message)
    },
    standardHeader: true,
    legacyHeader: false,
})

module.exports = loginLimiter
