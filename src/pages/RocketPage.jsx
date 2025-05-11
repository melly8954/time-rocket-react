import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import SpaceBackground from '../components/ui/SpaceBackground';
import RocketList from '../components/rockets/RocketList';
import RocketDetail from '../components/rockets/RocketDetail';
import RocketCreator from '../components/rockets/RocketCreator';

function Rocket() {
    const { action, id } = useParams();
    const navigate = useNavigate();
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

    // 로켓 제작 메뉴 렌더링 시 한번만 호출 (의존성 배열이 비어있기 때문)
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
    }, [accessToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            alert(err.response?.data?.message || "로켓 전송에 실패했습니다.");
        }
    };

    // 본격적인 렌더링 시작
    return (
        <div className="rocket-page">
            {/* SpaceBackground를 전체 페이지에 적용 */}
            <SpaceBackground />
            
            {action === 'create' ? (
                <div className="rocket-create-container">
                    <RocketCreator 
                        userData={userData} 
                        onSubmit={handleSubmit} 
                        initialForm={form}
                        onChange={handleChange}
                    />
                </div>
            ) : action === 'detail' && id ? (
                <RocketDetail id={id} userData={userData} />
            ) : id ? (
                <RocketNotFound />
            ) : (
                <RocketList userData={userData} />
            )}
        </div>
    );
}

// 로켓이 존재하지 않을 때 표시할 컴포넌트
const RocketNotFound = () => {
    const navigate = useNavigate();
  
    return (
        <div className="rocket-not-found">
            <div className="not-found-content">
                <img src="/src/assets/rocket.png" alt="로켓" className="not-found-rocket" />
                <h2>로켓을 찾을 수 없습니다</h2>
                <p>요청하신 로켓이 존재하지 않거나 접근할 수 없습니다.</p>
                <div className="not-found-actions">
                    <button onClick={() => navigate('/rockets')} className="back-to-list">
                        로켓 목록으로 돌아가기
                    </button>
                    <button onClick={() => navigate('/rockets/create')} className="create-new">
                        새 로켓 만들기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Rocket;
