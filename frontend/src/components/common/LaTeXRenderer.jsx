import React, { useRef, useEffect, useState } from 'react';

const LaTeXRenderer = ({ text, content, className = '', inline = false }) => {
  const containerRef = useRef(null);
  const [renderError, setRenderError] = useState(null);
  
  // Support both 'text' and 'content' props for backward compatibility
  const displayText = text || content;

  useEffect(() => {
    if (!displayText || !containerRef.current) return;
    
    setRenderError(null);

    // Load KaTeX and mhchem extension dynamically if not already loaded
    const loadKaTeX = () => {
      return new Promise((resolve) => {
        if (window.katex) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
        script.onload = () => {
          // Load CSS
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
          document.head.appendChild(cssLink);
          
          // Load mhchem extension for \ce{} chemical equations
          const mhchemScript = document.createElement('script');
          mhchemScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/mhchem.min.js';
          mhchemScript.onload = resolve;
          mhchemScript.onerror = resolve; // Continue even if mhchem fails
          document.head.appendChild(mhchemScript);
        };
        document.head.appendChild(script);
      });
    };

    loadKaTeX().then(() => {
      renderMath();
    });

    function renderMath() {
      const container = containerRef.current;
      if (!container) return;

      try {
        // Sanitize text to prevent XSS
        const sanitizedText = String(displayText);

        // Helper: split text into math and non-math segments
        const splitMath = (input) => {
          const regex = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;
          let lastIndex = 0;
          let result = [];
          let match;
          while ((match = regex.exec(input)) !== null) {
            if (match.index > lastIndex) {
              result.push({ type: 'text', value: input.slice(lastIndex, match.index) });
            }
            result.push({ type: 'math', value: match[0] });
            lastIndex = regex.lastIndex;
          }
          if (lastIndex < input.length) {
            result.push({ type: 'text', value: input.slice(lastIndex) });
          }
          return result;
        };

        // Split into math and non-math segments
        const segments = splitMath(sanitizedText);
        let processedText = '';
        for (const seg of segments) {
          if (seg.type === 'text') {
            // Process \ce{...} only outside math
            let t = seg.value
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+)\*/g, '<em>$1</em>')
              .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
              .replace(/\n/g, '<br>');
            t = t.replace(/\\ce\{([^}]+)\}/g, (match, chemContent) => {
              try {
                return window.katex.renderToString(`\\ce{${chemContent}}`, {
                  displayMode: false,
                  throwOnError: false,
                  errorColor: '#cc0000',
                  strict: false,
                  trust: false
                });
              } catch (err) {
                console.warn('KaTeX \\ce error:', err);
                return `<span style="color: #cc0000;">${chemContent}</span>`;
              }
            });
            processedText += t;
          } else if (seg.type === 'math') {
            // Let KaTeX handle \ce{...} inside math mode
            const isBlock = seg.value.startsWith('$$');
            const mathContent = seg.value.slice(isBlock ? 2 : 1, seg.value.length - (isBlock ? 2 : 1));
            try {
              processedText += window.katex.renderToString(mathContent.trim(), {
                displayMode: isBlock,
                throwOnError: false,
                errorColor: '#cc0000',
                strict: false,
                trust: false
              });
            } catch (err) {
              console.warn('KaTeX math error:', err);
              processedText += `<span style="color: #cc0000;">${seg.value}</span>`;
            }
          }
        }
        container.innerHTML = processedText;
      } catch (error) {
        console.error('LaTeX rendering error:', error);
        setRenderError(error.message);
        container.textContent = displayText; // Fallback to plain text
      }
    }
  }, [displayText]);

  if (!displayText) return null;

  if (renderError) {
    return (
      <div 
        className={`latex-content latex-error ${className}`}
        style={{ color: '#dc2626', fontSize: '14px' }}
      >
        ⚠️ Rendering error: {displayText}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`latex-content ${inline ? 'inline' : ''} ${className}`}
      style={{
        lineHeight: inline ? 'inherit' : '1.6',
        display: inline ? 'inline' : 'block'
      }}
    >
      {displayText}
    </div>
  );
};

export default LaTeXRenderer;