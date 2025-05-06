import React, { useState } from "react";
import api from "../api/api";

function TempPassword() {
    const [email, setEmail] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [message, setMessage] = useState("");

    const sendTempPassword = async () => {
        try {
            const res = await api.post("/emails/temp-password", { email });
            setMessage(res.data);
        } catch (err) {
            setMessage(err.response?.data || "발송 실패");
        }
    };

    const verifyTempPassword = async () => {
        try {
            const res = await api.post("/emails/verify-temporary-password", {
                email,
                tempPassword
            });
            setMessage(res.data);
        } catch (err) {
            setMessage(err.response?.data || "검증 실패");
        }
    };

    return (
        <div>
            <h2>임시 비밀번호 발급/검증</h2>
            <div className="form-group">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일" />
            </div>
            <button onClick={sendTempPassword}>임시 비밀번호 발송</button>
            <div className="form-group">
                <input value={tempPassword} onChange={e => setTempPassword(e.target.value)} placeholder="임시 비밀번호" />
            </div>
            <button onClick={verifyTempPassword}>임시 비밀번호 확인</button>
            <div className="message">{message}</div>
        </div>
    );
}

export default TempPassword;
