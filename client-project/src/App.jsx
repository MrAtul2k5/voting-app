import React, { useState } from "react";
import Signin from "./components/Signin.jsx";
import Signup from "./components/Signup.jsx";
import PollList from "./components/PollList.jsx";
import { Toaster } from "react-hot-toast";

function App() {
 
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")) || null);
  const [view, setView] = useState("login");

  const handleLogin = (userData) => {
    
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
   
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Toaster position="top-center" />
      
      {!user ? (
        view === "login" ? (
          <Signin 
            onLogin={handleLogin} 
            switchToSignup={() => setView("signup")} 
          />
        ) : (
          <Signup 
            switchToLogin={() => setView("login")} 
          />
        )
      ) : (
        <PollList user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;