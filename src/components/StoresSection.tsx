import { Store, CheckCircle } from "lucide-react";

const stores = [
  { name: "Temu", logo: "https://logo.clearbit.com/temu.com", deals: "50,000+" },
  { name: "Shein", logo: "https://logo.clearbit.com/shein.com", deals: "100,000+" },
  { name: "Alza", logo: "https://logo.clearbit.com/alza.hu", deals: "200,000+" },
  { name: "AliExpress", logo: "https://logo.clearbit.com/aliexpress.com", deals: "1M+" },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com", deals: "500,000+" },
  { name: "eBay", logo: "https://logo.clearbit.com/ebay.com", deals: "300,000+" },
  { name: "Media Markt", logo: "https://logo.clearbit.com/mediamarkt.hu", deals: "50,000+" },
  { name: "eMAG", logo: "https://logo.clearbit.com/emag.hu", deals: "150,000+" },
];

const StoresSection = () => {
  return (
    <section id="stores" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-accent">
            <Store className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Partner áruházak</span>
          </div>
          <h2 className="text-3xl font-bold">
            100+ <span className="text-gradient">áruházból</span> keresünk
          </h2>
          <p className="mt-4 text-muted-foreground">
            Minden népszerű magyar és nemzetközi webáruházat figyelünk
          </p>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {stores.map((store, index) => (
            <div
              key={store.name}
              className="group relative flex flex-col items-center rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="absolute right-3 top-3">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <img
                src={store.logo}
                alt={store.name}
                className="mb-4 h-12 w-12 rounded-xl object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <h3 className="font-semibold">{store.name}</h3>
              <p className="text-xs text-muted-foreground">{store.deals} termék</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoresSection;
