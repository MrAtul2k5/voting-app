import { useEffect, useState, useRef } from "react";
import axios from "axios";
import CreatePoll from "./CreatePoll";
import toast from "react-hot-toast";

// ✅ BASE URL
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://voting-app.onrender.com";

export default function PollList() {
  const [polls, setPolls] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const createRef = useRef(null);

  const [storedVotes, setStoredVotes] = useState(
    JSON.parse(localStorage.getItem("votes")) || {}
  );

  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [polls]);

  const fetchPolls = async () => {
    const res = await axios.get(`${BASE_URL}/api/polls`);
    setPolls(res.data);
  };

  const updateTime = () => {
    const newTime = {};
    polls.forEach((poll) => {
      const diff = new Date(poll.expiryTime) - new Date();
      newTime[poll._id] =
        diff <= 0
          ? "Expired"
          : `${Math.floor(diff / 60000)}m ${Math.floor(
              (diff / 1000) % 60
            )}s`;
    });
    setTimeLeft(newTime);
  };

  const vote = async (pollId, index, expired) => {
    if (expired) return toast.error("Poll expired");

    try {
      await axios.post(`${BASE_URL}/api/polls/${pollId}/vote`, {
        optionIndex: index,
      });

      const updatedVotes = { ...storedVotes, [pollId]: index };
      setStoredVotes(updatedVotes);
      localStorage.setItem("votes", JSON.stringify(updatedVotes));

      toast.success("Vote submitted!");
      fetchPolls();
    } catch {
      toast.error("Voting failed");
    }
  };

  return (
    <div>
      {showCreate && (
        <div ref={createRef}>
          <CreatePoll refreshPolls={fetchPolls} />
        </div>
      )}

      {polls.map((poll) => {
        const expired = new Date(poll.expiryTime) <= new Date();

        return (
          <div key={poll._id}>
            <h3>{poll.question}</h3>

            {poll.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => vote(poll._id, i, expired)}
              >
                {opt.text} ({opt.votes})
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}