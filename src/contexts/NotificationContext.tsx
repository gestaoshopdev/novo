import * as React from "react";
import { toast } from "sonner";

export interface Notification {
  id: number;
  title: string;
  desc: string;
  createdAt: number;
  type: "warning" | "success" | "info";
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, "id" | "read" | "createdAt"> & { category?: string }) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("atlas_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          createdAt: typeof n.createdAt === "number" ? n.createdAt : (typeof n.id === "number" ? n.id : Date.now())
        })));
      } catch (e) {
        console.error("Erro ao carregar notificações:", e);
      }
    } else {
      setNotifications([
        {
          id: 1,
          title: "Bem-vindo ao Gestão Shop",
          desc: "Sua conta foi configurada com sucesso. Explore suas novas ferramentas!",
          createdAt: Date.now() - 60000,
          type: "success",
          read: false,
        }
      ]);
    }
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("atlas_notifications", JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  const addNotification = React.useCallback((notif: Omit<Notification, "id" | "read" | "createdAt"> & { category?: string }) => {
    // Verificar preferências
    if (typeof window !== "undefined") {
      const savedPrefs = localStorage.getItem("atlas_notification_prefs");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (notif.category && prefs[notif.category] === false) {
          return; // Notificação desativada pelo usuário
        }
      }
    }

    setNotifications(prev => [
      {
        ...notif,
        id: Date.now(),
        createdAt: Date.now(),
        read: false
      },
      ...prev
    ]);
  }, []);

  const markAsRead = React.useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
    toast.success("Notificações limpas");
  }, []);

  const unreadCount = React.useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead, clearAll, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
