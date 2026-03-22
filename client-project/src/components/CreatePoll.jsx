import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaVoteYea } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdAccessTime, MdOutlineTimerOff } from "react-icons/md";

export default function CreatePoll({ refreshPolls, onClose }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [startTime, setStartTime] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (
      !question.trim() ||
      options.some((o) => !o.trim()) ||
      !startTime ||
      !expiryTime
    ) {
      return toast.error("Fill all fields!");
    }

    if (new Date(startTime) >= new Date(expiryTime)) {
      return toast.error("End time must be after start time");
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/polls", {
        question,
        options,
        startTime,
        expiryTime,
      });

      toast.success("Poll Created 🚀");

      setQuestion("");
      setOptions(["", ""]);
      setStartTime("");
      setExpiryTime("");

      refreshPolls && refreshPolls();
      onClose && onClose();

    } catch (err) {
      toast.error("Error creating poll");
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    if (options.length >= 4) return toast.error("Max 4 options allowed");
    setOptions([...options, ""]);
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 p-6 rounded-2xl w-full max-w-md mx-auto mb-10 shadow-lg">

      <h2 className="text-2xl font-bold text-green-400 mb-5 text-center flex items-center justify-center gap-2">
        <FaVoteYea /> Create Poll
      </h2>

      {/* Question */}
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question..."
        className="w-full p-3 mb-4 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      />

   
      {options.map((opt, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            value={opt}
            onChange={(e) => {
              const newOpts = [...options];
              newOpts[i] = e.target.value;
              setOptions(newOpts);
            }}
            placeholder={`Option ${i + 1}`}
            className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white"
          />
          {options.length > 2 && (
            <button
              onClick={() => removeOption(i)}
              className="text-red-400 hover:scale-110"
            >
              <IoClose size={20} />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addOption}
        className="text-green-400 mb-4 hover:underline"
      >
        + Add Option
      </button>

      {/* TIME SECTION */}
      <div className="grid grid-cols-2 gap-3 mb-4">

        
        <div>
          <label className="text-sm text-gray-400 mb-1 flex items-center gap-1">
            <MdAccessTime /> Start Time
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white focus:ring-2 focus:ring-green-500"
          />
        </div>

       
        <div>
          <label className="text-sm text-gray-400 mb-1 flex items-center gap-1">
            <MdOutlineTimerOff /> End Time
          </label>
          <input
            type="datetime-local"
            value={expiryTime}
            onChange={(e) => setExpiryTime(e.target.value)}
            className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white focus:ring-2 focus:ring-red-500"
          />
        </div>

      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-green-400 to-green-600 p-3 rounded-lg text-black font-semibold hover:scale-105 transition flex items-center justify-center gap-2"
      >
        <FaVoteYea />
        {loading ? "Creating..." : "Create Poll"}
      </button>
    </div>
  );
}