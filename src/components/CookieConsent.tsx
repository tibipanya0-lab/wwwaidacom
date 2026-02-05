import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-slide-in safe-area-bottom">
      <div className="mx-auto max-w-4xl p-2 sm:p-4">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card/95 backdrop-blur-lg p-3 sm:p-4 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10">
                <Cookie className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium">Cookie-k használata</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Az oldal cookie-kat használ a jobb felhasználói élmény érdekében.{" "}
                  <a href="/suti-szabalyzat" className="text-primary hover:underline">
                    Süti szabályzat
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
              >
                Elutasítom
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={handleAccept}
                className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
              >
                Elfogadom
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
