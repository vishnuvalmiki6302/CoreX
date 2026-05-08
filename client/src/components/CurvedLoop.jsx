import React, { useRef, useEffect, useState } from 'react';

const CurvedLoop = ({
  marqueeText = 'Welcome to React Bits ✦',
  speed = 1,
  curveAmount = 200,
  direction = 'left',
  interactive = false,
  className = ''
}) => {
  const textPathRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const textPath = textPathRef.current;
    if (!textPath) return;

    let offset = 0;
    let animationId;

    const animate = () => {
      // If interactive and hovered, slow down or stop.
      const currentSpeed = (interactive && isHovered) ? speed * 0.2 : speed;
      
      offset += direction === 'left' ? -currentSpeed : currentSpeed;
      
      // Loop the offset seamlessly
      if (offset <= -100) offset = 0;
      if (offset >= 100) offset = 0;

      textPath.setAttribute('startOffset', `${offset}%`);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [speed, direction, interactive, isHovered]);

  // Create a massive repeating string to ensure it fills the entire path endlessly
  const repeatedText = Array(10).fill(marqueeText).join(' ');

  return (
    <div 
        ref={containerRef}
        className={`w-full overflow-hidden flex items-center justify-center relative ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 1000 300" className="w-full h-auto drop-shadow-sm">
        <path
          id="text-curve"
          fill="transparent"
          d={`M -500,200 Q 500,${200 - curveAmount} 1500,200`}
        />
        <text className="fill-current text-5xl font-black uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
          <textPath ref={textPathRef} href="#text-curve" startOffset="0%">
            {repeatedText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default CurvedLoop;
