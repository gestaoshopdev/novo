import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { addDays, isAfter, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileContextType {
  name: string;
  photo: string | null;
  plan: string;
  planStatus: "active" | "expired" | "trial";
  planExpiry: string | null;
  daysRemaining: number;
  isPartner: boolean;
  commissionRate: number;
  updateProfile: (name: string, photo: string | null) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  name: "Usuário",
  photo: null,
  plan: "Starter",
  planStatus: "trial",
  planExpiry: null,
  daysRemaining: 0,
  isPartner: false,
  commissionRate: 0,
  updateProfile: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [name, setName] = useState("Usuário");
  const [photo, setPhoto] = useState<string | null>(null);
  const [plan, setPlan] = useState("Starter");
  const [planStatus, setPlanStatus] = useState<"active" | "expired" | "trial">("trial");
  const [planExpiry, setPlanExpiry] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isPartner, setIsPartner] = useState(false);
  const [commissionRate, setCommissionRate] = useState(0);

  // Sincroniza o perfil sempre que o usuário mudar
  useEffect(() => {
    if (user) {
      // 1. Carrega valores iniciais cacheados para evitar flickers
      const metadata = user.user_metadata || {};
      const savedName = localStorage.getItem(`profile_name_${user.id}`);
      const savedPhoto = localStorage.getItem(`profile_photo_${user.id}`);
      
      setName(metadata.name || savedName || "Usuário");
      setPhoto(metadata.photo || savedPhoto || null);

      const rawPlan = metadata.plan || "Elite";
      const userPlan = rawPlan === "Básico" ? "Elite" : rawPlan;
      const createdAt = parseISO(user.created_at);
      
      const isTrial = !metadata.plan_expiry;
      const expiryDate = metadata.plan_expiry 
        ? parseISO(metadata.plan_expiry) 
        : addDays(createdAt, 3);
      
      const now = new Date();
      const diff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isActive = isAfter(expiryDate, now);
      
      setPlan(userPlan);
      setPlanExpiry(format(expiryDate, "yyyy-MM-dd'T'HH:mm:ssxxx"));
      setDaysRemaining(Math.max(0, diff));
      setPlanStatus(isActive ? (isTrial ? "trial" : "active") : "expired");
      setIsPartner(!!metadata.is_partner);
      setCommissionRate(Number(metadata.commission_rate) || 0);

      // 2. Busca informações frescas do servidor de autenticação do Supabase
      // Isso resolve problemas de cache de sessão onde o metadata atualizou na tabela auth.users mas a sessão local está obsoleta
      supabase.auth.getUser().then(({ data: { user: freshUser } }) => {
        if (freshUser) {
          const freshMetadata = freshUser.user_metadata || {};
          setName(freshMetadata.name || savedName || "Usuário");
          setPhoto(freshMetadata.photo || savedPhoto || null);

          const freshRawPlan = freshMetadata.plan || "Elite";
          const freshUserPlan = freshRawPlan === "Básico" ? "Elite" : freshRawPlan;
          const freshCreatedAt = parseISO(freshUser.created_at);
          
          const freshIsTrial = !freshMetadata.plan_expiry;
          const freshExpiryDate = freshMetadata.plan_expiry 
            ? parseISO(freshMetadata.plan_expiry) 
            : addDays(freshCreatedAt, 3);
          
          const freshDiff = Math.ceil((freshExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const freshIsActive = isAfter(freshExpiryDate, now);
          
          setPlan(freshUserPlan);
          setPlanExpiry(format(freshExpiryDate, "yyyy-MM-dd'T'HH:mm:ssxxx"));
          setDaysRemaining(Math.max(0, freshDiff));
          setPlanStatus(freshIsActive ? (freshIsTrial ? "trial" : "active") : "expired");
          setIsPartner(!!freshMetadata.is_partner);
          setCommissionRate(Number(freshMetadata.commission_rate) || 0);

          // Auto-cura com dados atualizados e frescos!
          supabase
            .from('profiles')
            .select('plan_type')
            .eq('id', freshUser.id)
            .single()
            .then(
              ({ data: profileData }) => {
                if (profileData && profileData.plan_type !== freshUserPlan) {
                  supabase.from('profiles')
                    .update({ plan_type: freshUserPlan })
                    .eq('id', freshUser.id)
                    .then(
                      () => console.log('Sincronização de plano (auto-cura com dados frescos) realizada com sucesso.'),
                      (e: any) => console.error("Erro na auto-cura (update):", e)
                    );
                }
              },
              (e: any) => console.error("Erro na auto-cura:", e)
            );
        }
      }).catch(err => {
        console.error("Erro ao carregar dados atualizados do usuário:", err);
      });
    } else {
      setName("Usuário");
      setPhoto(null);
      setPlan("Elite");
      setPlanStatus("trial");
      setPlanExpiry(null);
      setDaysRemaining(0);
      setIsPartner(false);
      setCommissionRate(0);
    }
  }, [user]);

  const updateProfile = async (newName: string, newPhoto: string | null) => {
    if (!user) return;

    setName(newName);
    setPhoto(newPhoto);

    localStorage.setItem(`profile_name_${user.id}`, newName);
    if (newPhoto) {
      localStorage.setItem(`profile_photo_${user.id}`, newPhoto);
    } else {
      localStorage.removeItem(`profile_photo_${user.id}`);
    }

    try {
      await supabase.auth.updateUser({
        data: {
          name: newName,
          photo: newPhoto,
        }
      });
    } catch (e) {
      console.error("Erro ao salvar perfil no Supabase", e);
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      name, 
      photo, 
      plan, 
      planStatus, 
      planExpiry, 
      daysRemaining, 
      isPartner,
      commissionRate,
      updateProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}
