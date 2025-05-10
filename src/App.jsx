import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import Navbar from "./components/Navbar";

// 더미 공지 데이터 (총 12개)
const dummyNotices = [
  { id: 1, title: 'V 2.0 업데이트 사항', date: '2025.05.01', author: '관리자', content: '2.0 버전에서는 ...' },
  { id: 2, title: '로켓 삭제 관련 공지', date: '2025.04.24', author: '관리자', content: '로켓 삭제 기능에서 발생한 버그가 제거되었습니다.' },
  { id: 3, title: '서버 점검 안내', date: '2025.04.10', author: '관리자', content: '4월 10일 오전 2시부터 4시까지 점검.' },
  { id: 4, title: '새로운 기능 추가 예고', date: '2025.03.28', author: '관리자', content: '곧 추가될 기능을 미리 알려드립니다.' },
  { id: 5, title: '이벤트 당첨자 발표', date: '2025.03.15', author: '관리자', content: '당첨자 명단은 공식 블로그에 게시되었습니다.' },
  { id: 6, title: '중요 보안 패치', date: '2025.03.01', author: '관리자', content: '보안 취약점을 보완했습니다.' },
  { id: 7, title: '시스템 점검 완료 안내', date: '2025.02.15', author: '관리자', content: '점검이 정상적으로 완료되었습니다.' },
  { id: 8, title: '서비스 이용 약관 변경', date: '2025.02.01', author: '관리자', content: '약관이 변경되었으니 확인 바랍니다.' },
  { id: 9, title: '연말 이벤트 안내', date: '2024.12.20', author: '관리자', content: '연말 이벤트가 시작됩니다.' },
  { id: 10, title: 'API 사용 제한 안내', date: '2024.11.15', author: '관리자', content: 'API 호출 제한이 적용됩니다.' },
  { id: 11, title: '정기 점검 안내', date: '2024.10.05', author: '관리자', content: '10월 정기 점검이 예정되어 있습니다.' },
  { id: 12, title: '새해 인사', date: '2024.01.01', author: '관리자', content: '새해 복 많이 받으세요!' }
];

// 스타일 객체
const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  header: { fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' },
  searchBox: { width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '16px', boxSizing: 'border-box' },
  noticeItem: { display: 'block', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '16px', marginBottom: '12px', textDecoration: 'none', color: 'inherit' },
  title: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' },
  meta: { fontSize: '14px', color: '#777', display: 'flex', justifyContent: 'space-between' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' },
  button: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'pointer' },
  activeButton: { backgroundColor: '#007bff', color: '#fff', border: '1px solid #007bff' },
  disabledButton: { opacity: 0.5, cursor: 'not-allowed' },
  detail: { padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid black', maxWidth: '600px', margin: '20px auto' },
  backLink: { display: 'inline-block', marginBottom: '12px', textDecoration: 'none', color: '#007bff' }
};

// 공지 목록 페이지, 페이지네이션 구현함 페이지당 4개 items
function NoticeList() {
  const [searchTerm, setSearchTerm] = useState(''); //검색어 상태
  const [currentPage, setCurrentPage] = useState(1); //현재 페이지 상태
  const itemsPerPage = 4; // 페이지 당 표시 아이템 4개

  const filtered = dummyNotices.filter(n => n.title.includes(searchTerm)); //검색어 포함 공지 필터링되는 부분
  const totalPages = Math.ceil(filtered.length / itemsPerPage); //총 페이지 수 계산
  const start = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(start, start + itemsPerPage); //현재 페이지에 보여줄 아이템 자르기

  const onSearch = e => { setSearchTerm(e.target.value); //검색 입력 변경 시 호출부분
    setCurrentPage(1); }; //검색 시 페이지초기화

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>공지사항</h1>
      <input type="text" placeholder="공지사항 검색 (자동 필터링)" value={searchTerm} onChange={onSearch} style={styles.searchBox} />
      {current.map(n => (
        <Link key={n.id} to={`/notice/${n.id}`} style={styles.noticeItem}>
          <h3 style={styles.title}>{n.title}</h3>
          <div style={styles.meta}><span>{n.author}</span><span>{n.date}</span></div>
        </Link>
      ))}

      {/* 페이지네이션 부분*/}
      <div style={styles.pagination}>
        <button style={{ ...styles.button, ...(currentPage === 1 ? styles.disabledButton : {}) }} 
        disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>이전</button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} style={{ ...styles.button, ...(p === currentPage ? styles.activeButton : {}) }} onClick={() => setCurrentPage(p)}>{p}</button>
        ))}

        <button style={{ ...styles.button, ...(currentPage === totalPages ? styles.disabledButton : {}) }} 
        disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>다음</button>
      </div>
    </div>
  );
}

// 공지 상세 페이지
function NoticeDetail() {
  const { id } = useParams();
  const notice = dummyNotices.find(n => n.id === parseInt(id, 10));

  if (!notice) return <p style={{ textAlign: 'center', marginTop: '20px' }}>존재하지 않는 공지사항입니다.</p>; //공지 없을 경우

  return (
    <div style={styles.detail}>
      <Link to="/" style={styles.backLink}>&larr; 목록으로 돌아가기</Link>
      <h2 style={{ ...styles.title, fontSize: '20px' }}>{notice.title}</h2>
      <div style={styles.meta}><span>{notice.author}</span><span>{notice.date}</span></div>
      <p style={{ marginTop: '12px', lineHeight: 1.5 }}>{notice.content}</p>
    </div>
  );
}

// 전체 앱 (라우터 포함)
export default function App() {
  return (
    <Router>
   
      <Routes>
        <Route path="/" element={<NoticeList />} />
        <Route path="/notice/:id" element={<NoticeDetail />} />
      </Routes>
    </Router>
  );
}