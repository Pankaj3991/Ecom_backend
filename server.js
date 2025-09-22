const app = require("./app");
const Connection = require("./config/dbConfig");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");

// uncaught error handling
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(` Shutting down server due to uncaught exception`);
  process.exit(1);
});

// Configuring dotenv file
dotenv.config({ path: "./config/config.env" });

// Connecting to database 
Connection();

// Cloudinary connection --
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// server port number --
const server = app.listen(process.env.PORT, () => {
  console.log(`App is running on http://localhost:${process.env.PORT}`);
});

// unhandled promise rejection:
process.on("unhandledRejection", (err, reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log(`Error: ${err.message} `);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
