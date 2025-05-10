import React, { useState } from 'react';

// 예시 디자인 배열
const designs = [
  { id: 'default', label: '기본', imgUrl: '/images/rocket-default.png' },
  { id: 'red',     label: '레드',   imgUrl: '/images/rocket-red.png' },
  { id: 'blue',    label: '블루',   imgUrl: '/images/rocket-blue.png' },
];

// 1. 로켓 이름 & 임시저장·불러오기
function NameAndSave({ rocketName, setRocketName, onSave, onLoad }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <input
        type="text"
        placeholder="로켓 이름"
        value={rocketName}
        onChange={e => setRocketName(e.target.value)}
        style={{ flex: 1, padding: 8, border: '1px solid #000', borderRadius: 4 }}
      />
      <button type="button" onClick={onSave} style={{ backgroundColor: '#4caf50', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
        임시저장
      </button>
      <button type="button" onClick={onLoad} style={{ backgroundColor: '#4caf50', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
        불러오기
      </button>
    </div>
  );
}

// 2. 디자인 선택
function DesignSelector({ currentIdx, setCurrentIdx }) {
  const prev = () => setCurrentIdx(i => (i === 0 ? designs.length - 1 : i - 1));
  const next = () => setCurrentIdx(i => (i === designs.length - 1 ? 0 : i + 1));
  return (
    <div style={{ flex: 6.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3>디자인 선택</h3>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, border: '1px solid #000', borderRadius: 8, height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ cursor: 'pointer' }} onClick={prev}>◀</button>
          <div style={{ textAlign: 'center' }}>
            <img src={designs[currentIdx].imgUrl} alt={designs[currentIdx].label} width={80} />
            <div>{designs[currentIdx].label}</div>
          </div>
          <button style={{ cursor: 'pointer' }} onClick={next}>▶</button>
        </div>
        <div style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4, height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {designs.map((d, idx) => (
              <div
                key={d.id}
                onClick={() => setCurrentIdx(idx)}
                style={{ width: 60, height: 60, border: idx === currentIdx ? '2px solid #007bff' : '1px solid #ccc', backgroundColor: idx === currentIdx ? '#e6f0ff' : '#fff', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <img src={d.imgUrl} alt={d.label} style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. 잠금 해제일 선택
function UnlockDatePicker({ unlockDate, setUnlockDate }) {
  // 로컬 현재 시각 생성
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const localMin = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}` +
                   `T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // 사용자가 입력 필드를 바꿀 때마다 호출
  const onChange = e => {
    const val = e.target.value;
    const selected = new Date(val);
    // 만약 선택된 값이 지금보다 이전이면 강제로 min 값으로
    if (selected < now) {
      setUnlockDate(localMin);
    } else {
      setUnlockDate(val);
    }
  };

  return (
    <div style={{ flex: 3.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3>잠금 해제일</h3>
      <div style={{
        padding: 12,
        border: '1px solid #000',
        borderRadius: 8,
        height: '100%',
        boxSizing: 'border-box'
      }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          {unlockDate
            ? new Date(unlockDate).toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
              })
            : '선택된 날짜 없음'}
        </label>
        <input
          type="datetime-local"
          value={unlockDate}
          onChange={onChange}       // ← 여기
          min={localMin}
          style={{
            width: '100%', padding: 8,
            border: '1px solid #000',
            borderRadius: 4,
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  );
}





// 4. 수신자 설정
function RecipientSection({ sendToMe, setSendToMe, username, setUsername, domain, setDomain, customDomain, setCustomDomain }) {
  return (
    <section style={{ marginBottom: 24 }}>
      {/* 부모 Flex: 체크박스 그룹과 이메일 입력 그룹을 같은 행에 배치 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* 체크박스 그룹 컨테이너 */}
        <div style={{ display: 'flex', gap: 12, padding: 12, border: '1px solid #000', borderRadius: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={sendToMe}
              onChange={e => setSendToMe(e.target.checked)}
            /> 나에게 보내기
          </label>
          <label>
            <input
              type="checkbox"
              checked={!sendToMe}
              onChange={e => setSendToMe(!e.target.checked)}
            /> 다른 사람에게 보내기
          </label>
        </div>

        {/* 이메일 입력 그룹 컨테이너 */}
        {!sendToMe && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: 12, border: '1px solid #000', borderRadius: 8 }}>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ flex: 1, padding: 8, border: '1px solid #000', borderRadius: 4 }}
            />
            <span>@</span>
            <select
              value={domain}
              onChange={e => setDomain(e.target.value)}
              style={{ padding: 8, border: '1px solid #000', borderRadius: 4 }}
            >
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="직접입력">직접입력</option>
            </select>
            {domain === '직접입력' && (
              <input
                type="text"
                placeholder="domain.com"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                style={{ flex: 1, padding: 8, border: '1px solid #000', borderRadius: 4 }}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// 5. 파일 첨부 & 메시지 본문. 파일 첨부 & 메시지 본문
// 5. 파일 첨부 & 메시지 본문
function FileAndMessage({ files, setFiles, message, setMessage }) {
  const onFileChange = e => {
    if (e.target.files) 
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  return (
    <section style={{ marginBottom: 24, display: 'flex', flexDirection: 'column' }}>
      {/* 버튼을 우측 정렬 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            backgroundColor: '#4caf50',
            color: '#fff',
            padding: '8px 12px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          파일 첨부
        </button>
      </div>
      <input
        id="fileInput"
        type="file"
        multiple
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <textarea
        rows={6}
        placeholder="보낼 메시지를 입력하세요..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        style={{
          width: '100%',
          padding: 12,
          border: '1px solid #000',
          borderRadius: 4,
          resize: 'vertical',
          boxSizing: 'border-box'
        }}
      />
    </section>
  );
}


// 6. 폼 컨트롤 버튼
// 6. 폼 컨트롤 버튼
function FormControls({ isFormValid }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <button
        type="submit"
        disabled={!isFormValid}
        style={{
          backgroundColor: isFormValid ? '#4caf50' : '#ccc',
          color: '#fff',
          padding: '8px 12px',
          border: 'none',
          borderRadius: 4,
          cursor: isFormValid ? 'pointer' : 'not-allowed'
        }}
      >
        로켓 전송
      </button>
    </div>
  );
}


// 전체 페이지 컴포넌트
export default function RocketSendPage() {
  const [rocketName, setRocketName] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [unlockDate, setUnlockDate] = useState('');
  const [sendToMe, setSendToMe] = useState(true);
  const [username, setUsername] = useState('');
  const [domain, setDomain] = useState('naver.com');
  const [customDomain, setCustomDomain] = useState('');
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const isFormValid = rocketName && unlockDate && (sendToMe || (username && (domain !== '직접입력' || customDomain)));
  const handleSaveAll = () => console.log('Save all',{rocketName,currentIdx,unlockDate,sendToMe,username,domain,customDomain,files,message});
  const handleSubmit = e => { e.preventDefault(); if (!isFormValid) return; console.log('Submit',{rocketName,currentIdx,unlockDate,sendToMe,username:sendToMe?null:username,domain:sendToMe?null:(domain==='직접입력'?customDomain:domain),files,message}); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100vw', padding: 20, boxSizing: 'border-box', overflowY: 'auto' }}>
      <NameAndSave rocketName={rocketName} setRocketName={setRocketName} onSave={handleSaveAll} onLoad={handleSaveAll} />
      {/* 2행: 디자인 선택 + 잠금 해제일 (비율 6.5:3.5, 최소 높이 200px) */}
      <div style={{ display: 'flex', gap: 24, minHeight: 200, alignItems: 'stretch', marginBottom: 24 }}>
        <DesignSelector currentIdx={currentIdx} setCurrentIdx={setCurrentIdx} />
        <UnlockDatePicker unlockDate={unlockDate} setUnlockDate={setUnlockDate} />
      </div>
      <RecipientSection sendToMe={sendToMe} setSendToMe={setSendToMe} username={username} setUsername={setUsername} domain={domain} setDomain={setDomain} customDomain={customDomain} setCustomDomain={setCustomDomain} />
      <FileAndMessage files={files} setFiles={setFiles} message={message} setMessage={setMessage} />
      <FormControls isFormValid={isFormValid} onSaveAll={handleSaveAll} />
    </form>
  );
}
