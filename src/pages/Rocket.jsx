import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { fetchUserProfile } from "../utils/profile";
import "../style/Rocket.css";

function Rocket() {
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");

    const [userData, setUserData] = useState({ userId: null, email: "" });
    const [form, setForm] = useState({
        name: "",
        design: "",
        lockExpiredAt: "",
        receiverType: [],
        receiverEmail: "",
        content: "",
    });

    const isFormComplete = Object.values(form).every((val) => val.trim() !== "");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox" && name === "receiverType") {
            setForm((prev) => {
                const updatedTypes = checked
                    ? [...prev.receiverType, value]
                    : prev.receiverType.filter((v) => v !== value);

                return {
                    ...prev,
                    receiverType: updatedTypes,
                    receiverEmail: updatedTypes.includes("self") ? userData.email : prev.receiverEmail,
                };
            });
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleTempSave = () => {
        alert("임시 저장되었습니다.");
    };

    const handleLoad = () => {

    };

    useEffect(() => {
        const loadUserProfile = async () => {
            if (!accessToken) return;
            try {
                const { userId, email } = await fetchUserProfile();
                setUserData({ userId, email });
            } catch (err) {
                console.error("프로필 불러오기 실패", err);
            }
        };
        loadUserProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedDate = new Date(form.lockExpiredAt);
        const now = new Date();
        if (selectedDate < now) {
            alert("잠금 해제일은 현재 시간보다 이후여야 합니다.");
            return;
        }

        try {
            await api.post(`/rockets/users/${userData.userId}`, form);
            alert("로켓이 전송되었습니다!");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert(err.response.data.message);
        }
    };

    return (
        <div className="rocket-form-container">
            <form className="rocket-form" onSubmit={handleSubmit}>
                <div className="form-header">
                    <label htmlFor="name">로켓 이름</label>
                    <button type="button" onClick={handleTempSave} className="btn-green">임시 저장</button>
                    <button type="button" onClick={handleLoad} className="btn-green">불러오기</button>
                </div>
                <input type="text" name="name" id="name" value={form.name} onChange={handleChange} required />

                <label htmlFor="design">로켓 디자인</label>
                <input type="text" name="design" id="design" value={form.design} onChange={handleChange} required />

                <label htmlFor="lockExpiredAt">잠금 해제일</label>
                <input
                    type="datetime-local"
                    name="lockExpiredAt"
                    id="lockExpiredAt"
                    value={form.lockExpiredAt}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 19)}
                    step="1"
                    required
                />

                <label>수신자 유형</label>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="receiverType"
                            value="self"
                            checked={form.receiverType === "self"}
                            onChange={(e) => {
                                const value = e.target.value;
                                setForm((prev) => ({
                                    ...prev,
                                    receiverType: value,
                                    receiverEmail: userData.email, // 본인 이메일 자동 입력
                                }));
                            }}
                        />
                        본인에게 보내기
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="receiverType"
                            value="other"
                            checked={form.receiverType === "other"}
                            onChange={(e) => {
                                const value = e.target.value;
                                setForm((prev) => ({
                                    ...prev,
                                    receiverType: value,
                                    receiverEmail: "", // 직접 입력
                                }));
                            }}
                        />
                        다른 사람에게 보내기
                    </label>
                </div>

                {form.receiverType === "other" && (
                    <div>
                        <label>수신자 이메일</label>
                        <input
                            type="email"
                            name="receiverEmail"
                            placeholder="수신자 이메일"
                            value={form.receiverEmail}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <label htmlFor="content">내용</label>
                <textarea
                    name="content"
                    id="content"
                    value={form.content}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={!isFormComplete} className="btn-submit">
                    로켓 보내기
                </button>
            </form>
        </div>
    );
}

export default Rocket;
