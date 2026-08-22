export default function RainLayer({ count = 60 }) {
  const drops = Array.from({ length: count });
  return (
    <div className="rain" aria-hidden="true">
      {drops.map((_, i) => {
        const left = Math.random() * 100;
        const dur = 0.6 + Math.random() * 1.2;
        const delay = Math.random() * 2;
        const opacity = 0.15 + Math.random() * 0.4;
        return (
          <span
            key={i}
            className="raindrop"
            style={{
              left: `${left}%`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
              opacity,
              transform: `rotate(${8 + Math.random() * 6}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
