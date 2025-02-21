const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Ensure you have installed cors: npm install cors
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

// Use the connection string from the environment variable
const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define User schema and model
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true },
  roll_number: { type: String, required: true }
});

// Virtual field for user_id in the format: firstName_lastName_ddmmyyyy
userSchema.virtual("user_id").get(function () {
  const d = this.dob;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${this.firstName.toLowerCase()}_${this.lastName.toLowerCase()}_${dd}${mm}${yyyy}`;
});

// Ensure virtuals are included in JSON responses
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// GET route: Returns a hardcoded operation code
app.get("/bfhl", (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// POST route: Processes input data and returns user and data details
app.post("/bfhl", async (req, res) => {
  try {
    const { data } = req.body;
    // Validate that data exists and is an array
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid input format: 'data' must be an array"
      });
    }

    let numbers = [];
    let alphabets = [];

    // Process each item in the data array
    data.forEach(item => {
      if (!isNaN(item)) {
        numbers.push(item);
      } else if (typeof item === "string" && item.length === 1 && /^[a-zA-Z]$/.test(item)) {
        alphabets.push(item);
      }
    });

    // Determine the highest alphabet (if any exist)
    let highestAlphabet = [];
    if (alphabets.length > 0) {
      // Sort alphabets in descending order (case-insensitive)
      alphabets.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? -1 : 1));
      highestAlphabet = [alphabets[0]];
    }

    // Retrieve the user details from MongoDB.
    // (Assumes at least one user exists in the collection.)
    const user = await User.findOne({});
    if (!user) {
      return res.status(404).json({ is_success: false, message: "User not found in database" });
    }

    // Build and send the response
    res.status(200).json({
      is_success: true,
      user_id: user.user_id, // computed via virtual field
      email: user.email,
      roll_number: user.roll_number,
      numbers: numbers,
      alphabets: alphabets,
      highest_alphabet: highestAlphabet
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ is_success: false, message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
