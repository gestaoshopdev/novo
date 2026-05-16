import { 
  Tag, Shirt, Watch, Footprints, Sparkles, Home, Laptop, Smartphone, Monitor, 
  Headphones, Trophy, Dumbbell, ShoppingBag, Package, Gift, Utensils, Coffee, 
  Baby, Heart, Activity, Camera, Music, Book, Gamepad2, Scissors, Flower2, 
  Gem, Glasses, Briefcase, Key, Zap, Car, Users, Layers, LucideIcon 
} from "lucide-react";

export const PREDEFINED_ICONS = [
  { name: "Tag", icon: Tag },
  { name: "Zap", icon: Zap },
  { name: "Car", icon: Car },
  { name: "Users", icon: Users },
  { name: "Layers", icon: Layers },
  { name: "Shirt", icon: Shirt },
  { name: "Watch", icon: Watch },
  { name: "Footprints", icon: Footprints },
  { name: "Sparkles", icon: Sparkles },
  { name: "Home", icon: Home },
  { name: "Laptop", icon: Laptop },
  { name: "Smartphone", icon: Smartphone },
  { name: "Monitor", icon: Monitor },
  { name: "Headphones", icon: Headphones },
  { name: "Trophy", icon: Trophy },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Package", icon: Package },
  { name: "Gift", icon: Gift },
  { name: "Utensils", icon: Utensils },
  { name: "Coffee", icon: Coffee },
  { name: "Baby", icon: Baby },
  { name: "Heart", icon: Heart },
  { name: "Activity", icon: Activity },
  { name: "Camera", icon: Camera },
  { name: "Music", icon: Music },
  { name: "Book", icon: Book },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Scissors", icon: Scissors },
  { name: "Flower2", icon: Flower2 },
  { name: "Gem", icon: Gem },
  { name: "Glasses", icon: Glasses },
  { name: "Briefcase", icon: Briefcase },
  { name: "Key", icon: Key },
];

export const DEFAULT_MAPPING: Record<string, string> = {
  "Acessórios": "Watch",
  "Beleza": "Sparkles",
  "Calçados": "Footprints",
  "Casa & Decoração": "Home",
  "Eletrônicos": "Laptop",
  "Esportes": "Trophy",
  "Roupas": "Shirt",
  "Vestuário": "Shirt",
  "Alimentos": "Utensils",
  "Bebidas": "Coffee",
  "Saúde": "Activity",
  "Infantil": "Baby",
  "Tecnologia": "Smartphone",
  "Gamer": "Gamepad2",
  "Papelaria": "Book",
  "Joias": "Gem",
  "Tráfego Pago": "Zap",
  "Transporte": "Car",
  "Funcionários": "Users",
  "Fornecimento": "Layers",
  "Outros": "Package",
};

export function getIconByName(name?: string): LucideIcon {
  if (!name) return Tag;
  const found = PREDEFINED_ICONS.find(i => i.name === name);
  return found ? found.icon : Tag;
}

export function CategoryIcon({ iconName, categoryName, className }: { iconName?: string, categoryName?: string, className?: string }) {
  let IconComp = getIconByName(iconName);
  
  if (!iconName && categoryName) {
    for (const [key, val] of Object.entries(DEFAULT_MAPPING)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        IconComp = getIconByName(val);
        break;
      }
    }
  }
  
  return <IconComp className={className} />;
}
