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
    try {
      const res = await axios.get("http://localhost:5000/api/polls");
      setPolls(res.data);
    } catch (err) {
      toast.error("Failed to load polls");
    }
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
        newTime[poll._id] = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${secs}s`;
      }
    });
    setTimeLeft(newTime);
  };

  const handleCreateClick = () => {
    setShowCreate(true);
    setTimeout(() => {
      createRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const vote = async (pollId, index, expired) => {
    if (expired) return toast.error("Poll expired");
    if (storedVotes[pollId] !== undefined) return toast.error("Already voted!");

    try {
      await axios.post(`http://localhost:5000/api/polls/${pollId}/vote`, { optionIndex: index });
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
    return winners.length > 1 ? "Draw" : winners[0].text;
  };

  const filteredPolls = polls.filter((poll) => {
    const isExpired = new Date(poll.expiryTime) <= new Date();
    if (filter === "active") return !isExpired;
    if (filter === "expired") return isExpired;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 pb-12">
      
      <div className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
          <FaChartBar /> Voting App
        </h1>

        <div className="flex gap-3">
          
          {filter === "all" && (
            <button
              onClick={handleCreateClick}
              className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium"
            >
              <FaPlus /> Create Poll
            </button>
          )}

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Polls</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

     
      {showCreate && (
        <div ref={createRef} className="animate-in fade-in slide-in-from-top-4 duration-300">
          <CreatePoll refreshPolls={fetchPolls} onClose={() => setShowCreate(false)} />
        </div>
      )}

     
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredPolls.map((poll) => {
          const expired = new Date(poll.expiryTime) <= new Date();
          const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

          return (
            <div key={poll._id} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between hover:border-gray-600 transition-colors shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${expired ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                    {expired ? "Closed" : "Live"}
                  </span>
                  <span className="text-yellow-500 text-xs font-mono flex items-center gap-1">
                    <MdAccessTime /> {timeLeft[poll._id]}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1">{poll.question}</h3>
                <p className="text-xs text-gray-500 mb-4 tracking-wide">TOTAL VOTES: {totalVotes}</p>

                {expired && (
                  <div className="bg-green-500/10 border border-green-500/20 p-2 rounded-lg mb-4 flex items-center gap-2 text-green-400 text-sm font-bold">
                    <FaTrophy className="text-yellow-500" /> Winner: {getResult(poll)}
                  </div>
                )}

                <div className="space-y-3">
                  {poll.options.map((opt, i) => {
                    const percent = totalVotes ? ((opt.votes / totalVotes) * 100).toFixed(0) : 0;
                    const isVoted = storedVotes[poll._id] === i;

                    return (
                      <div key={i} className="group">
                        <button
                          onClick={() => vote(poll._id, i, expired)}
                          disabled={expired || storedVotes[poll._id] !== undefined}
                          className={`w-full p-3 rounded-xl flex justify-between items-center transition-all border ${
                            isVoted 
                              ? "bg-green-500 border-green-400 text-black font-bold" 
                              : expired 
                                ? "bg-gray-800 border-transparent text-gray-500 opacity-60" 
                                : "bg-gray-800 border-gray-700 hover:border-indigo-500"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {opt.text}
                            {isVoted && <FaCheckCircle />}
                          </span>
                          <span className="text-xs">{opt.votes}</span>
                        </button>

                        <div className="w-full bg-gray-800 h-1.5 mt-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${isVoted ? 'bg-black/40' : 'bg-indigo-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}