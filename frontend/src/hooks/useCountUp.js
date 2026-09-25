import { useEffect, useState } from "react";

export function useCountUp(end, duration = 1400, start = 0, shouldStart = true) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime = null;
    let animationFrameId;

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (end - start) * easeProgress);
      
      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration, start, shouldStart]);

  return count;
}

export default useCountUp;
