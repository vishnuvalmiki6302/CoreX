import React from 'react';

const Logo = ({ className = "w-12 h-12" }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="currentColor"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" /> {/* gym-accent */}
                    <stop offset="100%" stopColor="#f59e0b" /> {/* gym-gold */}
                </linearGradient>
            </defs>

            {/* Outer Circle Ring */}
            <circle cx="50" cy="50" r="45" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" className="opacity-80" />

            {/* Stylized X */}
            <path
                d="M30 30 L70 70 M70 30 L30 70"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Inner accent dots */}
            <circle cx="30" cy="30" r="3" fill="#f97316" stroke="none" />
            <circle cx="70" cy="70" r="3" fill="#f97316" stroke="none" />
            <circle cx="70" cy="30" r="3" fill="#f97316" stroke="none" />
            <circle cx="30" cy="70" r="3" fill="#f97316" stroke="none" />
        </svg>
    );
};

export default Logo;
