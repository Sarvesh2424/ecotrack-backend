const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://10650sarvesh:choc2424@cluster0.wktvu.mongodb.net/ecotrack"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  });

app.listen(3000, () => {
  console.log("Server is running on http://127.0.0.1:3000 ");
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const footPrintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  footPrint: { type: Number, required: true },
});

const FootPrint = mongoose.model("FootPrint", footPrintSchema);

const goalScheme = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  goal: { type: Number, required: true },
});

const Goal = mongoose.model("Goal", goalScheme);

app.post("/footprint", async (req, res) => {
  try {
    const { userId, date, footPrint } = req.body;
    if (!date || !footPrint || !userId) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const user = await User.find({ id: userId });
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const id = uuidv4();
    const newDate = new Date(date);
    const footPrintObj = new FootPrint({
      id,
      userId,
      date: newDate,
      footPrint,
    });
    await footPrintObj.save();
    res.status(200).json(footPrintObj);
  } catch (err) {
    res.status(400).json({ message: "Cannot post to database" });
  }
});

app.get("/footprint", async (req, res) => {
  try {
    const footPrints = await FootPrint.find();
    res.status(200).json(footPrints);
  } catch (err) {
    res.status(400).json({ message: "No footprints found" });
  }
});

app.get("/footprint/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const footPrint = await FootPrint.find({ userId: id });
    if (!footPrint) {
      return res.status(400).json({ message: "No footprints found" });
    }
    res.status(200).json(footPrint);
  } catch (err) {
    res.status(400).json({ message: "No footprints found" });
  }
});

app.get("/footprint/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const footPrints = await FootPrint.find();
    const footPrint = footPrints.filter(
      (footPrint) =>
        footPrint.date.toDateString() === new Date(date).toDateString()
    );
    if (!footPrint) {
      return res.status(400).json({ message: "No footprints found" });
    }
    res.status(200).json(footPrint);
  } catch (err) {
    res.status(400).json({ message: "No footprints found" });
  }
});

app.delete("/footprint/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const footPrint = await FootPrint.findOneAndDelete({ userId: id });
    if (!footPrint) {
      return res.status(400).json({ message: "No footprints found" });
    }
    res.status(200).json(footPrint);
  } catch (err) {
    res.status(400).json({ message: "No footprints found" });
  }
});

app.put("/footprint/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const footPrintObj = await FootPrint.findOneAndUpdate(
      { userId: id },
      req.body,
      { new: true }
    );
    if (!footPrintObj) {
      return res.status(400).json({ message: "No footprints found" });
    }
    res.status(200).json(footPrintObj);
  } catch (err) {
    res.status(400).json({ message: "No footprints found" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const newUser = new User({ id, name, email, password: hashedPassword });
    await newUser.save();
    res.status(200).json(newUser);
  } catch (err) {
    res.status(400).json({ message: "Cannot post to database" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id }, "hahaha", { expiresIn: "72h" });
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: "Cannot post to database" });
  }
});

app.post("/goal", async (req, res) => {
  try {
    const { userId, goal } = req.body;
    if (!userId || !goal) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const user = await User.find({ id: userId });
    if (user.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const id = uuidv4();
    const newGoal = new Goal({ id, userId, goal });
    await newGoal.save();
    res.status(200).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: "Cannot post to database" });
  }
});

app.get("/goal/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const goal = await Goal.find({ userId: id });
    if (goal.length() === 0) {
      return res.status(400).json({ message: "Goal not found" });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(400).json({ message: "Cannot get from database" });
  }
});
