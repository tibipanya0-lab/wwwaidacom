import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InayaHeroSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "inaya-navigate" && e.data.url) {
        const url = e.data.url as string;
        if (url.startsWith("http")) {
          // External link (affiliate URL)
          window.open(url, "_blank");
        } else {
          // Internal link (/termek/123)
          navigate(url);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [navigate]);

  return (
    <iframe
      src={`/inaya-app.html?v=${Date.now()}`}
      title="Inaya Hero"
      style={{
        width: "100vw",
        height: "100svh",
        minHeight: "-webkit-fill-available",
        border: "none",
        display: "block",
      }}
      allow="autoplay"
    />
  );
};

export default InayaHeroSection;
