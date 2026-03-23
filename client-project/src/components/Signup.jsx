import React, { useState } from "react";
import axios from "axios";
import { FaUserPlus, FaEnvelope, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

const Signup = ({ switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) return toast.error("Fill all fields");

    setLoading(true);
    try {
     
      await axios.post("http://localhost:5000/api/auth/register", { email, password });
      toast.success("Account created! Now you can login.");
      switchToLogin(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-8 flex justify-center items-center gap-2">
          <FaUserPlus className="text-indigo-500" /> Register Please!!
        </h2>
        
        <div className="space-y-4">
          <input className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white outline-none focus:border-indigo-500" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white outline-none focus:border-indigo-500" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleSignup} disabled={loading} className="w-full bg-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
            {loading ? "Registering..." : "Create Account"}
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400">
          Already have an account? <span className="text-indigo-400 cursor-pointer hover:underline" onClick={switchToLogin}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;