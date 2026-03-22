const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

//  MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log(" DB Error:", err));





  

//  Schema creation
const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  options: [
    {
      text: { type: String, required: true },
      votes: { type: Number, default: 0 },
    },
  ],

  expiryTime: {
    type: Date,
    required: true,
  },

  votesByIP: [
    {
      ip: String,
      optionIndex: Number,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Poll = mongoose.model("Poll", pollSchema);

// CREATE POLL
app.post("/api/polls", async (req, res) => {
  try {
    const { question, options, expiryTime } = req.body;

    if (!question || options.length < 2 || options.length > 4) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const poll = new Poll({
      question,
      options: options.map((o) => ({ text: o })),
      expiryTime,
    });

    await poll.save();
    res.status(201).json(poll);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET POLLS
app.get("/api/polls", async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VOTE
app.post("/api/polls/:id/vote", async (req, res) => {
  try {
    const { optionIndex } = req.body;

    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    //  Expired check
    if (new Date() > new Date(poll.expiryTime)) {
      return res.status(400).json({ message: "Poll expired" });
    }

    //  Get IP
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const existingVote = poll.votesByIP.find((v) => v.ip === ip);

    if (existingVote) {
      // remove previous vote
      poll.options[existingVote.optionIndex].votes -= 1;
      existingVote.optionIndex = optionIndex;
    } else {
      poll.votesByIP.push({ ip, optionIndex });
    }

    // add new vote
    poll.options[optionIndex].votes += 1;

    await poll.save();
    res.json(poll);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});