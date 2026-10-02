import React, { useEffect, useState } from 'react';

interface ThinkCodeTitleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  as?: 'h1' | 'h2' | 'span' | 'div';
}

export const ThinkCodeTitle: React.FC<ThinkCodeTitleProps> = ({
  className = '',
  size = 'hero',
  as: Component = 'h1',
}) => {
  const fullText = 'ThinkCode';
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor interval (crisp retro terminal blink)
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      // Typing phase
      if (displayText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, 120 + Math.random() * 40); // Natural keystroke variation
      } else {
        // Finished typing "ThinkCode": pause for 2.4s while cursor '_' blinks
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2400);
      }
    } else {
      // Deleting phase
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length - 1));
        }, 55);
      } else {
        // Paused before restarting
        timeout = setTimeout(() => {
          setIsDeleting(false);
        }, 600);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  // Size styling classes with reserved character width to prevent layout shift of adjacent elements
  const sizeClasses = {
    sm: 'text-base font-bold w-[10.5ch] min-w-[10.5ch]',
    md: 'text-xl font-bold w-[10.5ch] min-w-[10.5ch]',
    lg: 'text-2xl sm:text-3xl font-extrabold w-[10.5ch] min-w-[10.5ch]',
    xl: 'text-3xl sm:text-4xl font-black w-[10.5ch] min-w-[10.5ch]',
    hero: 'text-3xl sm:text-5xl font-black tracking-wider w-[10.5ch] min-w-[10.5ch]',
  }[size];

  // Distinguish "Think" (primary) and "Code" (arcade yellow)
  const renderStyledText = () => {
    if (displayText.length <= 5) {
      return <span className="text-primary">{displayText}</span>;
    }
    const thinkPart = displayText.slice(0, 5);
    const codePart = displayText.slice(5);
    return (
      <>
        <span className="text-primary">{thinkPart}</span>
        <span
          className="text-xp font-black drop-shadow-[0_0_12px_rgba(255,210,63,0.6)]"
          style={{ color: 'var(--xp, #ffd23f)' }}
        >
          {codePart}
        </span>
      </>
    );
  };

  const isCodeActive = displayText.length >= 5;

  return (
    <Component
      className={`t-logo inline-flex items-baseline select-none font-mono ${sizeClasses} ${className}`}
      aria-label="ThinkCode"
    >
      <span className="inline-block">{renderStyledText()}</span>
      <span
        aria-hidden="true"
        className={`ml-0.5 inline-block font-bold ${
          cursorVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          color: isCodeActive ? 'var(--xp, #ffd23f)' : 'var(--primary)',
          textShadow: isCodeActive
            ? '0 0 10px rgba(255, 210, 63, 0.8)'
            : '0 0 10px rgba(91, 79, 201, 0.8)',
        }}
      >
        _
      </span>
    </Component>
  );
};

export default ThinkCodeTitle;
