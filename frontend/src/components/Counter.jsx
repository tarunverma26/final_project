import { useEffect, useState } from "react";

export default function Counter({ end, prefix = "", suffix = "", duration = 1400 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * end));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <span className="counter">{prefix}{val.toLocaleString()}{suffix}</span>;
}
