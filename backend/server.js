const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./model/User");

const app = express();
app.use(cors({
  origin:"https://voting-app-woad.vercel.app/",
  methods: ["GET", "POST", "PUT", "DELETE"],

}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "career_nav_secret";

//  MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log(" DB Error:", err));





app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    res.status(400).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



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
      userId: String, 
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
    const { optionIndex, userId } = req.body; 

    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

   
    if (new Date() > new Date(poll.expiryTime)) {
      return res.status(400).json({ message: "Poll expired" });
    }

  
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const existingVote = poll.votesByIP.find((v) => v.ip === ip || v.userId === userId);

    if (existingVote) {
      
      poll.options[existingVote.optionIndex].votes -= 1;
      existingVote.optionIndex = optionIndex;
      existingVote.userId = userId; 
    } else {
      poll.votesByIP.push({ ip, optionIndex, userId });
    }

    
    poll.options[optionIndex].votes += 1;

    await poll.save();
    res.json(poll);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});