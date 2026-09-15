import { useState, useEffect, useRef } from 'react';

export default function ScrollTopBar() {
  const [isVisible, setIsVisible] = useState(false);
  const barRef = useRef(null);
  const ringRef = useRef(null);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScrollHeight > 0 
        ? Math.min(1, Math.max(0, currentScrollY / totalScrollHeight))
        : 0;

      // Direct GPU transform update (0 React re-renders while scrolling!)
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      if (ringRef.current) {
        const offset = circumference - progress * circumference;
        ringRef.current.style.strokeDashoffset = `${offset}`;
      }

      // Only toggle state when visibility actually changes
      const shouldBeVisible = currentScrollY > 280;
      setIsVisible(prev => {
        if (prev !== shouldBeVisible) return shouldBeVisible;
        return prev;
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [circumference]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* 1. Slide Bar: Top Reading & Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-[3.5px] z-[70] pointer-events-none bg-[#DEF2F1]/40 dark:bg-[#1D272C]/60 transition-colors"
        aria-hidden="true"
      >
        <div 
          ref={barRef}
          className="h-full w-full origin-left bg-gradient-to-r from-[#2B7A78] via-[#3AAFA9] to-[#68D8D6] dark:from-[#3AAFA9] dark:via-[#5EEAD4] dark:to-white shadow-[0_0_10px_rgba(58,175,169,0.7)] dark:shadow-[0_0_14px_rgba(56,189,248,0.7)] will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* 2. Floating Up Button: Appears when deep in the page */}
      <div
        className={`fixed bottom-20 sm:bottom-7 right-4 sm:right-8 z-40 transition-all duration-300 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
            : 'opacity-0 translate-y-4 pointer-events-none scale-90'
        }`}
      >
        <button
          type="button"
          onClick={scrollToTop}
          title="Scroll to top"
          aria-label="Scroll to top"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white/95 dark:bg-[#151D22]/95 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_25px_rgba(43,122,120,0.22)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_32px_rgba(58,175,169,0.4)] text-[#2B7A78] dark:text-sky-400 hover:text-[#17252A] dark:hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer ring-1 ring-white/80 dark:ring-white/5"
        >
          {/* Circular SVG Progress Ring */}
          <svg className="absolute inset-0 w-12 h-12 -rotate-90 pointer-events-none" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-[#DEF2F1] dark:stroke-[#26353D] fill-none transition-colors"
              strokeWidth="2.5"
            />
            <circle
              ref={ringRef}
              cx="24"
              cy="24"
              r={radius}
              className="stroke-[#3AAFA9] dark:stroke-[#38BDF8] fill-none"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
            />
          </svg>

          {/* Upward Arrow Icon */}
          <span className="material-symbols-outlined text-2xl group-hover:-translate-y-0.5 transition-transform duration-200">
            arrow_upward
          </span>
        </button>
      </div>
    </>
  );
}
