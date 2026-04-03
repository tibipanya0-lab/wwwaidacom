import InayaHeroSection from "@/components/InayaHeroSection";
import CookieConsent from "@/components/CookieConsent";
import SEOHead from "@/components/SEOHead";

const howSteps = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, title: "Keress", desc: "Írj be egy terméknevet, vagy tölts fel egy fényképet" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>, title: "Inaya összehasonlít", desc: "Azonnal megkeresi az árat 50+ boltban" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>, title: "Legjobb áron vásárolsz", desc: "Válaszd ki a legolcsóbb ajánlatot és kattints" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, title: "Böngéssz a katalógusban", desc: "Szűrj kategória, ár vagy bolt szerint" },
];

const stats = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, text: "Naponta több ezer összehasonlítás" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, text: "1 500 000+ termék — mind egy helyen" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, text: "Fizess feleannyit — ugyanaz a termék, jobb ár" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, text: "Egyre több magyar vásárló fedezi fel az Inayát" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, text: "Ingyenes, azonnal, regisztráció nélkül" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead canonical="/" />
      <InayaHeroSection />

      {/* Mobil-only szekció - hero alatt görgethető */}
      <section className="md:hidden" style={{ background: "#0a0a0f", padding: "28px 20px 20px" }}>
        <h1 style={{ fontFamily: "Orbitron, sans-serif", fontSize: 16, fontWeight: 700, color: "#f0d060", letterSpacing: 1.5, marginBottom: 4, textAlign: "center" }}>
          A te személyes AI vásárlási asszisztensed
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 20 }}>
          Az Inaya ami pénzt spórol neked
        </p>

        <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: 14, color: "#f0d060", fontWeight: 700, marginBottom: 14, textAlign: "center" }}>
          Hogyan működik?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {howSteps.map((s) => (
            <div key={s.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: "#f0d060", fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(212,160,23,0.15)", paddingTop: 16, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 200 }}>
            {stats.map((s) => (
              <div key={s.text} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flexShrink: 0 }}>{s.icon}</div>
                <div style={{ fontSize: 12, color: "#f0d060", fontWeight: 700 }}>{s.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  const iframe = document.querySelector("iframe") as HTMLIFrameElement;
                  if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: "open-search" }, "*");
                }}
                style={{ background: "linear-gradient(135deg,#d4a017,#f0d060)", color: "#000", border: "none", padding: "10px 24px", borderRadius: 8, fontFamily: "Rajdhani, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 0.5, cursor: "pointer", boxShadow: "0 0 12px rgba(212,160,23,0.3)" }}
              >
                Próbáld ki most
              </button>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>Illeszd be a termék linkjét vagy írj be egy terméknevet</div>
            </div>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                const iframe = document.querySelector("iframe") as HTMLIFrameElement;
                if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: "open-katalogus" }, "*");
              }}
              style={{ background: "none", border: "1px solid rgba(212,160,23,0.4)", color: "#f0d060", padding: "10px 24px", borderRadius: 8, fontFamily: "Rajdhani, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 0.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              Nézz szét a katalógusunkban
            </button>
          </div>
        </div>
      </section>

      <CookieConsent />
    </div>
  );
};

export default Index;
