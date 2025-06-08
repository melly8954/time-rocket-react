import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import styles from '../style/CreateGroup.module.css';
import {
  BackIcon,
  ImageIcon,
  LockIcon,
  UnlockIcon,
  PeopleIcon
} from '../components/ui/Icons';

// 테마 옵션 - 백엔드 DB와 매핑
const THEME_OPTIONS = [
  { id: 1, value: '요리', label: '🍳 요리', emoji: '🍳' },
  { id: 2, value: '음악', label: '🎵 음악', emoji: '🎵' },
  { id: 3, value: '운동', label: '💪 운동', emoji: '💪' },
  { id: 4, value: '독서', label: '📚 독서', emoji: '📚' },
  { id: 5, value: '영화', label: '🎬 영화', emoji: '🎬' },
  { id: 6, value: '여행', label: '✈️ 여행', emoji: '✈️' },
  { id: 7, value: '게임', label: '🎮 게임', emoji: '🎮' },
  { id: 8, value: '기타', label: '🌟 기타', emoji: '🌟' }
];

const CreateGroup = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const fileInputRef = useRef(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    themeId: '', // 숫자로 변환될 예정
    memberLimit: '', // 숫자로 변환될 예정
    isPrivate: false,
    password: ''
  });
  
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 인증 확인
  React.useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 이미지 파일 선택
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 파일은 5MB 이하만 업로드 가능합니다.');
        return;
      }
      
      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      setBackgroundImage(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거
  const handleImageRemove = () => {
    setBackgroundImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.groupName.trim()) {
      newErrors.groupName = '모임 이름을 입력해주세요.';
    } else if (formData.groupName.trim().length < 2) {
      newErrors.groupName = '모임 이름은 2글자 이상이어야 합니다.';
    } else if (formData.groupName.trim().length > 50) {
      newErrors.groupName = '모임 이름은 50글자 이하이어야 합니다.';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '모임 소개를 입력해주세요.';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = '모임 소개는 500글자 이하이어야 합니다.';
    }
    
    if (!formData.themeId) {
      newErrors.themeId = '모임 테마를 선택해주세요.';
    }
    
    if (formData.memberLimit && (isNaN(formData.memberLimit) || formData.memberLimit < 2 || formData.memberLimit > 100)) {
      newErrors.memberLimit = '모임 정원은 2명 이상 100명 이하의 숫자여야 합니다.';
    }
    
    if (formData.isPrivate && !formData.password.trim()) {
      newErrors.password = '비공개 모임은 비밀번호가 필요합니다.';
    } else if (formData.password && formData.password.length < 4) {
      newErrors.password = '비밀번호는 4글자 이상이어야 합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // FormData 생성
      const submitData = new FormData();
      
      // 백엔드 CreateGroupRequest에 맞는 JSON 데이터 생성
      const groupData = {
        groupName: formData.groupName.trim(),
        description: formData.description.trim(),
        themeId: parseInt(formData.themeId), // Long 타입으로 변환
        memberLimit: formData.memberLimit ? parseInt(formData.memberLimit) : null, // Integer 타입으로 변환
        isPrivate: formData.isPrivate,
        password: formData.isPrivate ? formData.password.trim() : null
      };
      
      console.log('Sending group data:', groupData); // 디버깅용
      
      // JSON을 Blob으로 변환하여 추가 (multipart/form-data 형식)
      submitData.append('data', new Blob([JSON.stringify(groupData)], {
        type: 'application/json'
      }));
      
      // 이미지 파일 추가 (선택사항)
      if (backgroundImage) {
        submitData.append('file', backgroundImage);
      }
      
      // 요청 전송
      const response = await api.post('/groups', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Group created successfully:', response.data);
      alert('모임이 성공적으로 생성되었습니다!');
      navigate('/groups');
      
    } catch (err) {
      console.error('모임 생성 실패:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 400) {
        const errorMessage = err.response.data?.message || '입력 정보를 확인해주세요.';
        alert(`입력 오류: ${errorMessage}`);
      } else if (err.response?.status === 409) {
        alert('이미 같은 이름의 모임이 존재합니다.');
      } else if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert('모임 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.createGroupContainer}>
      {/* 헤더 */}
      <div className={styles.createGroupHeader}>
        <button 
          onClick={() => navigate('/groups')} 
          className={styles.backButton}
        >
          <BackIcon /> 돌아가기
        </button>
        <h1>새 모임 만들기</h1>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className={styles.createGroupForm}>
        {/* 기본 정보 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="groupName" className={styles.formLabel}>
              모임 이름 *
            </label>
            <input
              type="text"
              id="groupName"
              name="groupName"
              value={formData.groupName}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.groupName ? styles.error : ''}`}
              placeholder="모임 이름을 입력하세요"
              maxLength={50}
              required
            />
            {errors.groupName && (
              <span className={styles.errorMessage}>{errors.groupName}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.formLabel}>
              모임 소개 *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.formTextarea} ${errors.description ? styles.error : ''}`}
              placeholder="모임에 대해 소개해주세요"
              rows={4}
              maxLength={500}
              required
            />
            <div className={styles.textareaFooter}>
              <span className={styles.charCount}>
                {formData.description.length}/500
              </span>
            </div>
            {errors.description && (
              <span className={styles.errorMessage}>{errors.description}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="themeId" className={styles.formLabel}>
              모임 테마 *
            </label>
            <select
              id="themeId"
              name="themeId"
              value={formData.themeId}
              onChange={handleInputChange}
              className={`${styles.formSelect} ${errors.themeId ? styles.error : ''}`}
              required
            >
              <option value="">테마를 선택하세요</option>
              {THEME_OPTIONS.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
            {errors.themeId && (
              <span className={styles.errorMessage}>{errors.themeId}</span>
            )}
          </div>
        </div>

        {/* 모임 설정 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>모임 설정</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="memberLimit" className={styles.formLabel}>
              모임 정원 (선택사항)
            </label>
            <input
              type="number"
              id="memberLimit"
              name="memberLimit"
              value={formData.memberLimit}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.memberLimit ? styles.error : ''}`}
              min={2}
              max={10}
            />
            <small className={styles.helpText}>
              2명 이상 10명 이하로 설정해주세요.
            </small>
            {errors.memberLimit && (
              <span className={styles.errorMessage}>{errors.memberLimit}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleInputChange}
                className={styles.formCheckbox}
              />
              <label htmlFor="isPrivate" className={styles.checkboxLabel}>
                {formData.isPrivate ? <LockIcon /> : <UnlockIcon />}
                비공개 모임 (비밀번호 필요)
              </label>
            </div>
          </div>
          
          {formData.isPrivate && (
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                모임 비밀번호 *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                placeholder="4글자 이상의 비밀번호"
                minLength={4}
                required={formData.isPrivate}
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>
          )}
        </div>

        {/* 배경 이미지 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>배경 이미지 (선택사항)</h2>
          
          <div className={styles.imageUploadSection}>
            {imagePreview ? (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="배경 이미지 미리보기" />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className={styles.imageRemoveButton}
                >
                  제거
                </button>
              </div>
            ) : (
              <div 
                className={styles.imageUploadArea}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className={styles.uploadIcon} />
                <p>클릭하여 배경 이미지 업로드</p>
                <p className={styles.uploadHint}>JPG, PNG 파일 (최대 5MB)</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.hiddenFileInput}
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate('/groups')}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '모임 만들기'}
          </button>
        </div>
        
        {/* 미리보기 */}
        {formData.groupName && formData.description && formData.themeId && (
          <div className={styles.previewSection}>
            <h2 className={styles.sectionTitle}>미리보기</h2>
            <div className={styles.groupPreview}>
              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewTheme}>
                    <span className={styles.previewEmoji}>
                      {THEME_OPTIONS.find(theme => theme.id === parseInt(formData.themeId))?.emoji || '🌟'}
                    </span>
                    <span className={styles.previewThemeName}>
                      {THEME_OPTIONS.find(theme => theme.id === parseInt(formData.themeId))?.value || '기타'}
                    </span>
                  </div>
                  {formData.isPrivate && <LockIcon className={styles.previewPrivateIcon} />}
                </div>
                
                <h3 className={styles.previewName}>{formData.groupName}</h3>
                <p className={styles.previewDescription}>{formData.description}</p>
                
                <div className={styles.previewStats}>
                  <div className={styles.previewStat}>
                    <PeopleIcon />
                    <span>1/{formData.memberLimit || '∞'}</span>
                  </div>
                </div>
                
                {imagePreview && (
                  <div className={styles.previewBackground}>
                    <img src={imagePreview} alt="배경 미리보기" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateGroup;
