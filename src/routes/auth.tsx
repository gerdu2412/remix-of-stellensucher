import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Compass, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Anmelden – CareerPilot AI" },
      {
        name: "description",
        content: "Melden Sie sich bei CareerPilot AI an und steuern Sie Ihren Bewerbungsprozess datenbasiert.",
      },
      { property: "og:title", content: "Anmelden – CareerPilot AI" },
      { property: "og:description", content: "Zugang zum KI-gestützten Bewerbungsprozess." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Konto erstellt. Ihre Demo-Daten stehen bereit.");
    navigate({ to: "/dashboard" });
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google-Anmeldung fehlgeschlagen");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="hero-gradient hidden flex-col justify-between p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 text-sidebar-accent-foreground">
          <Compass className="h-6 w-6" />
          <span className="font-display text-lg font-semibold">CareerPilot AI</span>
        </div>
        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl font-semibold text-sidebar-accent-foreground">
            Von der passenden Stelle bis zum erfolgreichen Vorstellungsgespräch
          </h1>
          <p className="text-base leading-relaxed">
            Fünf aufeinander aufbauende Phasen: Suchprofil und Stellenrecherche, Match-Analyse,
            Unternehmensstrategie, Bewerbungsunterlagen und Interviewvorbereitung – durchgängig
            KI-gestützt und auf Ihren Lebenslauf bezogen.
          </p>
          <ul className="space-y-2 text-sm">
            {[
              "Match-Score über zwölf Dimensionen",
              "CV-Optimierung mit Annahme-Workflow",
              "Anschreiben mit Absatz-Feinsteuerung",
              "Interviewsimulation mit Feedback",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs opacity-70">Für erfahrene Fach- und Führungskräfte.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-semibold">CareerPilot AI</span>
            </div>
          </div>
          <h2 className="text-2xl font-semibold">Willkommen zurück</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Melden Sie sich an oder erstellen Sie ein Konto – inklusive vorbereiteter Demo-Daten.
          </p>

          <Tabs defaultValue="signin" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Anmelden
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vollständiger Name</Label>
                  <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">E-Mail</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Passwort</Label>
                  <Input
                    id="password2"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Konto erstellen
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            oder
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google}>
            Mit Google fortfahren
          </Button>
        </div>
      </section>
    </main>
  );
}