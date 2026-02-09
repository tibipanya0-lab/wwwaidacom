import { Laptop, Shirt, Home, Dumbbell, Baby, Car, Gift, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { id: "tech", label: "Elektronika", icon: Laptop, color: "from-blue-500 to-cyan-500" },
  { id: "fashion", label: "Divat", icon: Shirt, color: "from-pink-500 to-rose-500" },
  { id: "home", label: "Otthon", icon: Home, color: "from-amber-500 to-orange-500" },
  { id: "sport", label: "Sport", icon: Dumbbell, color: "from-green-500 to-emerald-500" },
  { id: "baby", label: "Baba-mama", icon: Baby, color: "from-purple-500 to-violet-500" },
  { id: "auto", label: "Autó", icon: Car, color: "from-slate-500 to-zinc-500" },
  { id: "gift", label: "Ajándék", icon: Gift, color: "from-red-500 to-rose-500" },
  { id: "other", label: "Egyéb", icon: Sparkles, color: "from-indigo-500 to-blue-500" },
];

const CategorySection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/akciok?category=${categoryId}`);
  };

  return (
    <section className="py-12 bg-background/20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Böngéssz kategóriák szerint
          </h2>
          <p className="text-muted-foreground">
            Válaszd ki a kategóriát és találd meg a legjobb ajánlatokat
          </p>
        </motion.div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/50 border border-border hover:border-primary/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {category.label}
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
