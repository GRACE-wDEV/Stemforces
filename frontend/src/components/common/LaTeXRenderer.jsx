import React, { useRef, useEffect } from 'react';

const LaTeXRenderer = ({ text, className = '', inline = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!text || !containerRef.current) return;

    // Load KaTeX dynamically if not already loaded
    if (!window.katex) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      script.onload = () => {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
        document.head.appendChild(cssLink);
        renderMath();
      };
      document.head.appendChild(script);
    } else {
      renderMath();
    }

    function renderMath() {
      const container = containerRef.current;
      if (!container) return;

      // Process the text to render LaTeX
      let processedText = text
        // Bold text
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic text  
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Bullet lists
        .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
        // Line breaks
        .replace(/\n/g, '<br>');

      // Handle display math ($$...$$)
      processedText = processedText.replace(/\$\$([^$]+)\$\$/g, (match, mathContent) => {
        try {
          return window.katex.renderToString(mathContent.trim(), {
            displayMode: true,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false
          });
        } catch (err) {
          console.warn('KaTeX display math error:', err);
          return `<span class="text-red-500">$$${mathContent}$$</span>`;
        }
      });

      // Handle inline math ($...$)
      processedText = processedText.replace(/\$([^$]+)\$/g, (match, mathContent) => {
        try {
          return window.katex.renderToString(mathContent.trim(), {
            displayMode: false,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false
          });
        } catch (err) {
          console.warn('KaTeX inline math error:', err);
          return `<span class="text-red-500">${mathContent}</span>`;
        }
      });

      container.innerHTML = processedText;
    }
  }, [text]);

  if (!text) return null;

  return (
    <div 
      ref={containerRef}
      className={`latex-content ${inline ? 'inline' : ''} ${className}`}
      style={{
        lineHeight: inline ? 'inherit' : '1.6',
        display: inline ? 'inline' : 'block'
      }}
    >
      {text}
    </div>
  );
};

export default LaTeXRenderer;