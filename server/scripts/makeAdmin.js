const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.log("Usage: node scripts/makeAdmin.js your-email@gmail.com");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.log("User not found. Sign up first, then run this command again.");
      process.exit(1);
    }

    console.log(`${user.email} is now an admin.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
