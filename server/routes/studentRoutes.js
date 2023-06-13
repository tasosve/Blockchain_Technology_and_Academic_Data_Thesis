const express = require("express")
const router = express.Router()
const studentController = require("../controllers/studentsController")
const verifyJWT = require("../middleware/verifyJWT")

router.use(verifyJWT)

router.route("/:address").get(studentController.getStudent)

module.exports = router
