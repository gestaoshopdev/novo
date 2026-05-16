import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

import appCss from "../styles.css?url";
import iconUrl from "../assets/icon.png?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { AuthContextType } from "@/contexts/AuthContext";

export const Route = createRootRouteWithContext<{ auth: AuthContextType }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GestãoShop" },
      { name: "description", content: "GestãoShop é uma plataforma SaaS completa para gestão de negócios, integrando ERP, CRM e controles financeiros." },
      { name: "author", content: "GestãoShop" },
      { property: "og:title", content: "GestãoShop" },
      { property: "og:description", content: "GestãoShop é uma plataforma SaaS completa para gestão de negócios, integrando ERP, CRM e controles financeiros." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@gestaoshop" },
      { name: "twitter:title", content: "GestãoShop" },
      { name: "twitter:description", content: "GestãoShop é uma plataforma SaaS completa para gestão de negócios, integrando ERP, CRM e controles financeiros." },
      { property: "og:image", content: "" },
      { name: "twitter:image", content: "" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: iconUrl, type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

function RootComponent() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <Outlet />
            <Toaster richColors position="top-right" />
          </QueryClientProvider>
        </NotificationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
