const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:true}));

app.use(cors());

// Routes imports -- 
const userRoute = require("./routes/userRoute.js");
const categoryRoute = require("./routes/categoryRoute.js");
const productRoute = require("./routes/productRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");
const cartRoute = require("./routes/cartRoute.js");
const orderRoute = require("./routes/orderRoute.js");

app.use("/api/v1",userRoute);
app.use("/api/v1",categoryRoute);
app.use("/api/v1",productRoute);
app.use("/api/v1",reviewRoute);
app.use("/api/v1",cartRoute);
app.use("/api/v1",orderRoute);

// middlewares: add it in the end, otherwise server will keep on crashing.. 
app.use(errorMiddleware);

module.exports = app;