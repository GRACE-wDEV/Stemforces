import React, { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 150;
const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9', '#FF7675', '#74B9FF', '#A29BFE'];

export default function ConfettiExplosion() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      type: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1
    }));

    let animationId;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle) => {
        // Update
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.5; // Gravity
        particle.rotation += particle.rotationSpeed;
        particle.opacity -= 0.005;
        particle.vx *= 0.99;

        // Draw
        if (particle.opacity > 0) {
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation * Math.PI) / 180);
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = particle.color;

          if (particle.type === 'rect') {
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size / 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      });

      // Check if animation should continue
      const hasVisibleParticles = particlesRef.current.some(p => p.opacity > 0);
      
      if (hasVisibleParticles) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
