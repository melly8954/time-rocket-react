import React from "react";
import "./StarBackground.css";

function StarBackground() {
    const stars = Array.from({ length: 80 }).map((_, i) => ({
        top: Math.random() * 100 + "vh",
        left: Math.random() * 100 + "vw",
        size: Math.random() * 2 + 1,
        duration: Math.random() * 2 + 1,
    }));

    return (
        <div className="star-bg">
            {stars.map((star, i) => (
                <div
                    key={i}
                    className="star"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        animationDuration: `${star.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default StarBackground;
