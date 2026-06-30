// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const { sequelize } = require("./models/index"); // Import Sequelize instance
const { insertSampleData } = require("./scripts/initializeData"); // Import the function to insert sample data
const Razorpay = require("razorpay");

const contactRoutes = require("./routes/contact");
const orderRoutes = require("./routes/orderRoutes");
const couponsRoute = require("./routes/coupons");
const productRoute = require("./routes/productRoutes");
const popularproductRoute = require("./routes/popularproductRoutes");
const otpRoutes = require("./routes/otpRoutes");
const profile = require("./routes/profile");
const excelimport  = require("./routes/import");
// Import payment routes
const authenticateToken = require("./middlewares/authMiddleware");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/paymentRoutes"); // Import payment routes

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
const corsOptions = {
  origin: ['https://onestopbathsolution.onrender.com', 'https://websitefrontend.onrender.com', 'https://websitebackend-sx9w.onrender.com/products/popular', 'https://www.onestopbath.in', 'https://onestopbath.in/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// app.use(
//   cors({
//     origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
//     credentials: true,
//   })
// );

// Session middleware configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true, // Set to true in production
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000,// Session expires in 5 minutes
      sameSite: "lax",
    },
  })
);

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Routes
app.use("/users", userRoutes);
app.use("/contact", contactRoutes);
app.use("/orders", orderRoutes);
app.use("/coupons", couponsRoute);
app.use("/productscategories", productRoute);
app.use("/products", popularproductRoute);
app.use("/otp", otpRoutes);
app.use("/profile", profile);
app.use("/import", excelimport);
// Use payment routes
app.use("/", authenticateToken, paymentRoutes);

app.get('/api/check-session', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Session expired" });
  }
  res.status(200).json({ message: "Session active" });
});

module.exports = { razorpayInstance };

// Start server and sync database
sequelize
  .sync()
  .then(async () => {
    await insertSampleData(); // Insert sample data
    app.listen(port, () => {
      console.log("port is running");
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
