import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import StarBackground from "./components/StarBackground";
import Home from "./pages/Home";
import Mypage from "./pages/Mypage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Rocket from "./pages/Rocket";
import TempPassword from "./pages/TempPassword";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <StarBackground />
            <Navbar />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/mypage" element={<Mypage />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/rocket" element={<Rocket />} />
                    <Route path="/temp-password" element={<TempPassword />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
