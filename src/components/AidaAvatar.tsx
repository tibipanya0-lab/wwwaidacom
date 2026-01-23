import aidaAvatarImg from "@/assets/aida-avatar.png";

interface AidaAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-20 w-20",
};

const AidaAvatar = ({ size = "sm", className = "" }: AidaAvatarProps) => {
  return (
    <div className={`rounded-full overflow-hidden border-2 border-primary/30 ${sizeClasses[size]} ${className}`}>
      <img
        src={aidaAvatarImg}
        alt="Aida AI Asszisztens"
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export default AidaAvatar;
