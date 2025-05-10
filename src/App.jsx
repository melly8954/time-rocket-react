import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RocketSendForm from './components/RocketSendForm';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ① / 로 접속 시 폼 보여주기 */}
        <Route path="/" element={<RocketSendForm />} />

        {/* /send 로도 동일하게 */}
        <Route path="/send" element={<RocketSendForm />} />

        {/* 그 외 경로는 404 페이지나 / 로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
