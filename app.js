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
    const footPrintObj = new FootPrint({ id, date, footPrint });
    await footPrintObj.save();
    res.status(200).json(footPrintObj);
  } catch (err) {
    res.status(400).json({ message: "No expenses found" });
  }
});
