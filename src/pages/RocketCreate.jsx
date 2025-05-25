import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { fetchUserProfile } from "../utils/profile";
import DesignSelector, { designs } from "../components/ui/DesignSelector";
import "../style/RocketCreate.css";

function RocketCreate() {
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
    
    // 파일 업로드 관련 상태
    const [files, setFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileInputRef = useRef(null);
    
    // 스텝 관리 상태
    const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3 세 단계
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        // 선택된 디자인의 URL을 폼 상태에 반영
        setForm((prev) => ({
            ...prev,
            design: designs[currentDesignIdx].imgUrl,
        }));
    }, [currentDesignIdx]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "receiverType") {
            setForm((prev) => ({
                ...prev,
                receiverType: value,
                receiverEmail: value === "self" ? userData.email : "",
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        
        // 파일 이름 화면에 표시
        const fileNames = selectedFiles.map(file => ({
            name: file.name,
            size: formatFileSize(file.size)
        }));
        setUploadedFiles(fileNames);
    };
    
    const formatFileSize = (size) => {
        if (size < 1024) return size + ' bytes';
        else if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
        else return (size / 1048576).toFixed(1) + ' MB';
    };
    
    const removeFile = (index) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
        
        const updatedFileNames = [...uploadedFiles];
        updatedFileNames.splice(index, 1);
        setUploadedFiles(updatedFileNames);
    };

    const handleTempSave = async () => {
        try {
            if (form.lockExpiredAt) {
                const selectedDate = new Date(form.lockExpiredAt);
                const now = new Date();
                if (selectedDate < now) {
                    alert("잠금 해제일은 현재 시간보다 이후여야 합니다.");
                    return;
                }
            }

            await api.post(`/rockets/users/${userData.userId}/temp`, form);
            alert("임시 저장되었습니다.");
        } catch (err) {
            console.error("임시 저장 실패", err);
            alert(err.response?.data?.message || "임시 저장 중 오류가 발생했습니다.");
        }
    };

    const handleLoadTempRocket = async () => {
        try {
            if (!userData.userId) {
                alert("사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
                return;
            }
            
            const response = await api.get(`/rockets/users/${userData.userId}/temp`);
            const tempRocket = response.data.data;
            
            if (!tempRocket) {
                alert("임시저장된 로켓이 없습니다.");
                return;
            }
            
            // 임시저장된 데이터를 폼에 설정
            setForm({
                rocketName: tempRocket.rocketName || "",
                design: tempRocket.design || "",
                lockExpiredAt: tempRocket.lockExpiredAt ? new Date(tempRocket.lockExpiredAt).toISOString().slice(0, 16) : "",
                receiverType: tempRocket.receiverType || "",
                receiverEmail: tempRocket.receiverEmail || "",
                content: tempRocket.content || "",
            });
            
            // 디자인 인덱스 찾기
            const designIndex = designs.findIndex(d => d.imgUrl === tempRocket.design);
            if (designIndex !== -1) {
                setCurrentDesignIdx(designIndex);
            }
            
            alert("임시저장된 로켓을 불러왔습니다.");
        } catch (err) {
            console.error("임시 저장 불러오기 실패", err);
            alert(err.response?.data?.message || "임시 저장 불러오기 중 오류가 발생했습니다.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 필수 입력값 확인
        if (!form.rocketName) {
            alert("로켓 이름을 입력해주세요.");
            setCurrentStep(1);
            return;
        }
        
        if (!form.lockExpiredAt) {
            alert("잠금 해제일을 설정해주세요.");
            setCurrentStep(2);
            return;
        }
        
        if (!form.receiverType) {
            alert("수신자 유형을 선택해주세요.");
            setCurrentStep(2);
            return;
        }
        
        if (form.receiverType === "other" && !form.receiverEmail) {
            alert("수신자 이메일을 입력해주세요.");
            setCurrentStep(2);
            return;
        }
        
        const selectedDate = new Date(form.lockExpiredAt);
        const now = new Date();
        if (selectedDate < now) {
            alert("잠금 해제일은 현재 시간보다 이후여야 합니다.");
            setCurrentStep(2);
            return;
        }

        // 중복 제출 방지
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // 백엔드를 위한 데이터 준비
            const rocketData = {
                rocketName: form.rocketName,
                design: form.design,
                lockExpiredAt: form.lockExpiredAt ? form.lockExpiredAt : null,
                receiverType: form.receiverType,
                receiverEmail: form.receiverEmail,
                content: form.content
            };
            
            // FormData 생성
            const formData = new FormData();
            
            // JSON 형식으로 변환하여 data 필드에 추가
            const jsonBlob = new Blob([JSON.stringify(rocketData)], { 
                type: 'application/json' 
            });
            formData.append('data', jsonBlob);
            
            // 파일 추가 (있는 경우)
            if (files.length > 0) {
                files.forEach(file => {
                    formData.append('files', file);
                });
            }
            
            // 요청 전에 데이터 확인
            console.log("전송할 데이터:", JSON.stringify(rocketData));
            console.log("전송할 파일 수:", files.length);
            
            // API 요청 전송
            const response = await api.post(`/rockets/users/${userData.userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log("로켓 전송 성공:", response);
            alert("로켓이 성공적으로 전송되었습니다!");
            navigate("/");
        } catch (err) {
            console.error("로켓 전송 실패", err);
            
            if (err.response) {
                console.error("응답 데이터:", err.response.data);
                console.error("응답 상태코드:", err.response.status);
                alert(`로켓 전송 실패: ${err.response.data?.message || "서버 오류가 발생했습니다"}`);
            } else {
                alert("로켓 전송 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // 다음 스텝으로 이동
    const nextStep = () => {
        if (currentStep === 1 && !form.rocketName) {
            alert("로켓 이름을 입력해주세요.");
            return;
        }
        
        if (currentStep === 2) {
            if (!form.lockExpiredAt) {
                alert("잠금 해제일을 설정해주세요.");
                return;
            }
            
            if (!form.receiverType) {
                alert("수신자 유형을 선택해주세요.");
                return;
            }
            
            if (form.receiverType === "other" && !form.receiverEmail) {
                alert("수신자 이메일을 입력해주세요.");
                return;
            }
            
            const selectedDate = new Date(form.lockExpiredAt);
            const now = new Date();
            if (selectedDate < now) {
                alert("잠금 해제일은 현재 시간보다 이후여야 합니다.");
                return;
            }
        }
        
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    // 이전 스텝으로 이동
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="rocket-form-container">
            <div className="nebula"></div>
            <div className="galaxy"></div>
            <div className="planetarium"></div>
            <div className="space-dust"></div>
            <div className="meteor meteor-1"></div>
            <div className="meteor meteor-2"></div>
            <div className="meteor meteor-3"></div>

            <form className="rocket-form" onSubmit={handleSubmit}>
                {/* 스텝 인디케이터 */}
                <div className="steps-indicator">
                    <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}></div>
                    <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}></div>
                </div>
                
                <div className="rocket-temp-btn-group">
                    <button type="button" onClick={handleTempSave} className="btn-green">임시 저장</button>
                    <button type="button" onClick={handleLoadTempRocket} className="btn-green">불러오기</button>
                </div>
                
                {/* 스텝 1: 로켓 이름과 디자인 선택 */}
                {currentStep === 1 && (
                    <div className="form-step">
                        <div className="form-header">
                            <label htmlFor="rocketName">로켓 이름</label>
                        </div>
                        <input
                            type="text"
                            name="rocketName"
                            id="rocketName"
                            value={form.rocketName}
                            onChange={handleChange}
                            placeholder="로켓 이름을 입력하세요"
                        />

                        <div className="form-header">
                            <label>로켓 디자인 선택</label>
                        </div>
                        <DesignSelector
                            currentIdx={currentDesignIdx}
                            setCurrentIdx={setCurrentDesignIdx}
                        />
                    </div>
                )}
                
                {/* 스텝 2: 잠금 해제일과 수신자 유형 */}
                {currentStep === 2 && (
                    <div className="form-step">
                        <div className="form-header">
                            <label htmlFor="lockExpiredAt">잠금 해제일</label>
                        </div>
                        <input
                            type="datetime-local"
                            name="lockExpiredAt"
                            id="lockExpiredAt"
                            value={form.lockExpiredAt}
                            onChange={handleChange}
                            min={new Date().toISOString().slice(0, 16)}
                        />

                        <div className="form-header">
                            <label>수신자 유형</label>
                        </div>
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
                                <div className="form-header">
                                    <label>수신자 이메일</label>
                                </div>
                                <input
                                    type="email"
                                    name="receiverEmail"
                                    placeholder="수신자 이메일"
                                    value={form.receiverEmail}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </div>
                )}
                
                {/* 스텝 3: 첨부파일과 내용 */}
                {currentStep === 3 && (
                    <div className="form-step">
                        <div className="form-header">
                            <label>첨부 파일</label>
                        </div>
                        <div className="file-upload-area">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                style={{ display: 'none' }}
                            />
                            <button 
                                type="button" 
                                className="btn-file-upload"
                                onClick={() => fileInputRef.current.click()}
                            >
                                파일 선택
                            </button>
                            <div className="file-list">
                                {uploadedFiles.length > 0 ? (
                                    <ul>
                                        {uploadedFiles.map((file, index) => (
                                            <li key={index} className="file-item">
                                                <span className="file-name">{file.name}</span>
                                                <span className="file-size">({file.size})</span>
                                                <button 
                                                    type="button" 
                                                    className="btn-remove-file"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-files">첨부된 파일이 없습니다.</p>
                                )}
                            </div>
                        </div>

                        <div className="form-header">
                            <label htmlFor="content">내용</label>
                        </div>
                        <textarea
                            name="content"
                            id="content"
                            value={form.content}
                            onChange={handleChange}
                            placeholder="로켓에 담을 내용을 작성해주세요."
                            rows="8"
                        />

                        <button 
                            type="submit" 
                            className={`btn-submit ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '전송 중...' : '로켓 보내기'}
                        </button>
                    </div>
                )}
                
                {/* 네비게이션 버튼 */}
                <div className="step-navigation">
                    <button 
                        type="button" 
                        className={`nav-button prev ${currentStep === 1 ? 'disabled' : ''}`}
                        onClick={prevStep}
                        disabled={currentStep === 1}
                    >
                        &#8592;
                    </button>
                    
                    <div className="step-indicator">
                        {currentStep} / 3
                    </div>
                    
                    <button 
                        type="button" 
                        className={`nav-button next ${currentStep === 3 ? 'disabled' : ''}`}
                        onClick={nextStep}
                        disabled={currentStep === 3}
                    >
                        &#8594;
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RocketCreate;
