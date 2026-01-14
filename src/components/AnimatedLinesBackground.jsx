const AnimatedLinesBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-500"></div>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-1/2 bg-gradient-to-r from-blue-200/30 via-transparent to-blue-100/30 opacity-30"
          style={{
            top: `${i * 10}%`,
            transform: `rotate(-25deg) translateX(-100%)`,
            animation: `sidebarMoveLines ${20 + i * 4}s linear infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes sidebarMoveLines {
          0% { transform: rotate(-25deg) translateX(-100%); }
          50% { transform: rotate(-25deg) translateX(100%); }
          100% { transform: rotate(-25deg) translateX(-100%); }
        }
      `}</style>
    </div>
  );

export default AnimatedLinesBackground;