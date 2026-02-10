import { Lightbulb, TrendingUp, Gift, Truck, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ThresholdInfo } from "@/lib/partnerStores";

interface SmartTipBoxProps {
  thresholdInfo: ThresholdInfo;
  storeName: string;
  storeColor: string;
  onAddonClick?: (addonName: string) => void;
}

const SmartTipBox = ({ thresholdInfo, storeName, storeColor, onAddonClick }: SmartTipBoxProps) => {
  const { nextThreshold, amountNeeded, suggestedAddons, potentialSaving } = thresholdInfo;

  if (!nextThreshold) return null;

  const getBenefitIcon = () => {
    switch (nextThreshold.benefitType) {
      case "shipping":
        return <Truck className="h-5 w-5" />;
      case "discount":
        return <TrendingUp className="h-5 w-5" />;
      case "gift":
        return <Gift className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border-2 border-dashed p-5"
        style={{ 
          borderColor: storeColor + "60",
          background: `linear-gradient(135deg, ${storeColor}10 0%, ${storeColor}05 100%)`,
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div 
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: storeColor + "20" }}
          >
            <Lightbulb className="h-6 w-6" style={{ color: storeColor }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span style={{ color: storeColor }}>💡 Inaya Tipp</span>
              <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {storeName}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Már csak <strong className="text-foreground">{amountNeeded.toLocaleString("hu-HU")} Ft</strong> hiányzik a következő kedvezményhez!
            </p>
          </div>
        </div>

        {/* Benefit Preview */}
        <div 
          className="flex items-center gap-3 rounded-xl p-3 mb-4"
          style={{ backgroundColor: storeColor + "15" }}
        >
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: storeColor + "30", color: storeColor }}
          >
            {getBenefitIcon()}
          </div>
          <div className="flex-1">
            <p className="font-semibold" style={{ color: storeColor }}>
              {nextThreshold.benefit}
            </p>
            <p className="text-xs text-muted-foreground">
              {nextThreshold.minAmount.toLocaleString("hu-HU")} Ft felett
            </p>
          </div>
          {potentialSaving > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Megtakarítás</p>
              <p className="font-bold text-success">
                ~{potentialSaving.toLocaleString("hu-HU")} Ft
              </p>
            </div>
          )}
        </div>

        {/* Savings Calculator */}
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-success" />
            <span className="text-sm font-semibold text-success">Így jársz jobban:</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Jelenlegi összeg</p>
              <p className="font-bold text-foreground">
                {thresholdInfo.currentAmount.toLocaleString("hu-HU")} Ft
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cél összeg</p>
              <p className="font-bold" style={{ color: storeColor }}>
                {nextThreshold.minAmount.toLocaleString("hu-HU")} Ft
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-success/20">
            <p className="text-xs text-success/80">
              📊 Ha még <strong>{amountNeeded.toLocaleString("hu-HU")} Ft</strong>-ért vásárolsz, 
              {potentialSaving > 0 && (
                <> <strong className="text-success">~{potentialSaving.toLocaleString("hu-HU")} Ft-ot spórolsz</strong> és </>
              )}
              megkapod: <strong>{nextThreshold.benefit}</strong>
            </p>
          </div>
        </div>

        {/* Suggested Addons */}
        {suggestedAddons.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 text-muted-foreground">
              🛒 Ajánlott kiegészítők a küszöb eléréséhez:
            </p>
            <div className="space-y-2">
              {suggestedAddons.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onAddonClick?.(item.addon.name)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent/50 transition-all group text-left"
                >
                  <span className="text-2xl">{item.addon.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.addon.name}</p>
                    <p className="text-xs text-muted-foreground">Kategória: {item.addon.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ~{item.price.toLocaleString("hu-HU")} Ft
                    </p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Decorative elements */}
        <div 
          className="absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: storeColor }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartTipBox;
