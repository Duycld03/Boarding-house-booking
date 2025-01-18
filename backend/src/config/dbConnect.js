import mongoose from "mongoose";

const dbUlr = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const dbName = process.env.DATABASE_NAME || "shoppingCart";

function connect() {
  try {
    mongoose.connect(`${dbUlr}${dbName}`, {});
    console.log("Connect db successful");
  } catch (error) {
    console.log(error);
  }
}

export default connect;
