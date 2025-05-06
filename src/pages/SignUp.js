import React, { useState } from "react";
import api from "../api/api";

function SignUp() {
    const [form, setForm] = useState({
        email: "",
        emailVerified: false,
        emailCode: "",
        password: "",
        passwordCheck: "",
        nickname: "",
        nicknameChecked: false,
    });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailStep, setEmailStep] = useState("input"); // input, sent, verified

    const onChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.name === "nickname") {
            setForm(f => ({ ...f, nicknameChecked: false }));
        }
    };

    const sendEmailCode = async () => {
        setLoading(true);
        setMsg("");
        try {
            await api.post("/emails", { email: form.email });
            setMsg("인증번호가 이메일로 발송되었습니다.");
            setEmailStep("sent");
        } catch {
            setMsg("이메일 발송 실패, 이메일 주소를 확인하세요.");
        }
        setLoading(false);
    };

    const verifyEmailCode = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await api.post("/emails/verify-code", {
                email: form.email,
                code: form.emailCode
            });
            if (res.data === "Verified") {
                setForm(f => ({ ...f, emailVerified: true }));
                setMsg("이메일 인증 성공!");
                setEmailStep("verified");
            } else {
                setMsg("인증번호가 올바르지 않습니다.");
            }
        } catch {
            setMsg("인증 확인 실패");
        }
        setLoading(false);
    };

    const checkNickname = async () => {
        setLoading(true);
        setMsg("");
        try {
            await api.get(`/users/duplicate-nickname/${form.nickname}`);
            setForm(f => ({ ...f, nicknameChecked: true }));
            setMsg("사용 가능한 닉네임입니다!");
        } catch {
            setForm(f => ({ ...f, nicknameChecked: false }));
            setMsg("이미 사용 중인 닉네임입니다.");
        }
        setLoading(false);
    };

    const onSubmit = async e => {
        e.preventDefault();
        setMsg("");
        if (!form.emailVerified) {
            setMsg("이메일 인증을 완료해주세요.");
            return;
        }
        if (!form.nicknameChecked) {
            setMsg("닉네임 중복 확인을 해주세요.");
            return;
        }
        if (!form.password || form.password.length < 6) {
            setMsg("비밀번호는 6자 이상이어야 합니다.");
            return;
        }
        if (form.password !== form.passwordCheck) {
            setMsg("비밀번호가 일치하지 않습니다.");
            return;
        }
        try {
            await api.post("/users", {
                email: form.email,
                password: form.password,
                nickname: form.nickname
            });
            setMsg("🚀 회원가입 성공! 우주로 출발합니다!");
        } catch (err) {
            setMsg("❌ 실패: " + (err.response?.data?.message || "오류"));
        }
    };

    return (
        <div>
            <h2>회원가입</h2>
            <form onSubmit={onSubmit} autoComplete="off">
                {/* 이메일 + 인증 */}
                <div className="form-group">
                    <input
                        name="email"
                        placeholder="이메일"
                        value={form.email}
                        onChange={onChange}
                        autoComplete="off"
                        disabled={form.emailVerified}
                        required
                        type="email"
                    />
                    <button
                        type="button"
                        onClick={sendEmailCode}
                        disabled={
                            loading ||
                            !form.email ||
                            form.emailVerified ||
                            emailStep === "sent"
                        }
                        style={{ marginLeft: 8 }}
                    >
                        인증번호 발송
                    </button>
                </div>
                {/* 인증번호 입력 */}
                {emailStep === "sent" && !form.emailVerified && (
                    <div className="form-group">
                        <input
                            name="emailCode"
                            placeholder="인증번호"
                            value={form.emailCode}
                            onChange={onChange}
                            autoComplete="off"
                            required
                        />
                        <button
                            type="button"
                            onClick={verifyEmailCode}
                            disabled={loading || !form.emailCode}
                            style={{ marginLeft: 8 }}
                        >
                            인증번호 확인
                        </button>
                    </div>
                )}
                {/* 이메일 인증 성공 안내 */}
                {form.emailVerified && (
                    <div className="form-group" style={{ color: "#0ff", fontWeight: 600 }}>
                        이메일 인증 완료!
                    </div>
                )}

                {/* 비밀번호 */}
                {form.emailVerified && (
                    <>
                        <div className="form-group">
                            <input
                                name="password"
                                type="password"
                                placeholder="비밀번호 (6자 이상)"
                                value={form.password}
                                onChange={onChange}
                                autoComplete="off"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                name="passwordCheck"
                                type="password"
                                placeholder="비밀번호 확인"
                                value={form.passwordCheck}
                                onChange={onChange}
                                autoComplete="off"
                                required
                            />
                            {form.password && form.passwordCheck && form.password !== form.passwordCheck && (
                                <div style={{ color: "red", fontSize: 13 }}>비밀번호가 일치하지 않습니다.</div>
                            )}
                        </div>
                        {/* 닉네임 + 중복검사 */}
                        <div className="form-group">
                            <input
                                name="nickname"
                                placeholder="닉네임"
                                value={form.nickname}
                                onChange={onChange}
                                autoComplete="off"
                                required
                            />
                            <button
                                type="button"
                                onClick={checkNickname}
                                disabled={loading || !form.nickname}
                                style={{ marginLeft: 8 }}
                            >
                                닉네임 중복 확인
                            </button>
                        </div>
                        {form.nicknameChecked && (
                            <div style={{ color: "#0ff", fontWeight: 600 }}>
                                사용 가능한 닉네임입니다!
                            </div>
                        )}
                        {/* 회원가입 버튼 */}
                        <button
                            type="submit"
                            disabled={
                                !form.emailVerified ||
                                !form.nicknameChecked ||
                                !form.password ||
                                !form.passwordCheck ||
                                form.password !== form.passwordCheck ||
                                form.password.length < 6
                            }
                            style={{ marginTop: 12 }}
                        >
                            🚀 가입하기
                        </button>
                    </>
                )}
                <div className="message" style={{ marginTop: 16 }}>{msg}</div>
            </form>
        </div>
    );
}

export default SignUp;
