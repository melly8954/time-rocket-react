import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { fetchUserProfile } from "../utils/profile";
import DesignSelector, { designs } from "../components/ui/DesignSelector";
import "../style/Rocket.css";

function Rocket() {
    const navigate = useNavigate();
    const [currentDesignIdx, setCurrentDesignIdx] = useState(0);
    const [userData, setUserData] = useState({ userId: null, email: "" });
    const [form, setForm] = useState({
        rocketName: "",
        design: "",
        lockExpiredAt: "",
        receiverType: "",
        receiverEmail: "",
        content: "",
    });

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const { userId, email } = await fetchUserProfile();
                setUserData({ userId, email });
            } catch (err) {
                console.error("프로필 불러오기 실패", err);
            }
        };
        loadUserProfile();
    }, []);

    useEffect(() => {
        // 선택된 디자인의 URL을 부모 컴포넌트에 반영
        setForm((prev) => ({
            ...prev,
            design: designs[currentDesignIdx].imgUrl,  // Use currentDesignIdx here
        }));
    }, [currentDesignIdx]);  // currentDesignIdx가 변경될 때만 실행되도록

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "receiverType") {
            setForm((prev) => ({
                ...prev,
                receiverType: value,
                receiverEmail: value === "self" ? userData.email : "", // self면 자동입력, 아니면 초기화
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleTempSave = async () => {
    try {
        const selectedDate = new Date(form.lockExpiredAt);
        const now = new Date();
        if (selectedDate < now) {
            alert("잠금 해제일은 현재 시간보다 이후여야 합니다.");
            return;
        }

        await api.post(`/rockets/users/${userData.userId}/temp`, form);
        alert("임시 저장되었습니다.");
    } catch (err) {
        console.error("임시 저장 실패", err);
        alert(err.response?.data?.message || "임시 저장 중 오류가 발생했습니다.");
    }
};

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
                    <label htmlFor="rocketName">로켓 이름</label>
                </div>
                <div className="rocket-temp-btn-group">
                    <button type="button" onClick={handleTempSave} className="btn-green">임시 저장</button>
                    <button type="button" className="btn-green">불러오기</button>
                </div>

                <input
                    type="text"
                    name="rocketName" // 여기서 name을 "rocketName"으로 변경
                    id="rocketName"
                    value={form.rocketName} // form.rocketName을 사용
                    onChange={handleChange}

                />


                <DesignSelector
                    currentIdx={currentDesignIdx}
                    setCurrentIdx={setCurrentDesignIdx}
                />

                <label htmlFor="lockExpiredAt">잠금 해제일</label>
                <input
                    type="datetime-local"
                    name="lockExpiredAt"
                    id="lockExpiredAt"
                    value={form.lockExpiredAt}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 19)}
                    step="1"
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
                        />
                    </div>
                )}

                <label htmlFor="content">내용</label>
                <textarea
                    name="content"
                    id="content"
                    value={form.content}
                    onChange={handleChange}
                />

                <button type="submit" className="btn-submit">
                    로켓 보내기
                </button>
            </form>
        </div>
    );
}

export default Rocket;
