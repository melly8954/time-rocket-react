// src/components/ui/SpaceButton.jsx
import '../../styles/components/spaceButton.css';

const SpaceButton = ({ children, onClick, type = 'button', variant = 'primary', size = 'medium', icon = null }) => {
  return (
    <button 
      type={type} 
      onClick={onClick}
      className={`space-button ${variant} ${size} ${icon ? 'with-icon' : ''}`}
    >
      <span className="button-content">
        {icon && <span className="button-icon">{icon}</span>}
        <span className="button-text">{children}</span>
      </span>
      <div className="button-stars">
        {[...Array(15)].map((_, i) => (
          <span 
            key={i} 
            className="button-star" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${1 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      <div className="button-glow"></div>
    </button>
  );
};

export default SpaceButton;