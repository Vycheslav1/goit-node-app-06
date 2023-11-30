const multer = require("multer");

const path = require("path");

const crypto = require("crypto");

const Jimp = require("jimp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(_dirname, "..", "tmp"));
    Jimp.read(req.file.path)
      .then((picture) => {
        return picture
          .resize(250, 250)
          .quality(60)
          .greyscale()
          .write(req.file.path);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    const suffix = crypto.randomUUID();
    cb(null, `${basename}-${suffix}${extname}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
