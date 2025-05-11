import { useState, useEffect } from 'react';
import '../styles/components/communityPage.css';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 더미 데이터 (실제로는 API에서 데이터를 가져옴)
  useEffect(() => {
    // API 호출 시뮬레이션
    setTimeout(() => {
      const dummyPosts = [
        {
          id: 1,
          title: "로켓 엔진 최적화 방법",
          content: "시간 여행을 위한 로켓 엔진을 최적화하는 방법을 공유합니다...",
          author: "엔진마스터",
          category: "tech",
          createdAt: "2025-05-08T10:30:00Z",
          likes: 42,
          comments: 15,
          tags: ["엔진", "최적화", "기술"]
        },
        {
          id: 2,
          title: "미래 여행의 윤리적 문제",
          content: "과거와 미래를 오가며 발생할 수 있는 윤리적 문제와 그 해결 방안에 대해 논의해봅시다.",
          author: "윤리학자",
          category: "discussion",
          createdAt: "2025-05-07T14:22:00Z",
          likes: 28,
          comments: 32,
          tags: ["윤리", "시간여행", "철학"]
        },
        {
          id: 3,
          title: "시간 여행 패러독스 이해하기",
          content: "시간여행 시 발생할 수 있는 다양한 패러독스와 그에 대한 과학적 해석을 알아봅시다.",
          author: "시간물리학자",
          category: "science",
          createdAt: "2025-05-06T09:15:00Z",
          likes: 76,
          comments: 23,
          tags: ["과학", "패러독스", "물리학"]
        },
        {
          id: 4,
          title: "로켓 디자인 공유합니다",
          content: "제가 최근에 디자인한 타임로켓 모델을 공유합니다. 피드백 부탁드려요!",
          author: "디자인러버",
          category: "showcase",
          createdAt: "2025-05-05T16:45:00Z",
          likes: 94,
          comments: 41,
          tags: ["디자인", "모델링", "공유"]
        },
        {
          id: 5,
          title: "첫 시간여행 경험 후기",
          content: "처음으로 시간여행을 경험해본 후기입니다. 생각했던 것보다 훨씬 놀라운 경험이었어요!",
          author: "여행자1호",
          category: "story",
          createdAt: "2025-05-04T11:30:00Z",
          likes: 120,
          comments: 52,
          tags: ["경험담", "후기", "여행"]
        },
        {
          id: 6,
          title: "시간여행 초보자를 위한 가이드",
          content: "처음 시간여행을 시도하는 분들을 위한 기본 가이드와 주의사항을 정리했습니다.",
          author: "시간안내자",
          category: "guide",
          createdAt: "2025-05-03T08:20:00Z",
          likes: 85,
          comments: 29,
          tags: ["가이드", "초보자", "팁"]
        }
      ];
      
      setPosts(dummyPosts);
      setIsLoading(false);
    }, 1000);
  }, []);

  // 카테고리별 필터링
  const filteredPosts = posts.filter(post => {
    // 카테고리 필터링
    const categoryMatch = activeCategory === 'all' || post.category === activeCategory;
    
    // 검색어 필터링
    const searchMatch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  // 정렬
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'popular') {
      return b.likes - a.likes;
    } else if (sortBy === 'comments') {
      return b.comments - a.comments;
    }
    return 0;
  });

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // 정렬 방식 변경 핸들러
  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  // 검색 핸들러
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 카테고리 정보
  const categories = [
    { id: 'all', name: '전체' },
    { id: 'tech', name: '기술' },
    { id: 'science', name: '과학' },
    { id: 'discussion', name: '토론' },
    { id: 'showcase', name: '작품공유' },
    { id: 'story', name: '경험담' },
    { id: 'guide', name: '가이드' }
  ];

  // 새 게시글 작성 핸들러
  const handleCreatePost = () => {
    // 실제로는 글 작성 페이지로 이동하거나 모달 오픈
    alert('새 게시글 작성 페이지로 이동합니다.');
  };

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>TimeRocket 커뮤니티</h1>
        <p className="community-description">
          시간여행자들의 이야기와 정보를 나누는 공간입니다.
        </p>
        
        <div className="community-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="게시글 검색..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <button className="search-button">🔍</button>
          </div>
          
          <button className="create-post-button" onClick={handleCreatePost}>
            <span className="button-icon">+</span> 새 게시글
          </button>
        </div>
      </div>
      
      <div className="community-filters">
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="sort-options">
          <span>정렬: </span>
          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
            <option value="comments">댓글순</option>
          </select>
        </div>
      </div>
      
      <div className="posts-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>게시글을 불러오는 중...</p>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="empty-posts">
            <div className="empty-icon">📝</div>
            <h3>게시글이 없습니다</h3>
            <p>{activeCategory !== 'all' ? '다른 카테고리를 선택하거나, ' : ''}첫 번째 게시글을 작성해보세요!</p>
            <button className="create-post-button large" onClick={handleCreatePost}>
              게시글 작성하기
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {sortedPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <span className={`post-category ${post.category}`}>
                    {categories.find(cat => cat.id === post.category)?.name || post.category}
                  </span>
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.content}</p>
                
                <div className="post-meta">
                  <div className="post-author">
                    <div className="author-avatar">
                      {post.author.charAt(0)}
                    </div>
                    <span>{post.author}</span>
                  </div>
                  
                  <div className="post-stats">
                    <span className="stat">
                      <i className="stat-icon">❤️</i> {post.likes}
                    </span>
                    <span className="stat">
                      <i className="stat-icon">💬</i> {post.comments}
                    </span>
                  </div>
                </div>
                
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="post-tag">#{tag}</span>
                  ))}
                </div>
                
                <div className="post-actions">
                  <button className="action-button">
                    <i className="action-icon">❤️</i> 좋아요
                  </button>
                  <button className="action-button">
                    <i className="action-icon">💬</i> 댓글
                  </button>
                  <button className="action-button">
                    <i className="action-icon">🔖</i> 저장
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 이 부분이 누락되었을 가능성이 있습니다
export default CommunityPage;
