// src/components/rockets/RocketList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ClockIcon, UserIcon } from '../ui/Icons';
import '../../styles/components/rocketList.css';

const getCategoryLabel = (category) => {
  switch (category) {
    case 'past':
      return '과거';
    case 'future':
      return '미래';
    case 'space':
      return '우주';
    default:
      return '기타';
  }
};

const RocketList = () => {
  const [rockets, setRockets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTimeout(() => {
          const mockRockets = [
            { 
              id: 1, 
              title: '미래로의 여행', 
              owner: '우주비행사', 
              launchDate: '2025-05-20T14:30:00',
              destination: '2150년 네오도쿄',
              passengers: 4,
              category: 'future',
              rating: 4.8,
              imageUrl: '/src/assets/planet1.png',
              description: '22세기 네오도쿄로 향하는 놀라운 여행. 첨단 도시의 경이로움을 직접 체험하세요.'
            },
            { 
              id: 2, 
              title: '과거 속으로', 
              owner: '시간여행자', 
              launchDate: '2025-05-15T09:15:00',
              destination: '고대 로마 제국',
              passengers: 2,
              category: 'past',
              rating: 4.5,
              imageUrl: '/src/assets/planet2.png',
              description: '고대 로마 제국의 영광을 직접 목격하세요. 콜로세움에서 열리는 검투사 경기를 관람합니다.'
            },
            { 
              id: 3, 
              title: '별들의 대화', 
              owner: '별자리탐험가', 
              launchDate: '2025-06-01T18:00:00',
              destination: '안드로메다 성운',
              passengers: 6,
              category: 'space',
              rating: 5.0,
              imageUrl: '/src/assets/planet1.png',
              description: '은하 너머의 빛나는 행성들을 탐험하고 우주의 신비를 경험하세요.'
            },
            { 
              id: 4, 
              title: '공룡 시대 탐험', 
              owner: '고생물학자', 
              launchDate: '2025-06-10T08:00:00',
              destination: '중생대 쥐라기',
              passengers: 3,
              category: 'past',
              rating: 4.9,
              imageUrl: '/src/assets/planet2.png',
              description: '실제 공룡들을 안전하게 관찰할 수 있는 특별 투어입니다. 티라노사우루스와 트리케라톱스를 만나보세요.'
            },
            { 
              id: 5, 
              title: '인간 대이동 관측', 
              owner: '인류학자', 
              launchDate: '2025-07-05T11:20:00',
              destination: '구석기 시대',
              passengers: 2,
              category: 'past',
              rating: 4.3,
              imageUrl: '/src/assets/planet1.png',
              description: '초기 인류의 대이동을 관찰하는 학술 연구 여행입니다.'
            },
            { 
              id: 6, 
              title: '화성 테라포밍', 
              owner: '행성공학자', 
              launchDate: '2025-08-12T16:45:00',
              destination: '2300년 화성',
              passengers: 8,
              category: 'future',
              rating: 4.7,
              imageUrl: '/src/assets/planet2.png',
              description: '테라포밍이 완료된 미래의 화성을 방문하여 첫 정착민들의 삶을 경험하세요.'
            }
          ];
          setRockets(mockRockets);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('로켓 데이터를 불러오는 중 오류 발생:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRockets = rockets.filter(rocket => {
    if (filter !== 'all' && rocket.category !== filter) return false;
    if (
      searchQuery &&
      !rocket.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !rocket.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !rocket.destination.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const sortedRockets = [...filteredRockets].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.launchDate) - new Date(a.launchDate);
      case 'rating':
        return b.rating - a.rating;
      case 'passengers':
        return b.passengers - a.passengers;
      default:
        return 0;
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
        <div className="loading-container">
        <div className="space-portal">
            <div className="portal-ring portal-ring-1"></div>
            <div className="portal-ring portal-ring-2"></div>
            <div className="portal-ring portal-ring-3"></div>
            <div className="portal-core"></div>
        </div>
        <div className="loading-rocket">
            <img src="/src/assets/rocket.png" alt="로켓" />
        </div>
        <p>시공간을 초월하는 중<span className="loading-dots"></span></p>
        </div>
    );
  }

  return (
    <div>
      <div className="rocket-list-header">
        <div className="header-content">
          <h1>탐험 로켓 목록</h1>
          <p>과거, 현재, 미래, 우주로 떠나는 다양한 여행을 만나보세요</p>
        </div>
        <Link to="/rockets/create" className="create-rocket-btn">
          <span>새 로켓 제작</span>
        </Link>
      </div>

      <div className="rocket-list-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="여행 제목, 목적지 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn">
            <span className="search-icon">🔍</span>
          </button>
        </div>
        <div className="filter-options">
          <div className="category-filter">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체</button>
            <button className={filter === 'past' ? 'active' : ''} onClick={() => setFilter('past')}>과거</button>
            <button className={filter === 'future' ? 'active' : ''} onClick={() => setFilter('future')}>미래</button>
            <button className={filter === 'space' ? 'active' : ''} onClick={() => setFilter('space')}>우주</button>
          </div>
          <div className="sort-options">
            <label>정렬:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">최근 출발</option>
              <option value="rating">별점순</option>
              <option value="passengers">탑승자순</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rocket-grid">
        {sortedRockets.length > 0 ? (
          sortedRockets.map(rocket => (
            <Link to={`/rockets/${rocket.id}`} key={rocket.id} className="rocket-card">
              <div className="rocket-card-media">
                <img src={rocket.imageUrl || '/src/assets/planet1.png'} alt={rocket.title} />
                <div className="rocket-hover">
                  <img src="/src/assets/rocket.png" alt="로켓" className="hover-rocket" />
                </div>
                <div className="rocket-category">{getCategoryLabel(rocket.category)}</div>
              </div>
              <div className="rocket-card-content">
                <h3>{rocket.title}</h3>
                <p className="rocket-destination">
                  <span className="destination-icon">🌍</span> {rocket.destination}
                </p>
                <div className="rocket-meta">
                  <div className="rocket-owner">
                    <UserIcon /> {rocket.owner}
                  </div>
                  <div className="rocket-rating">
                    <StarIcon /> {rocket.rating}
                  </div>
                </div>
                <p className="rocket-description">{rocket.description}</p>
                <div className="rocket-footer">
                  <div className="rocket-departure">
                    <ClockIcon /> {formatDate(rocket.launchDate)}
                  </div>
                  <div className="rocket-passengers">
                    <span>{rocket.passengers}명 탑승</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-rockets-found">
            <img src="/src/assets/rocket.png" alt="로켓" className="empty-rocket" />
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 필터를 선택해보세요</p>
            <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="reset-search">
              필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RocketList;
