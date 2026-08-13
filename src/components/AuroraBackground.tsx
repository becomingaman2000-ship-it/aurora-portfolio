export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "var(--color-background)" }}
    >
      {/* Aurora blobs */}
      <div
        className="animate-aurora-1 absolute -top-1/3 -left-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-70 blur-3xl"
        style={{
          background: "radial-gradient(circle at 30% 30%, var(--color-aurora-1), transparent 60%)",
        }}
      />
      <div
        className="animate-aurora-2 absolute -bottom-1/3 -right-1/4 h-[75vmax] w-[75vmax] rounded-full opacity-70 blur-3xl"
        style={{
          background: "radial-gradient(circle at 60% 40%, var(--color-aurora-2), transparent 60%)",
        }}
      />
      <div
        className="animate-aurora-3 absolute top-1/4 left-1/3 h-[55vmax] w-[55vmax] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--color-aurora-3), transparent 60%)",
        }}
      />
      <div
        className="animate-aurora-1 absolute top-1/2 -left-1/6 h-[45vmax] w-[45vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--color-aurora-4), transparent 65%)",
          animationDelay: "-8s",
        }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
