// 🔔 NotificationIcon
export const NotificationIcon = ({ className }) => (
  <svg 
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

// 👤 UserIcon
export const UserIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 8-4 8-4s8 0 8 4"/>
  </svg>
);

// ⚙️ SettingsIcon
export const SettingsIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 008.6 15a1.65 1.65 0 00-1.82-.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6c.26-.11.54-.16.82-.16s.56.05.82.16A1.65 1.65 0 0015 4.6c.26-.11.54-.16.82-.16s.56.05.82.16A1.65 1.65 0 0019.4 9c.11.26.16.54.16.82s-.05.56-.16.82z"/>
  </svg>
);

// 🚪 LogoutIcon
export const LogoutIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ⭐ StarIcon
export const StarIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 15 8.5 22 9.3 17 14.1 18.5 21 12 17.8 5.5 21 7 14.1 2 9.3 9 8.5 12 2"/>
  </svg>
);

// 💬 CommentIcon
export const CommentIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// 📅 CalendarIcon
export const CalendarIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// 📍 LocationIcon
export const LocationIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// 🕒 ClockIcon
export const ClockIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

// 👥 PeopleIcon
export const PeopleIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="7" cy="8" r="4"/>
    <circle cx="17" cy="8" r="4"/>
    <path d="M2 20c0-2.5 4-4 5-4s5 1.5 5 4"/>
    <path d="M12 20c0-2.5 4-4 5-4s5 1.5 5 4"/>
  </svg>
);

// ❤️ LikeIcon
export const LikeIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// 🔗 ShareIcon
export const ShareIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

// ✏️ EditIcon
export const EditIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/>
  </svg>
);

// 🗑️ DeleteIcon
export const DeleteIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

// ➕ PlusIcon
export const PlusIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// 🔍 SearchIcon
export const SearchIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

// ← ArrowBackIcon
export const ArrowBackIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

// 🖥️ DisplayIcon
export const DisplayIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <line x1="8" y1="20" x2="16" y2="20"/>
    <line x1="12" y1="18" x2="12" y2="20"/>
  </svg>
);

// 🔒 LockIcon
export const LockIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// 🔓 UnlockIcon
export const UnlockIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M17 11V7a5 5 0 0 0-9.9-1"/>
  </svg>
);

// 👁️ VisibilityIcon
export const VisibilityIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// 🙈 VisibilityOffIcon
export const VisibilityOffIcon = ({ className }) => (
  <svg
    className={className}
    width="24" height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a17.41 17.41 0 014.11-5.11"/>
    <path d="M1 1l22 22"/>
    <path d="M9.88 9.88a3 3 0 104.24 4.24"/>
  </svg>
);

// ❤️ HeartIcon
export const HeartIcon = ({ className, fill = "none", stroke = "currentColor", strokeWidth = 1.7 }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// 🌐 Web/SNS Icon (가로 위도선 포함)
export const WebIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Web/SNS Icon"
  >
    {/* 바깥 원 */}
    <circle cx="12" cy="12" r="9" />
    {/* 세로 경도선 2개 */}
    <ellipse cx="12" cy="12" rx="3" ry="9" />
    {/* 가로 위도선 3개 */}
    {/* 위쪽 위도선 */}
    <path d="M4.5 17a7.5 2 0 0 1 15 0" />
    {/* 가운데 위도선 */}
    <ellipse cx="12" cy="12" rx="7.5" ry="0.1" />
    {/* 아래쪽 위도선 */}
    <path d="M4.5 7a7.5 2 0 0 0 15 0" />
  </svg>
);



// 🚀 RocketIcon (Flaticon rocket 스타일)
export const RocketIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 본체 */}
    <path d="M12 2c2.5 1.5 5 6 5 10 0 4-2.5 8-5 10-2.5-2-5-6-5-10 0-4 2.5-8.5 5-10z" fill="none" stroke="currentColor"/>
    {/* 창문 */}
    <circle cx="12" cy="10" r="1.5" fill="none" stroke="currentColor"/>
    {/* 왼쪽 날개 */}
    <path d="M7 14c-1.5.5-2.5 2-2 3.5l3-1.5" fill="none" stroke="currentColor"/>
    {/* 오른쪽 날개 */}
    <path d="M17 14c1.5.5 2.5 2 2 3.5l-3-1.5" fill="none" stroke="currentColor"/>
    {/* 불꽃 */}
    <path d="M12 20v2m0 0c.5-.5 1-1.5 1-2m-1 2c-.5-.5-1-1.5-1-2" fill="none" stroke="currentColor"/>
  </svg>
);

export const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BoxIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="4.5"
    strokeLinejoin="round"
    strokeLinecap="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 박스 본체 */}
    <polygon fill="none" points="32 36 8 26 8 50 32 60 56 50 56 26 32 36"/>
    {/* 왼쪽 뚜껑 */}
    <polygon fill="none" points="32 4 8 14 32 24 56 14 32 4"/>
    {/* 오른쪽 뚜껑 */}
    <polyline fill="none" points="8 14 8 26 32 36 56 26 56 14"/>
    {/* 박스 중심선 */}
    <line x1="32" y1="24" x2="32" y2="60"/>
  </svg>
);

export const StarsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinejoin="round"
    strokeLinecap="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 큰 별 (중앙, 살짝 작게) */}
    <polygon
      points="32,14 37,27 52,27 40,36 45,50 32,41 19,50 24,36 12,27 27,27"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    {/* 작은 별 (오른쪽 아래, 더 크게 & 각도 조정) */}
    <polygon
      points="49,45 51,50 56,50 52,53 54,58 49,55 44,58 46,53 42,50 47,50"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />
    {/* 작은 별 (왼쪽 위, 균형 맞춤) */}
    <polygon
      points="18,10 19,13 22,13 20,15 21,18 18,16 15,18 16,15 14,13 17,13"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />
  </svg>
);
