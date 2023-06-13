const express = require("express")
const router = express.Router()
const oracle = require("../scripts/oracle")
const verifyJWT = require("../middleware/verifyJWT")

router.use(verifyJWT)

router.route("/:address").post(oracle.degreeRequest)

module.exports = router
