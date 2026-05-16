export type CatalogSettings = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  whatsapp: string;
  instagram: string;
  is_active: boolean;
  profile_photo: string;
  username: string;
  profession: string;
  banner_text: string;
  banner_image?: string;
  colors: {
    background: string;
    primary: string;
    card: string;
    text: string;
    price: string;
    button: string;
  };
  layout: "grid" | "list";
  show_brand: boolean;
  created_at?: string;
};

export const DEFAULT_CATALOG_SETTINGS: CatalogSettings = {
  name: "",
  slug: "",
  description: "",
  whatsapp: "",
  instagram: "",
  is_active: true,
  profile_photo: "",
  username: "",
  profession: "",
  banner_text: "",
  colors: {
    background: "#0F172A",
    primary: "#6366F1",
    card: "#1E293B",
    text: "#F8FAFC",
    price: "#6366F1",
    button: "#6366F1",
  },
  layout: "grid",
  show_brand: true,
};
