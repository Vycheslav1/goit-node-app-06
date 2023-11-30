const express = require("express");

const router = express.Router();

const controller = require("./controllers.js");

const upload = require("./middlewares/upload.js");

router.patch(
  "/users/avatars",
  upload.single("avatarURL"),
  controller.uploadAvatar
);

module.exports = router;
