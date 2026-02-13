import { Laptop, Shirt, Home, Dumbbell, Footprints, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  { id: "electronics", label: { hu: "Elektronika", en: "Electronics", uk: "Електроніка" }, icon: Laptop, color: "from-blue-500 to-cyan-500", category: "Elektronika" },
  { id: "fashion", label: { hu: "Divat", en: "Fashion", uk: "Мода" }, icon: Shirt, color: "from-pink-500 to-rose-500", category: "Divat" },
  { id: "home", label: { hu: "Otthon", en: "Home", uk: "Дім" }, icon: Home, color: "from-emerald-500 to-green-600", category: "Otthon" },
  { id: "sport", label: { hu: "Sport & Fitness", en: "Sports & Fitness", uk: "Спорт і фітнес" }, icon: Dumbbell, color: "from-violet-500 to-purple-600", category: "Sport" },
  { id: "beauty", label: { hu: "Szépségápolás", en: "Beauty", uk: "Краса" }, icon: Sparkles, color: "from-rose-400 to-pink-500", category: "Szépség" },
  { id: "shoes", label: { hu: "Cipők", en: "Shoes", uk: "Взуття" }, icon: Footprints, color: "from-amber-500 to-orange-600", category: "Divat" },
];

const CategorySection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleCategoryClick = (category: string) => {
    navigate(`/kereses?cat=${encodeURIComponent(category)}`);
  };

  return (
    <section className="py-16 bg-background/20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {language === "hu" ? "Böngéssz kategóriák szerint" : language === "uk" ? "Перегляд за категоріями" : "Browse by category"}
          </h2>
          <p className="text-muted-foreground">
            {language === "hu" ? "Kattints a kategóriára és találd meg a legjobb ajánlatokat" : language === "uk" ? "Оберіть категорію та знайдіть найкращі пропозиції" : "Pick a category and find the best deals"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.category)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 border border-border hover:border-primary/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {category.label[language] || category.label.en}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
