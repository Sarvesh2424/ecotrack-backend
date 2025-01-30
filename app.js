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

const goalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  goal: { type: Number, required: true },
});

const Goal = mongoose.model("Goal", goalSchema);

const reductionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  footprintId: { type: String, required: true },
  reduction: { type: Number, required: true },
});

const Reduction = mongoose.model("Reduction", reductionSchema);

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  post: { type: String, required: true },
  date: { type: Date, required: true },
});

const Post = mongoose.model("Post", postSchema);

app.post("/footprint", async (req, res) => {
  try {
    const { id, userId, date, footPrint } = req.body;
    if (!date || !footPrint || !userId) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const user = await User.find({ id: userId });
    if (user.length === null) {
      return res.status(404).json({ message: "User not found" });
    }
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
    if (footPrint.length === null) {
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
    const footPrint = await FootPrint.findOneAndDelete({ id });
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
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      "hahaha",
      {
        expiresIn: "72h",
      }
    );
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
    if (user.length === null) {
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
    if (goal.length === null) {
      return res.status(400).json({ message: "Goal not found" });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(400).json({ message: "Cannot get from database" });
  }
});

app.post("/reduction", async (req, res) => {
  try {
    const { userId, reduction, footprintId } = req.body;
    if (!userId || !reduction || !footprintId) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const user = await User.find({ id: userId });
    if (user.length === null) {
      return res.status(400).json({ message: "User not found" });
    }
    const id = uuidv4();
    const newReduction = new Reduction({ id, userId, footprintId, reduction });
    await newReduction.save();
    res.status(200).json(newReduction);
  } catch (err) {
    res.status(400).json({ message: "Cannot post to database" });
  }
});

app.get("/reduction/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const reduction = await Reduction.find({ footprintId: id });
    if (reduction.length === null) {
      return res.status(400).json({ message: "Reduction not found" });
    }
    res.status(200).json(reduction);
  } catch (error) {
    res.status(400).json({ message: "Cannot get from database" });
  }
});

app.get("/reduction/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const reduction = await Reduction.find({ userId: id });
    if (reduction.length === null) {
      return res.status(400).json({ message: "Reduction not found" });
    }
    res.status(200).json(reduction);
  } catch (error) {
    res.status(400).json({ message: "Cannot get from database" });
  }
});

app.delete("/reduction/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const reduction = await Reduction.findOneAndDelete({ footprintId: id });
    if (reduction.length === null) {
      return res.status(400).json({ message: "Reduction not found" });
    }
    res.status(200).json({ message: "Reduction deleted" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Cannot delete from database" });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Reduction.aggregate([
      {
        $group: {
          _id: "$userId",
          totalReduction: { $sum: "$reduction" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          totalReduction: 1,
          name: "$userInfo.name",
          email: "$userInfo.email",
        },
      },
      {
        $sort: { totalReduction: 1 },
      },
    ]);
    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(400).json({ message: "Cannot get from database" });
  }
});

app.post("/community", async (req, res) => {
  try {
    const { userId, post, date } = req.body;
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const communityPost = new Post({
      id: uuidv4(),
      userId,
      name: user.name,
      post,
      date,
    });
    await communityPost.save();
    res.status(200).json(communityPost);
  } catch (err) {
    res.status(400).json({ message: "Cannot create post" });
  }
});

app.get("/community", async (req, res) => {
  try {
    const communityPosts = await Post.find().sort({ date: -1 }).limit(15);
    res.status(200).json(communityPosts);
  } catch (err) {
    res.status(400).json({ message: "Cannot get from database" });
  }
});
