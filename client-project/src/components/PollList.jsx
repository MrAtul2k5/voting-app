import { useEffect, useState, useRef } from "react";
import axios from "axios";
import CreatePoll from "./CreatePoll";
import toast from "react-hot-toast";
import { FaChartBar, FaPlus, FaCheckCircle, FaTrophy } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { IoMdTime } from "react-icons/io";

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
    const res = await axios.get("http://localhost:5000/api/polls");
    setPolls(res.data);
  };

  const updateTime = () => {
    const newTime = {};

    polls.forEach((poll) => {
      const diff = new Date(poll.expiryTime) - new Date();

      if (diff <= 0) newTime[poll._id] = "Expired";
      else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        newTime[poll._id] =
          hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${secs}s`;
      }
    });

    setTimeLeft(newTime);
  };

  const handleCreateClick = () => {
    setShowCreate(true);

    setTimeout(() => {
      createRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const vote = async (pollId, index, expired) => {
    if (expired) return toast.error("Poll expired");

    try {
      await axios.post(
        `http://localhost:5000/api/polls/${pollId}/vote`,
        { optionIndex: index }
      );

      const updatedVotes = { ...storedVotes, [pollId]: index };
      setStoredVotes(updatedVotes);
      localStorage.setItem("votes", JSON.stringify(updatedVotes));

      toast.success("Vote submitted!");
      fetchPolls();
    } catch (err) {
      toast.error("Voting failed");
    }
  };

  const getResult = (poll) => {
    const max = Math.max(...poll.options.map((o) => o.votes));
    const winners = poll.options.filter((o) => o.votes === max);

    return winners.length > 1
      ? "Draw"
      : winners[0].text;
  };

  const filteredPolls = polls.filter((poll) => {
    if (filter === "active") return new Date(poll.expiryTime) > new Date();
    if (filter === "expired") return new Date(poll.expiryTime) <= new Date();
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6">

   
      <div className="fixed top-0 left-0 w-full z-50 
        bg-black/70 backdrop-blur-md 
        border-b border-gray-800 
        px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaChartBar /> Voting App
        </h1>

        <div className="flex gap-3">
          <button
            onClick={handleCreateClick}
            className="bg-indigo-500 px-4 py-2 rounded hover:scale-105 transition flex items-center gap-2"
          >
            <FaPlus /> Create Poll
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 p-2 rounded"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

     
      {showCreate && (
        <div ref={createRef} className="mb-10">
          <CreatePoll refreshPolls={fetchPolls} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {filteredPolls.map((poll) => {
          const expired = new Date(poll.expiryTime) <= new Date();

          const totalVotes = poll.options.reduce(
            (acc, opt) => acc + opt.votes,
            0
          );

          return (
            <div
              key={poll._id}
              className="bg-gray-900 p-5 rounded-xl border border-gray-700"
            >
              {/* Status  */}
              <div className="flex justify-between mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    expired
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  <IoMdTime />
                  {expired ? "Expired" : "Active"}
                </span>

                <span className="text-yellow-400 text-sm flex items-center gap-1">
                  <MdAccessTime /> {timeLeft[poll._id]}
                </span>
              </div>

             
              <h3 className="mb-2 text-lg font-semibold">
                {poll.question}
              </h3>

             
              <p className="text-sm text-gray-400 mb-2">
                Total Votes: {totalVotes}
              </p>

              
              {expired && (
                <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                  <FaTrophy /> {getResult(poll)}
                </p>
              )}

              {/* Options */}
              {poll.options.map((opt, i) => {
                const percent = totalVotes
                  ? ((opt.votes / totalVotes) * 100).toFixed(0)
                  : 0;

                return (
                  <div key={i} className="mb-3">
                    <button
                      onClick={() => vote(poll._id, i, expired)}
                      disabled={expired}
                      className={`w-full p-3 rounded-xl flex justify-between items-center transition
                        ${
                          expired
                            ? "bg-gray-600"
                            : storedVotes[poll._id] === i
                            ? "bg-green-500 scale-105"
                            : "bg-indigo-500 hover:bg-indigo-600"
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        {opt.text}
                        {storedVotes[poll._id] === i && (
                          <FaCheckCircle />
                        )}
                      </span>
                      <span>{opt.votes}</span>
                    </button>

                   
                    <div className="w-full bg-gray-700 h-2 mt-1 rounded">
                      <div
                        className="bg-green-400 h-2 rounded transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}