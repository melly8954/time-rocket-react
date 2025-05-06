import React, { useState } from "react";
import api from "../api/api";

function SignIn() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");

    const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setMessage("");
        try {
            // 실제 로그인 엔드포인트에 맞게 수정 필요!
            const res = await api.post("/auth/signin", form);
            // JWT 토큰 저장 등 처리
            setMessage("🛰️ 로그인 성공!");
        } catch (err) {
            setMessage("❌ 로그인 실패: " + (err.response?.data?.message || "오류"));
        }
    };

    return (
        <div>
            <h2>로그인</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <input name="email" placeholder="이메일" value={form.email} onChange={onChange} autoComplete="off" />
                </div>
                <div className="form-group">
                    <input name="password" type="password" placeholder="비밀번호" value={form.password} onChange={onChange} autoComplete="off" />
                </div>
                <button type="submit">🛰️ 로그인</button>
            </form>
            <div className="message">{message}</div>
        </div>
    );
}

export default SignIn;
