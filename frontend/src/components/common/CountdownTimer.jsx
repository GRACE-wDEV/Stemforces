import React, { useState, useEffect, useCallback } from 'react';

export default function CountdownTimer({ 
  initialTime, 
  onComplete, 
  size = 'md',
  showMinutes = true,
  warningThreshold = 60,
  dangerThreshold = 30
}) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Trigger pulse effect for last 10 seconds
        if (newTime <= 10 && newTime > 0) {
          setIsPulsing(true);
        }
        
        if (newTime <= 0) {
          onComplete?.();
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = useCallback((seconds) => {
    if (showMinutes) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return seconds.toString();
  }, [showMinutes]);

  // Determine color based on time left
  const getColor = () => {
    if (timeLeft <= dangerThreshold) return 'text-red-500';
    if (timeLeft <= warningThreshold) return 'text-yellow-500';
    return 'text-white';
  };

  const getBgColor = () => {
    if (timeLeft <= dangerThreshold) return 'bg-red-500/20 border-red-500';
    if (timeLeft <= warningThreshold) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-white/10 border-white/20';
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-lg px-3 py-1',
    md: 'text-2xl px-4 py-2',
    lg: 'text-4xl px-6 py-3',
    xl: 'text-6xl px-8 py-4'
  };

  return (
    <div className={`
      inline-flex items-center justify-center font-mono font-bold rounded-xl border
      ${sizeClasses[size]} ${getBgColor()} ${getColor()}
      ${isPulsing ? 'animate-pulse' : ''}
      transition-all duration-300
    `}>
      {formatTime(timeLeft)}
    </div>
  );
}

// Circular countdown variant
export function CircularCountdown({ 
  initialTime, 
  currentTime, 
  size = 100, 
  strokeWidth = 8,
  warningThreshold = 30,
  dangerThreshold = 10 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (currentTime / initialTime) * 100;
  const offset = circumference - (progress / 100) * circumference;

  const getStrokeColor = () => {
    if (currentTime <= dangerThreshold) return '#EF4444'; // red
    if (currentTime <= warningThreshold) return '#F59E0B'; // yellow
    return '#10B981'; // green
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold font-mono ${
          size >= 100 ? 'text-2xl' : 'text-lg'
        } ${currentTime <= dangerThreshold ? 'text-red-500' : 'text-white'}`}>
          {currentTime}
        </span>
      </div>
    </div>
  );
}
