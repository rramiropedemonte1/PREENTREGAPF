require("dotenv").config();

const config = {
  port: process.env.PORT,
  cookie_key: process.env.COOKIE_KEY,
  secret_key: process.env.SECRET_KEY,
  github_client_id: process.env.GITHUB_CLIENT_ID,
  github_secret_key: process.env.GITHUB_SECRET_KEY,
  github_callback_url: process.env.GITHUB_CALLBACK_URL,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires: process.env.JWT_EXPIRES_IN,
  jwt_algorithm: process.env.JWT_ALGORITHM,
  admin_email: process.env.ADMIN_EMAIL,
  admin_password: process.env.ADMIN_PASSWORD,
};

const db = {
  mongo_local: process.env.MONGO_URL_LOCAL,
  mongo_atlas: process.env.MONGO_URL_ATLAS,
  dbName: process.env.DB_NAME,
};

module.exports = {
  config,
  db,
};
