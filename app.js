const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://10650sarvesh:choc2424@cluster0.wktvu.mongodb.net/ecotrack"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  });

app.listen(3000, () => {
  console.log("Server is running on http://127.0.0.1:3000");
});

const footPrintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  footPrint: { type: Number, required: true },
});

const FootPrint = mongoose.model("FootPrint", footPrintSchema);

app.post("/footprint", async (req, res) => {
  try {
    const { date, footPrint } = req.body;
    if (!date || !footPrint) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const id = uuidv4();
    const newDate = new Date(date);
    const footPrintObj = new FootPrint({ id, date: newDate, footPrint });
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
    const footPrint = await FootPrint.findOne({ id });
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
      { id: id },
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
