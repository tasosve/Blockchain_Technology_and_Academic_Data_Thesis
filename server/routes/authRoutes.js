const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const loginLimiter = require("../middleware/loginLimiter")

router.route("/").post(loginLimiter, authController.login)

router.route("/nonce/:address").get(authController.getNonce)

router.route("/refresh").get(authController.refresh)

router.route("/delete").post(authController.deletePdf)

router.route("/logout").post(authController.logout)

module.exports = router
