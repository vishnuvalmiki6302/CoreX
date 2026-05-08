import React from 'react';

const Logo = ({ showText = true, className = "", iconSize = 40 }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="CoreX" className="w-full h-full object-contain" />
            </div>
            {showText && (
                <span className="text-xl font-black tracking-tighter text-gray-900">
                    CORE<span className="text-orange-500">X</span>
                </span>
            )}
        </div>
    );
};

export default Logo;
