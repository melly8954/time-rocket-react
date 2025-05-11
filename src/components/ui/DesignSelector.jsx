import React, { useEffect } from "react";

export const designs = [
  { id: 'design1', label: '기본 로켓', imgUrl: 'http://localhost:8081/images/rocket_design/ds1.jpg' },
  { id: 'design2', label: '파란 로켓', imgUrl: 'http://localhost:8081/images/rocket_design/ds2.jpg' },
  { id: 'design3', label: '분홍 로켓', imgUrl: 'http://localhost:8081/images/rocket_design/ds3.jpg' },
];

function DesignSelector({ currentIdx, setCurrentIdx, setDesignImgUrl }) {
  const prev = () => setCurrentIdx(i => (i === 0 ? designs.length - 1 : i - 1));
  const next = () => setCurrentIdx(i => (i === designs.length - 1 ? 0 : i + 1));

  return (
    <div style={{ margin: '16px 0' }}>
      <h3>로켓 디자인 선택</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={prev}>◀</button>
        <div style={{ textAlign: 'center' }}>
          <img src={designs[currentIdx].imgUrl} alt={designs[currentIdx].label} width={80} />
          <div>{designs[currentIdx].label}</div>
        </div>
        <button type="button" onClick={next}>▶</button>
      </div>
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {designs.map((d, idx) => (
          <div
            key={d.id}
            onClick={() => setCurrentIdx(idx)}
            style={{
              width: 60,
              height: 60,
              border: idx === currentIdx ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: idx === currentIdx ? '#e6f0ff' : '#fff',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={d.imgUrl} alt={d.label} style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DesignSelector;
