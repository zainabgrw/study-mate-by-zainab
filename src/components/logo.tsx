import logoSrc from "@/assets/logo.png";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="StudyMate AI logo"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text font-extrabold tracking-tight text-transparent ${className}`}>
      StudyMate <span className="font-black">AI</span>
    </span>
  );
}