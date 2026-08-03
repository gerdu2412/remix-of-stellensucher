import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Briefcase,
  Compass,
  FileText,
  Gauge,
  KanbanSquare,
  LogOut,
  Menu,
  MessagesSquare,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/profil", label: "Mein Profil", icon: UserRound },
  { to: "/stellen", label: "Stellensuche", icon: Briefcase },
  { to: "/match", label: "Match-Analysen", icon: Search },
  { to: "/bewerbungen", label: "Bewerbungen", icon: KanbanSquare },
  { to: "/dokumente", label: "Dokumente", icon: FileText },
  { to: "/interview", label: "Interviewtraining", icon: MessagesSquare },
  { to: "/einstellungen", label: "Einstellungen", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const initials = (profile?.full_name ?? "CP")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/dashboard" className="flex items-center gap-2 text-sidebar-accent-foreground">
            <Compass className="h-5 w-5 text-sidebar-primary" />
            <span className="font-display text-base font-semibold">CareerPilot AI</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Menü schließen">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4 text-xs opacity-70">
          Phase 1 – 5 durchgängig KI-gestützt
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur md:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menü öffnen">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Stellen, Unternehmen, Dokumente suchen" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Benachrichtigungen">
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </span>
                  <span className="hidden text-sm sm:block">{profile?.full_name ?? "Profil"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{profile?.email ?? "Angemeldet"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profil">Mein Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/einstellungen">Einstellungen</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}