import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../authStore';
import '/src/style/Display.css';

const Display = () => {
  const { userId, isLoggedIn, accessToken } = useAuthStore();
  const [displayItems, setDisplayItems] = useState(Array(10).fill(null));
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 진열장 아이템 불러오기
  useEffect(() => {
    // userId가 유효하지 않은 경우 로딩 중단
    if (!userId) {
      console.log("유효한 userId가 없습니다:", userId);
      setLoading(false);
      return;
    }

    const fetchDisplayItems = async () => {
      try {
        console.log("진열장 데이터 요청 중... userId:", userId);
        setLoading(true);
        
        // 직접 API 호출 대신 api 유틸리티 사용
        const response = await axios.get(`/api/displays/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}` // 인증 토큰 추가
          }
        });
        
        console.log("진열장 응답 데이터:", response.data);
        
        if (response.data && response.data.data) {
          setDisplayItems(response.data.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('진열장 로딩 중 오류 발생:', err);
        setError('진열장을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    // isLoggedIn 상태와 userId가 모두 유효할 때만 API 호출
    if (isLoggedIn && userId) {
      fetchDisplayItems();
    } else {
      setLoading(false);
    }
  }, [userId, isLoggedIn, accessToken]); // accessToken도 의존성 배열에 추가

  // 나머지 코드는 그대로 유지...
  
  // 아이템 드래그 시작
  const handleDragStart = (e, item, index) => {
    if (!item) return;
    setDraggedItem(item);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 오버 이벤트 처리
  const handleDragOver = (e) => {
    e.preventDefault();
    return false;
  };

  // 아이템 위치 이동 처리
  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    
    // 드래그한 아이템이 없거나 같은 위치로 드롭한 경우
    if (!draggedItem || draggedIndex === targetIndex) return;
    
    try {
      // 백엔드 API 호출하여 아이템 위치 변경
      await axios.patch(`/api/displays/users/${userId}/move`, {
        chestId: draggedItem.id,
        currentPosition: draggedIndex, 
        newPosition: targetIndex
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}` // 인증 토큰 추가
        }
      });
      
      // 성공 시 로컬 상태 업데이트
      const newItems = [...displayItems];
      newItems[draggedIndex] = null;
      newItems[targetIndex] = draggedItem;
      setDisplayItems(newItems);
      
    } catch (err) {
      setError('아이템 위치 변경에 실패했습니다');
      console.error('아이템 이동 오류:', err);
    } finally {
      // 드래그 상태 초기화
      setDraggedItem(null);
      setDraggedIndex(null);
    }
  };

  // 아이템 제거
  const handleRemoveItem = async (index) => {
    if (!displayItems[index]) return;
    
    if (window.confirm('정말 이 아이템을 진열장에서 제거하시겠습니까?')) {
      try {
        await axios.delete(`/api/displays/users/${userId}/position/${index}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}` // 인증 토큰 추가
          }
        });
        
        // 성공 시 로컬 상태 업데이트
        const newItems = [...displayItems];
        newItems[index] = null;
        setDisplayItems(newItems);
        
      } catch (err) {
        setError('아이템 제거에 실패했습니다');
        console.error('아이템 제거 오류:', err);
      }
    }
  };

  // 로그인 상태 체크 및 UI 표시
  if (!isLoggedIn) {
    return (
      <div className="display-not-logged">
        <div className="display-login-message">
          <h2>로그인이 필요합니다</h2>
          <p>진열장을 이용하시려면 로그인해주세요</p>
          <button onClick={() => window.location.href = '/login'}>로그인하기</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="display-container">
        <div className="display-loading">
          <div className="loading-spinner"></div>
          <p>진열장 로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="display-container">
      <div className="display-header">
        <h2>나의 진열장</h2>
        <p>소중한 추억들을 배치해보세요</p>
      </div>

      {error && (
        <div className="display-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>닫기</button>
        </div>
      )}

      <div className="display-grid">
        {displayItems.map((item, index) => (
          <div 
            key={index}
            className={`display-slot ${item ? 'filled' : 'empty'} ${draggedIndex === index ? 'dragging' : ''}`}
            draggable={!!item}
            onDragStart={(e) => handleDragStart(e, item, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            {item ? (
              <div className="display-item">
                {item.imageUrl ? (
                  <div className="item-image" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                ) : (
                  <div className="item-no-image">이미지 없음</div>
                )}
                <div className="item-info">
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                </div>
                <button className="remove-btn" onClick={() => handleRemoveItem(index)}>
                  ✕
                </button>
              </div>
            ) : (
              <div className="empty-slot-indicator">
                <span>빈 공간</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="display-guide">
        <h3>진열장 사용법</h3>
        <ul>
          <li>아이템을 드래그하여 원하는 위치로 이동할 수 있습니다.</li>
          <li>빈 공간에도 자유롭게 이동이 가능합니다.</li>
          <li>아이템 위의 X 버튼을 클릭하면 진열장에서 제거됩니다.</li>
          <li>보관함에서 아이템을 진열장으로 가져올 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default Display;
