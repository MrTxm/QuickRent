const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");



dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "public", "images")));


app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);





// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);