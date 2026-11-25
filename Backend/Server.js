// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");

// const app = express();
// require("dotenv").config();

// app.use(express.json());
// app.use(cors());

// app.get("/api/test", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Dynamic Form Builder Backend is Running!",
//   });
// });

// app.get("/", (req, res) => {
//   res.send("Backend Server Running");
// });

// mongoose.connect(process.env.MONGO_URI).then(() => {
//   try{
//     // LIST THIS EXPRESS APP PORT SERVER BELOW:
//   app.listen(process.env.PORT, () => {
//     console.log(`DB IS CONNECTED AND Server running on port ${process.env.PORT}`);
//   });
//   }catch(err){
//       console.log(`DB CONNECTION IS FAILED PORT IN :  ${process.env.PORT}`)
//   }
// });


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Request Debugging Middleware
app.use((req, res, next) => {
  console.log("--------------------------------");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Request Body:", req.body);
  console.log("--------------------------------");

  next();
});

// ========================================
// IMPORT ROUTES
// ========================================

const formRoutes = require("./routes/formRoutes");

// ========================================
// ADMIN FORM ROUTES
// ========================================

app.use("/api/forms", formRoutes);

// ========================================
// TEST API
// ========================================

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dynamic Form Builder Backend is Running!",
  });
});

// ========================================
// HOME API
// ========================================

app.get("/", (req, res) => {
  res.status(200).send("Backend Server Running");
});

// ========================================
// 404 ROUTE
// ========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

// ========================================
// SERVER & DATABASE CONNECTION
// ========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

startServer();
