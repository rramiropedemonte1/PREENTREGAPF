import mongoose from "mongoose";

const URI =
  "mongodb+srv://ramiivan59:1234567!@cluster0.joe5uet.mongodb.net/ecommerce";

await mongoose.connect(URI, {
  serverSelectionTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedToPology: true,
});
console.log("Base de datos conectada....");
