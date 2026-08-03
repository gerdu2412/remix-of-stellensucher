import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, SectionTitle } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/einstellungen")({
  head: () => ({
    meta: [
      { title: "Einstellungen – CareerPilot AI" },
      { name: "description", content: "Konto, Datenschutz und Hinweise zur KI-Nutzung in CareerPilot AI." },
      { property: "og:title", content: "Einstellungen – CareerPilot AI" },
      { property: "og:description", content: "Konto und KI-Hinweise verwalten." },
    ],
  }),
  component: EinstellungenPage,
});

function EinstellungenPage() {
  const profile = useProfile();

  return (
    <div>
      <PageHeader title="Einstellungen" description="Konto, Datenschutz und Umgang mit KI-Ergebnissen." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionTitle>Konto</SectionTitle>
          <p className="text-sm text-muted-foreground">{profile.data?.email ?? "—"}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/auth";
            }}
          >
            Abmelden
          </Button>
        </Panel>
        <Panel>
          <SectionTitle>Hinweis zur KI-Nutzung</SectionTitle>
          <p className="text-sm text-muted-foreground">
            Alle KI-Ergebnisse sind Vorschläge auf Basis Ihrer eingegebenen Daten. Prüfen Sie Inhalte vor dem Versand.
            Nicht belegte Aussagen werden als Annahme gekennzeichnet. Ihre Daten sind ausschließlich Ihrem Konto
            zugeordnet.
          </p>
        </Panel>
      </div>
    </div>
  );
}