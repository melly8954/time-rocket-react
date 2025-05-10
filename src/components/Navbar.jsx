import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import rocketImg from "../assets/rocket.png";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <img src={rocketImg} alt="로켓" />
                <span>TimeRocket</span>
            </div>
            <ul>
                <li><Link to="/">홈</Link></li>
                <li><Link to="/signup">회원가입</Link></li>
                <li><Link to="/signin">로그인</Link></li>
                <li><Link to="/rocket">로켓</Link></li>
                <li><Link to="/mypage">mypage</Link></li> {/* 홈화면이랑 합칠예정 */}
                <li><Link to="/temp-password">임시 비밀번호</Link></li> {/* test용으로 넣어둠 - 잘됨 */}
            </ul>
        </nav>
    );
}

export default Navbar;
