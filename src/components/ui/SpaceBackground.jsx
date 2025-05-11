// src/components/ui/SpaceBackground.jsx
import { useEffect, useRef } from 'react';
import '../../styles/spaceBackground.css';

const SpaceBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // 캔버스 크기 설정
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // 별 생성
    const stars = [];
    const createStars = () => {
      stars.length = 0;
      const numberOfStars = Math.floor((canvas.width * canvas.height) / 1000);
      
      for (let i = 0; i < numberOfStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          opacity: Math.random(),
          speed: Math.random() * 0.05
        });
      }
    };
    
    // 별 그리기
    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 그라데이션 배경
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#03045e');  // 깊은 우주 색
      gradient.addColorStop(1, '#0b1354');  // 좀 더 밝은 우주 색
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 별 그리기
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // 별 움직임
        star.y = (star.y + star.speed) % canvas.height;
      });
      
      // 별 빛나게 하기
      ctx.globalCompositeOperation = 'lighter';
      stars.forEach((star, index) => {
        if (index % 20 === 0) { // 일부 별만 빛나게
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 3
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalCompositeOperation = 'source-over';
      
      animationFrameId = window.requestAnimationFrame(drawStars);
    };
    
    // 초기화
    setCanvasSize();
    createStars();
    drawStars();
    
    // 리사이즈 이벤트
    window.addEventListener('resize', () => {
      setCanvasSize();
      createStars();
    });
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <div className="space-background">
      <canvas ref={canvasRef} className="stars-canvas"></canvas>
      <div className="space-overlay">
        <div className="nebula nebula-1"></div>
        <div className="nebula nebula-2"></div>
        <div className="aurora"></div>
      </div>
    </div>
  );
};

export default SpaceBackground;
