const InayaHeroSection = () => {
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
