import React, { useState } from "react";
import axios from "axios";
import { FaSignInAlt, FaEnvelope, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

const Signin = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Enter all fields");

    setLoading(true);
    try {
      
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      
     
      onLogin(res.data.user);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-8 flex justify-center items-center gap-2">
          <FaSignInAlt className="text-indigo-500" /> Sign In
        </h2>
        
        <div className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-4 text-gray-600" />
            <input 
              className="w-full pl-10 p-3 bg-black border border-gray-700 rounded-xl text-white outline-none focus:border-indigo-500" 
              placeholder="Email" 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-4 text-gray-600" />
            <input 
              type="password" 
              className="w-full pl-10 p-3 bg-black border border-gray-700 rounded-xl text-white outline-none focus:border-indigo-500" 
              placeholder="Password" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400">
          New here? <span className="text-indigo-400 cursor-pointer hover:underline" onClick={switchToSignup}>Create Account</span>
        </p>
      </div>
    </div>
  );
};

export default Signin;