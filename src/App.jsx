import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Home from './pages/Home';
import SignUp from './pages/Signup';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/rocket" element={<div>로켓 제작 페이지</div>} />
        <Route path="/display" element={<div>진열장 페이지</div>} />
        <Route path="/chest" element={<div>보관함 페이지</div>} />
        <Route path="/community" element={<div>커뮤니티 페이지</div>} />
      </Routes>
    </Router>
    
  )
}

export default App
