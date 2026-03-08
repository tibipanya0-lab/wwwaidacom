import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InayaHeroSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "inaya-navigate" && event.data.path) {
        navigate(event.data.path);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [navigate]);

  return (
    <iframe
      src={`/inaya-hero.html?v=${Date.now()}`}
      title="Inaya Hero"
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
      }}
      allow="autoplay"
    />
  );
};

export default InayaHeroSection;
