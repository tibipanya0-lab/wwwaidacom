import aidaAvatarImg from "@/assets/aida-avatar.png";

interface AidaAvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "h-5 w-5 min-h-5 min-w-5",
  sm: "h-6 w-6 min-h-6 min-w-6",
  md: "h-10 w-10 min-h-10 min-w-10",
  lg: "h-16 w-16 min-h-16 min-w-16 md:h-20 md:w-20",
};

const AidaAvatar = ({ size = "sm", className = "" }: AidaAvatarProps) => {
  return (
    <div className={`rounded-full overflow-hidden border-2 border-primary/30 shrink-0 ${sizeClasses[size]} ${className}`}>
      <img
        src={aidaAvatarImg}
        alt="Aida AI Asszisztens"
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

export default AidaAvatar;
