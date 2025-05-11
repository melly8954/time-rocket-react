// src/components/rockets/RocketCreator.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/rocketCreator.css';

const RocketCreator = ({ userData, onSubmit, initialForm = {}, onChange }) => {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: initialForm.name || '',
    design: initialForm.design || '',
    lockExpiredAt: initialForm.lockExpiredAt || '',
    receiverType: initialForm.receiverType || '',
    receiverEmail: initialForm.receiverEmail || '',
    content: initialForm.content || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // SpaceBackground import 제거 (부모 컴포넌트에서 제공)
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 로컬 상태 업데이트
    setFormData(prev => {
      const updatedForm = { ...prev, [name]: value };
      
      // receiverType이 'self'일 경우, receiverEmail을 email로 설정
      if (name === "receiverType" && value === "self") {
          updatedForm.receiverEmail = userData.email;
      }
      
      return updatedForm;
    });
    
    // 부모 컴포넌트에 변경사항 전달
    if (onChange) {
      const syntheticEvent = {
        target: { name, value }
      };
      onChange(syntheticEvent);
    }
  };
  
  const nextStep = () => {
    setFormStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  
  const prevStep = () => {
    setFormStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 커스텀 제출 핸들러가 있으면 사용
      if (onSubmit) {
        await onSubmit(e);
      } else {
        // 기본 제출 로직 (API 호출 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('폼 데이터 제출:', formData);
        navigate('/rockets');
      }
    } catch (error) {
      console.error('로켓 생성 중 오류 발생:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="rocket-creator-container">
      <div className="creator-content">
        {/* 나머지 컨텐츠는 그대로 유지 */}
        <div className="creator-header">
          <button onClick={() => navigate('/rockets')} className="back-button">
            <span className="back-arrow">←</span> 로켓 목록으로
          </button>
          <h1>새로운 시공간 여행 만들기</h1>
          <p>나만의 특별한 로켓을 제작하여 시공간을 탐험해보세요</p>
        </div>
        
        <div className="form-progress">
          <div className={`progress-step ${formStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-name">기본 정보</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${formStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-name">상세 설명</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${formStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-name">완료</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="rocket-form">
          {formStep === 1 && (
            <div className="form-step">
              <h2>기본 여행 정보</h2>
              
              <div className="form-group">
                <label htmlFor="title">여행 제목</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="여행의 제목을 입력하세요" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">여행 종류</label>
                <select 
                  id="category" 
                  name="category" 
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="past">과거</option>
                  <option value="future">미래</option>
                  <option value="space">우주</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="destination">목적지</label>
                <input 
                  type="text" 
                  id="destination" 
                  name="destination" 
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="여행 목적지를 입력하세요" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="launchDate">출발 일시</label>
                <input 
                  type="datetime-local" 
                  id="launchDate" 
                  name="launchDate" 
                  value={formData.launchDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={nextStep} className="next-btn">
                  다음 단계
                </button>
              </div>
            </div>
          )}
          
          {formStep === 2 && (
            <div className="form-step">
              <h2>상세 여행 정보</h2>
              
              <div className="form-group">
                <label htmlFor="owner">안내자 이름</label>
                <input 
                  type="text" 
                  id="owner" 
                  name="owner" 
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="여행을 안내할 분의 이름" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="passengers">최대 탑승 인원</label>
                <input 
                  type="number" 
                  id="passengers" 
                  name="passengers" 
                  value={formData.passengers}
                  onChange={handleChange}
                  min="1" 
                  max="20" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">간단한 소개</label>
                <input 
                  type="text" 
                  id="description" 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="여행에 대한 간단한 소개" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="detailedDescription">상세 설명</label>
                <textarea 
                  id="detailedDescription" 
                  name="detailedDescription" 
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  placeholder="여행에 대한 상세한 설명을 작성해주세요..." 
                  rows="6" 
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="imageUrl">대표 이미지</label>
                <input 
                  type="text" 
                  id="imageUrl" 
                  name="imageUrl" 
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="이미지 URL을 입력하세요 (선택사항)" 
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="prev-btn">
                  이전 단계
                </button>
                <button type="button" onClick={nextStep} className="next-btn">
                  다음 단계
                </button>
              </div>
            </div>
          )}
          
          {formStep === 3 && (
            <div className="form-step">
              <h2>정보 확인</h2>
              
              <div className="summary-container">
                <div className="summary-section">
                  <h3>기본 정보</h3>
                  <div className="summary-item">
                    <span className="summary-label">여행 제목:</span>
                    <span className="summary-value">{formData.title}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">여행 종류:</span>
                    <span className="summary-value">
                      {formData.category === 'past' && '과거'}
                      {formData.category === 'future' && '미래'}
                      {formData.category === 'space' && '우주'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">목적지:</span>
                    <span className="summary-value">{formData.destination}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">출발 일시:</span>
                    <span className="summary-value">{new Date(formData.launchDate).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
                
                <div className="summary-section">
                  <h3>상세 정보</h3>
                  <div className="summary-item">
                    <span className="summary-label">안내자:</span>
                    <span className="summary-value">{formData.owner}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">최대 인원:</span>
                    <span className="summary-value">{formData.passengers}명</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">간단 소개:</span>
                    <span className="summary-value">{formData.description}</span>
                  </div>
                </div>
                
                <div className="summary-section full-width">
                  <h3>상세 설명</h3>
                  <pre className="summary-description">{formData.detailedDescription}</pre>
                </div>
                
                {formData.imageUrl && (
                  <div className="summary-section full-width">
                    <h3>대표 이미지</h3>
                    <img src={formData.imageUrl} alt="여행 이미지" className="summary-image" />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="prev-btn">
                  이전 단계
                </button>
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '생성 중...' : '로켓 생성하기'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RocketCreator;