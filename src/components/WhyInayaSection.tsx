import { Shield, Heart, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const WhyInayaSection = () => {
  const { t } = useLanguage();

  const reasons = [
    {
      icon: Shield,
      title: t("whyInaya.reason1.title"),
      description: t("whyInaya.reason1.desc"),
    },
    {
      icon: Heart,
      title: t("whyInaya.reason2.title"),
      description: t("whyInaya.reason2.desc"),
    },
    {
      icon: Sparkles,
      title: t("whyInaya.reason3.title"),
      description: t("whyInaya.reason3.desc"),
    },
    {
      icon: Users,
      title: t("whyInaya.reason4.title"),
      description: t("whyInaya.reason4.desc"),
    },
  ];

  return (
    <section className="py-20 bg-card/30 dark:bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("whyInaya.title")}{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Inaya?
            </span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
            {t("whyInaya.subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group relative rounded-2xl border border-amber-500/15 bg-card/60 dark:bg-black/40 backdrop-blur-sm p-7 text-center transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-500 transition-transform duration-300 group-hover:scale-110">
                <reason.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{reason.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyInayaSection;
