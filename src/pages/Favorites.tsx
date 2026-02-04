import { Heart, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import CouponCard from "@/components/CouponCard";
import CityScene3D from "@/components/CityScene3D";
import Header from "@/components/Header";
import { Product } from "@/components/ProductCard";
import { Coupon } from "@/components/CouponCard";

const Favorites = () => {
  const { favorites, clearFavorites, favoritesCount } = useFavorites();
  const { language } = useLanguage();

  const getEmptyMessage = () => {
    if (language === "uk") return "У вас ще немає обраного";
    if (language === "en") return "You have no favorites yet";
    return "Még nincsenek kedvenceid";
  };

  const getEmptySubtitle = () => {
    if (language === "uk") return "Додайте товари або купони до обраного, натиснувши на зірочку";
    if (language === "en") return "Add products or coupons to favorites by clicking the star";
    return "Adj hozzá termékeket vagy kuponokat a csillag ikonra kattintva";
  };

  const getTitle = () => {
    if (language === "uk") return "Обране";
    if (language === "en") return "Favorites";
    return "Kedvencek";
  };

  const getClearButton = () => {
    if (language === "uk") return "Очистити все";
    if (language === "en") return "Clear all";
    return "Összes törlése";
  };

  const products = favorites.filter((f) => f.type === "product");
  const coupons = favorites.filter((f) => f.type === "coupon");

  return (
    <div className="min-h-screen relative">
      <CityScene3D />
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Heart className="h-6 w-6 text-amber-400 fill-amber-400" />
                {getTitle()}
              </h1>
              <p className="text-sm text-muted-foreground">
                {favoritesCount} {language === "uk" ? "елемент" : language === "en" ? "item" : "elem"}
              </p>
            </div>
          </div>
          
          {favoritesCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFavorites}
              className="gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Trash2 className="h-4 w-4" />
              {getClearButton()}
            </Button>
          )}
        </div>

        {/* Empty State */}
        {favoritesCount === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30">
              <Heart className="h-12 w-12 text-amber-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">{getEmptyMessage()}</h2>
            <p className="mb-6 text-muted-foreground max-w-md">{getEmptySubtitle()}</p>
            <Link to="/kereses">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-amber-400 hover:to-yellow-500">
                {language === "uk" ? "Почати пошук" : language === "en" ? "Start searching" : "Keresés indítása"}
              </Button>
            </Link>
          </div>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-lg font-semibold text-white">
              {language === "uk" ? "Товари" : language === "en" ? "Products" : "Termékek"} ({products.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((item) => (
                <ProductCard key={item.id} product={item.data as Product} />
              ))}
            </div>
          </section>
        )}

        {/* Coupons Section */}
        {coupons.length > 0 && (
          <section>
            <h2 className="mb-6 text-lg font-semibold text-white">
              {language === "uk" ? "Купони" : language === "en" ? "Coupons" : "Kuponok"} ({coupons.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {coupons.map((item) => (
                <CouponCard key={item.id} coupon={item.data as Coupon} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Favorites;
