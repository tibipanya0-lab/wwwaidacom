import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const languages: { code: Language; flag: string; name: string }[] = [
  { code: "hu", flag: "🇭🇺", name: "Magyar" },
  { code: "uk", flag: "🇺🇦", name: "Українська" },
  { code: "en", flag: "🇬🇧", name: "English" },
];

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();
  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-neutral-400 hover:text-amber-400 hover:bg-transparent"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-neutral-900 border-amber-500/20 min-w-[150px]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-3 cursor-pointer hover:bg-amber-500/10 focus:bg-amber-500/10 ${
              language === lang.code ? "text-amber-400" : "text-neutral-300"
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
