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
  updateProfile: (name: string, photo: string | null) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  name: "Usuário",
  photo: null,
  plan: "Starter",
  planStatus: "trial",
  planExpiry: null,
  daysRemaining: 0,
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

  // Sincroniza o perfil sempre que o usuário mudar
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      const savedName = localStorage.getItem(`profile_name_${user.id}`);
      const savedPhoto = localStorage.getItem(`profile_photo_${user.id}`);
      
      setName(metadata.name || savedName || "Usuário");
      setPhoto(metadata.photo || savedPhoto || null);

      // Lógica de Plano
      const rawPlan = metadata.plan || "Elite"; // Padrao agora é Elite para novos usuários em teste
      const userPlan = rawPlan === "Básico" ? "Elite" : rawPlan;
      const createdAt = parseISO(user.created_at);
      
      // Se não tiver plan_expiry, significa que nunca assinou, então damos 3 dias de trial
      const isTrial = !metadata.plan_expiry;
      const expiryDate = metadata.plan_expiry 
        ? parseISO(metadata.plan_expiry) 
        : addDays(createdAt, 3);
      
      const now = new Date();
      // Use Math.ceil so that 2 days and 23 hours remaining shows as 3 days instead of 2.
      const diff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isActive = isAfter(expiryDate, now);
      
      setPlan(userPlan);
      
      // Auto-cura: Verifica se a tabela profiles está sincronizada com o user_metadata
      // Isso resolve problemas antigos onde o metadata atualizou mas a tabela não
      supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single()
        .then(({ data: profileData }) => {
          if (profileData && profileData.plan_type !== userPlan) {
            supabase.from('profiles')
              .update({ plan_type: userPlan })
              .eq('id', user.id)
              .then(() => console.log('Sincronização de plano (auto-cura) realizada com sucesso.'));
          }
        })
        .catch(e => console.error("Erro na auto-cura:", e));
      
      setPlanExpiry(format(expiryDate, "yyyy-MM-dd'T'HH:mm:ssxxx"));
      setDaysRemaining(Math.max(0, diff));
      
      if (isActive) {
        setPlanStatus(isTrial ? "trial" : "active");
      } else {
        setPlanStatus("expired");
      }
    } else {
      setName("Usuário");
      setPhoto(null);
      setPlan("Elite");
      setPlanStatus("trial");
      setPlanExpiry(null);
      setDaysRemaining(0);
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
      updateProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}
