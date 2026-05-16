import { Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminShell() {
  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto relative">
          {/* Subtle grid background for admin */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
