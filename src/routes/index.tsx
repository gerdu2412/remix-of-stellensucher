import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "CareerPilot AI – KI-gestützter Bewerbungsprozess" },
      {
        name: "description",
        content:
          "Suchprofil, Stellenrecherche, Match-Analyse, Bewerbungsunterlagen und Interviewtraining in einer Anwendung.",
      },
      { property: "og:title", content: "CareerPilot AI – KI-gestützter Bewerbungsprozess" },
      {
        property: "og:description",
        content: "Von der passenden Stelle bis zum erfolgreichen Vorstellungsgespräch.",
      },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});