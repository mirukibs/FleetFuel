import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenu={() => setOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}