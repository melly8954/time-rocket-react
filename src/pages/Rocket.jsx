import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function Rocket() {
    const navigate = useNavigate(); // useNavigate 훅 사용
    const accessToken = localStorage.getItem("accessToken");
    const [userData, setUserData] = useState({
        userId: null,
        email: "",
    });
    const [form, setForm] = useState({
        name: "",
        design: "",
        lockExpiredAt: "",
        receiverType: "",
        receiverEmail: "",
        content: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const updatedForm = { ...prev, [name]: value };

            // receiverType이 'self'일 경우, receiverEmail을 email로 설정
            if (name === "receiverType" && value === "self") {
                updatedForm.receiverEmail = userData.email;
            }

            return updatedForm;
        });
    };

    // 로켓 제작 메뉴뉴 렌더링 시 한번만 호출 (의존성 배열이 비어있기 때문)
    useEffect(() => {
        const fetchProfile = async () => {
            if (!accessToken) return;

            try {
                const res = await axios.get("/api/users/profile", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                });
                const { userId, email } = res.data.data;
                // userData의 일부 필드만 업데이트
                setUserData(prev => ({
                    ...prev,
                    userId,
                    email,
                }));
            } catch (err) {
                console.log(err);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 잠금 해제일 유효성 검사
        const selectedDate = new Date(form.lockExpiredAt);
        const currentDate = new Date();
        if (selectedDate < currentDate) {
            alert("잠금 해제일은 현재 시간보다 이후여야 합니다.");
            return;
        }

        const userId = userData.userId;
        try {
            await axios.post(`/api/rockets/users/${userId}`, form,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                });
            alert("로켓이 전송되었습니다!");
            navigate("/");
        } catch (err) {
            console.log(err);
            alert(err.response.data.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "400px" }}>
            <input type="text" name="name" placeholder="로켓 이름" value={form.name} onChange={handleChange} required />
            <input type="text" name="design" placeholder="디자인" value={form.design} onChange={handleChange} required />

            <input
                type="datetime-local"
                name="lockExpiredAt"
                value={form.lockExpiredAt}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 19)}
                step="1" // 초 단위 입력 허용
                required
            />

            <select name="receiverType" value={form.receiverType} onChange={handleChange} required>
                <option value="">수신자 유형 선택</option>
                <option value="self">본인에게 보내기</option>
                <option value="other">다른사람에게 보내기</option>
            </select>

            {form.receiverType === "other" && (
                <input
                    type="email"
                    name="receiverEmail"
                    placeholder="수신자 이메일"
                    value={form.receiverEmail}
                    onChange={handleChange}
                    required
                />
            )}

            <textarea name="content" placeholder="내용" value={form.content} onChange={handleChange} required />
            <button type="submit">로켓 보내기</button>
        </form>
    );
}

export default Rocket;
