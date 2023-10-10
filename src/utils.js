import { dirname } from "path";
import { fileURLToPath } from "url";
export const __dirname = dirname(fileURLToPath(import.meta.url));
import multer from "multer";
const bcrypt = require("bcrypt");
const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/public/uploads`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploader = multer({
  storage,
  onError: (err, next) => {
    console.log(err);
    next();
  },
});

const isValidatePassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

module.exports = {
  createHash,
  isValidatePassword,
};

module.exports = uploader;
