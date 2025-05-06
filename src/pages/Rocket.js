import React, { useEffect, useState } from "react";
import api from "../api/api";

function Rocket() {
    const [text, setText] = useState("");

    useEffect(() => {
        api.get("/rockets")
            .then(res => setText(res.data))
            .catch(() => setText("에러 발생"));
    }, []);

    return (
        <div style={{textAlign: "center"}}>
            <h2>로켓 페이지</h2>
            <img src={require("../assets/rocket.png")} alt="로켓" style={{width: 120, margin: "20px 0"}} />
            <div style={{fontSize: "1.3rem", color: "#0ff"}}>{text}</div>
        </div>
    );
}

export default Rocket;
