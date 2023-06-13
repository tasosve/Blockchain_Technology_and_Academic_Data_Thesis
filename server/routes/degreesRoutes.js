const express = require("express")
const router = express.Router()
const degreesController = require("../controllers/degreesController")
const verifyJWT = require("../middleware/verifyJWT")

router.use(verifyJWT)

router.route("/:filename").get(degreesController.getPDF)

module.exports = router
