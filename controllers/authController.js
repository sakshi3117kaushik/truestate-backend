import Customer from "../models/Customer.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid"; // To generate customerId if not provided

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ======================= SIGNUP =======================
export const signup = async (req, res) => {
  try {
    let {
      customerId,
      name,
      email,
      password,
      phoneNo,
      gender,
      age,
      customerRegion,
      customerType,
    } = req.body;

    // Check required fields
    if (!name || !email || !password || !phoneNo || !gender || !age || !customerRegion) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check if email already exists
    const userExists = await Customer.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate customerId if not provided
    if (!customerId) {
      customerId = "CUST-" + uuidv4().split("-")[0]; // Example: CUST-3f2a1b
    }

    // Create new customer
    const user = await Customer.create({
      customerId,
      name,
      email,
      password,
      phoneNo,
      gender,
      age,
      customerRegion,
      customerType,
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        customerId: user.customerId,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ======================= LOGIN =======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // Find user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        customerId: user.customerId,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
