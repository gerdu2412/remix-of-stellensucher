# Remix of Stellensucher

Erstelle eine moderne, responsive Web-App für einen vollständig KI-gestützten Bewerbungsprozess. Die Anwendung soll Bewerber von der Definition ihres Suchprofils über die Stellensuche und Match-Analyse bis zur Erstellung der Bewerbungsunterlagen und Interviewvorbereitung begleiten.

Produktname

Arbeitsname: CareerPilot AI

Untertitel:

Von der passenden Stelle bis zum erfolgreichen Vorstellungsgespräch

Zielgruppe

Die Anwendung richtet sich insbesondere an erfahrene Fach- und Führungskräfte, Projektmanager, Transformationsmanager, Berater und Bewerber für strategische Rollen.

Die Nutzer sollen möglichst wenig manuell eingeben müssen. Lebenslauf, Suchprofil, Stellenausschreibungen und bisherige Bewerbungsergebnisse bilden die zentrale Datenbasis für alle KI-Funktionen.

Grundprinzip

Die Anwendung besteht aus fünf aufeinander aufbauenden Phasen:

Suchprofil und Stellenrecherche

Match-Analyse und CV-Optimierung

Unternehmensanalyse und Bewerbungsstrategie

Anschreiben und Lebenslauf erstellen

Interviewvorbereitung

Jede Phase verwendet die Ergebnisse der vorherigen Phase. Der Nutzer soll jederzeit sehen können:

In welcher Phase er sich befindet

Welche Aufgaben bereits abgeschlossen sind

Welche Ergebnisse die KI erstellt hat

Welche Inhalte noch bestätigt oder ergänzt werden müssen

1. Suchprofil und Stellenrecherche

Ziel

Der Nutzer lädt seinen vorhandenen Lebenslauf hoch und definiert sein persönliches Suchprofil. Auf dieser Grundlage werden passende Stellen erfasst, bewertet und priorisiert.

Eingaben

Erstelle ein mehrstufiges Formular mit folgenden Feldern:

Lebenslauf

Upload als PDF oder DOCX

Optional: Lebenslauf manuell einfügen

Extrahierter Text soll angezeigt und editierbar sein

Zielpositionen

Mehrfachauswahl und Freitext, beispielsweise:

Strategieentwicklung

Unternehmensentwicklung

Digitale Transformation

Business Transformation

Organisationsentwicklung

Prozessmanagement

Prozessoptimierung

Projektmanagement

Programmmanagement

Produktmanagement

Business Excellence

Innovation Management

KI-Transformation

Operational Excellence

Business Consulting

Zielländer

Deutschland

Schweiz

Liechtenstein

Luxemburg

Regionen

Priorisierung über Drag-and-drop oder Ranking:

Rheinland-Pfalz

Hessen

Bayern

weitere Regionen

Arbeitsmodell

Remote

Hybrid

Vor Ort

Maximale Anzahl Bürotage pro Woche

Reisebereitschaft

Rahmenbedingungen

Mindestgehalt

Gewünschte Seniorität

Führungsverantwortung

Unternehmensgröße

Bevorzugte Branchen

Ausgeschlossene Branchen

Ausschlusskriterien

Gewünschte Vertragsart

KI-Auswertung des Lebenslaufs

Nach dem Upload soll die KI automatisch folgende Informationen aus dem Lebenslauf extrahieren:

Berufserfahrung

Unternehmen

Positionen

Dauer der Tätigkeiten

Branchen

Fachkompetenzen

Methodenkompetenzen

Führungserfahrung

Projekterfahrung

Ausbildung

Zertifikate

Sprachen

IT- und Tool-Kenntnisse

messbare Erfolge

Karrierelevel

geeignete Zielrollen

alternative Jobtitel und Suchbegriffe

Die extrahierten Inhalte müssen durch den Nutzer korrigiert und bestätigt werden können.

Stellenrecherche

Baue zunächst eine Struktur, in der Stellen manuell über folgende Wege hinzugefügt werden können:

URL einer Stellenausschreibung

kopierter Ausschreibungstext

manuelle Erfassung

Import über CSV

später erweiterbare API- oder Automatisierungsschnittstelle

Jede Stelle erhält folgende Felder:

Jobtitel

Unternehmen

Standort

Land

Remote-Anteil

Quelle

Original-Link

Veröffentlichungsdatum

Bewerbungsfrist

Gehalt oder Gehaltsschätzung

vollständiger Ausschreibungstext

Ansprechpartner

Status

Notizen

Stellenübersicht

Erstelle eine übersichtliche Karten- und Tabellenansicht mit Filtern für:

Land

Region

Match-Score

Remote-Anteil

Gehalt

Seniorität

Unternehmen

Bewerbungsstatus

Veröffentlichungsdatum

Die Stellen sollen sortierbar sein nach:

höchster Match

neueste Stelle

höchstes Gehalt

niedrigstes Bewerbungsrisiko

höchste Priorität

2. Match-Analyse und CV-Optimierung

Ziel

Der vorhandene Lebenslauf wird für jede ausgewählte Stellenausschreibung mit den Anforderungen der Stelle abgeglichen.

Match-Analyse

Erstelle für jede Stelle eine eigene Detailseite.

Die KI soll einen Match-Score von 0 bis 100 Prozent berechnen.

Der Match-Score soll nachvollziehbar aus mehreren Dimensionen bestehen:

Fachliche Kompetenzen

Berufserfahrung

Führungserfahrung

Branchenerfahrung

Methodenkenntnisse

Ausbildung

Sprachkenntnisse

Seniorität

Standort und Mobilität

Arbeitsmodell

Gehaltskompatibilität

kulturelle Passung

Zeige die Ergebnisse als:

Gesamt-Score

Fortschrittskreis oder Gauge

Balkendiagramm je Dimension

Ampellogik

kurze Management-Zusammenfassung

Inhalt der Match-Analyse

Die KI soll folgende Bereiche erstellen:

Erfüllte Anforderungen

Welche Anforderungen werden durch den Lebenslauf klar erfüllt?

Teilweise erfüllte Anforderungen

Welche Anforderungen sind vorhanden, aber im Lebenslauf nicht ausreichend belegt?

Fehlende Anforderungen

Welche Kompetenzen, Erfahrungen oder Zertifikate fehlen?

Übertragbare Kompetenzen

Welche Erfahrungen können als Ersatz oder vergleichbare Kompetenz argumentiert werden?

Bewerbungsrisiken

Warum könnte ein Recruiter oder Hiring Manager die Bewerbung ablehnen?

Differenzierungsmerkmale

Welche Erfahrungen unterscheiden den Bewerber positiv von anderen Kandidaten?

Erfolgsaussicht

Einstufung in:

sehr hohe Passung

gute Passung

realistische Bewerbung

Stretch-Position

geringe Passung

CV-Optimierung

Die KI soll konkrete Optimierungsvorschläge für den Lebenslauf liefern:

fehlende Keywords

bessere Überschrift

verbessertes Kurzprofil

relevante Kernkompetenzen

stärkere Formulierungen

messbare Ergebnisse ergänzen

Projekterfahrungen stärker hervorheben

weniger relevante Inhalte kürzen

Reihenfolge der Inhalte optimieren

ATS-Kompatibilität verbessern

Jede Empfehlung soll enthalten:

aktueller Text

vorgeschlagener neuer Text

Begründung

Relevanz für die Stelle

Checkbox zur Übernahme

Der Nutzer soll einzelne Vorschläge annehmen, ablehnen oder bearbeiten können.

3. Unternehmensanalyse und Bewerbungsstrategie

Ziel

Für eine priorisierte Stelle wird eine individuelle Bewerbungsstrategie entwickelt.

Unternehmensanalyse

Erstelle einen Bereich für ein strukturiertes Unternehmens-Dossier mit folgenden Kategorien:

Unternehmensprofil

Geschäftsmodell

Produkte und Dienstleistungen

Unternehmensgröße

Standorte

Branche

Marktposition

Wettbewerber

aktuelle Strategie

Transformationsprogramme

Digitalisierung

KI-Initiativen

aktuelle Nachrichten

wirtschaftliche Entwicklung

Führungsteam

Unternehmenskultur

Arbeitgeberbewertungen

Chancen und Risiken

mögliche Herausforderungen der ausgeschriebenen Rolle

Da externe Recherche nicht immer verfügbar ist, soll das System Inhalte aus folgenden Quellen aufnehmen können:

Unternehmenswebsite

Geschäftsberichte

Pressemitteilungen

LinkedIn-Inhalte

manuell eingefügte Recherchetexte

Webseitenlinks

hochgeladene Dokumente

Kennzeichne automatisch:

belegte Fakten

Annahmen

offene Fragen

potenziell veraltete Informationen

Bewerbungsstrategie

Auf Basis von Lebenslauf, Stellenanzeige und Unternehmensanalyse soll die KI folgende Inhalte erstellen:

persönliche Positionierung

zentrale Bewerbungsbotschaft

Motivation für das Unternehmen

Motivation für die Rolle

drei bis fünf Kernargumente

relevante Stationen aus dem Lebenslauf

passende Projekterfahrungen

passende messbare Erfolge

Umgang mit Kompetenzlücken

mögliche Einwände des Arbeitgebers

Gegenargumente

Kommunikationsstil

empfohlene Tonalität

Keywords für Anschreiben und Lebenslauf

Erstelle ein Feld „Meine Bewerbungsstory“.

Diese Story soll in drei Varianten dargestellt werden:

Kurzfassung in einem Satz

Elevator Pitch mit etwa 60 Sekunden

ausführliche Argumentationslinie

4. Anschreiben und Lebenslauf erstellen

Ziel

Aus den bisherigen Ergebnissen werden individuelle und versandfertige Bewerbungsunterlagen erstellt.

Anschreiben

Die KI soll ein individuelles Anschreiben erstellen.

Anforderungen:

maximal eine Seite

klarer Unternehmensbezug

konkreter Bezug zur Stelle

keine generischen Floskeln

keine erfundenen Erfahrungen

keine Wiederholung des gesamten Lebenslaufs

klare Motivation

zwei bis drei belastbare Eignungsargumente

professioneller Abschluss

anpassbare Tonalität

Tonalitäten:

klassisch und seriös

modern und direkt

strategisch und executive

persönlich und motiviert

Der Nutzer soll einzelne Absätze regenerieren und bearbeiten können.

Erstelle folgende Funktionen:

Anschreiben neu generieren

Absatz verbessern

Absatz kürzen

Absatz konkreter formulieren

Tonalität ändern

Unternehmensbezug erhöhen

Floskeln entfernen

Rechtschreibung prüfen

Entwurf speichern

Versionen vergleichen

als PDF oder DOCX exportieren

Lebenslauf

Erstelle einen CV-Editor mit folgenden Bereichen:

Kontaktdaten

Titel

Kurzprofil

Kernkompetenzen

Berufserfahrung

Projekte

Ausbildung

Zertifikate

Sprachen

IT-Kenntnisse

weitere Kenntnisse

Für jede Zielstelle soll eine eigene CV-Version gespeichert werden können.

Funktionen:

Inhalte aus dem Master-CV übernehmen

Inhalte stellenbezogen priorisieren

Keywords integrieren

Bullet Points optimieren

Ergebnisse quantifizieren

irrelevante Abschnitte ausblenden

Reihenfolge ändern

ATS-Ansicht

Designansicht

PDF-Export

DOCX-Export

Versionshistorie

Qualitätsprüfung

Vor der Freigabe soll ein automatischer Bewerbungscheck erfolgen:

Vollständigkeit

Rechtschreibung

Grammatik

Konsistenz von Daten

Übereinstimmung zwischen Anschreiben und Lebenslauf

ATS-Kompatibilität

Keyword-Abdeckung

Lesbarkeit

Dateinamen

Seitenzahl

mögliche Übertreibungen

möglicherweise erfundene Aussagen

Zeige das Ergebnis als Checkliste mit Status:

bestanden

prüfen

kritisch

5. Interviewvorbereitung

Ziel

Die Anwendung bereitet den Nutzer gezielt auf unterschiedliche Gesprächsrunden vor.

Interview-Dashboard

Erstelle eine Interviewübersicht mit folgenden Gesprächsarten:

HR-Interview

Recruiter-Gespräch

Fachinterview

Hiring-Manager-Interview

Management-Gespräch

Vorstandsgespräch

Case Study

Präsentation

Assessment Center

Gehaltsverhandlung

Interview-Briefing

Die KI soll auf Basis der bisherigen Daten ein kompaktes Briefing erstellen:

Zusammenfassung des Unternehmens

zentrale Stellenanforderungen

wichtigste Herausforderungen der Rolle

drei stärkste Argumente des Bewerbers

mögliche Schwachpunkte

aktuelle Unternehmensentwicklungen

mögliche Gesprächspartner

wahrscheinliche Interessen der Gesprächspartner

empfohlene Rückfragen

Wahrscheinliche Interviewfragen

Erstelle Fragen aus folgenden Kategorien:

Motivation

Lebenslauf

Fachkompetenz

Führung

Transformation

Projektmanagement

Konflikte

Veränderungsmanagement

Erfolge

Fehler und Misserfolge

Stakeholdermanagement

Gehalt

Wechselmotivation

kritische Lücken

Verfügbarkeit

Jede Frage soll enthalten:

Wahrscheinlichkeit

Schwierigkeitsgrad

Ziel der Frage

empfohlene Antwortstruktur

individuelle Musterantwort

mögliche kritische Nachfrage

STAR-Antworten

Erstelle einen STAR-Story-Editor mit:

Situation

Task

Action

Result

Erkenntnis

Bezug zur Zielstelle

Der Nutzer soll persönliche Projekte als wiederverwendbare STAR-Stories speichern können.

Interview-Simulation

Baue eine Chat-basierte Interviewsimulation.

Der Nutzer kann auswählen:

Gesprächspartner

Gesprächsdauer

Schwierigkeitsgrad

Interviewtyp

Sprache

freundlicher oder kritischer Gesprächsstil

Die KI stellt jeweils eine Frage und wartet auf die Antwort.

Nach jeder Antwort soll die KI optional Feedback geben zu:

Klarheit

Struktur

Relevanz

Konkretheit

Glaubwürdigkeit

Wirkung

Länge

Bezug zur Stelle

Am Ende der Simulation soll ein Gesamtfeedback erstellt werden:

Gesamtbewertung

Stärken

Schwächen

kritische Antworten

Verbesserungsvorschläge

Wahrscheinlichkeit für die nächste Runde

empfohlene Trainingsschwerpunkte

Rückfragen an den Arbeitgeber

Erstelle individuelle Rückfragen für:

HR

direkten Vorgesetzten

Geschäftsführung

zukünftige Kollegen

Projektverantwortliche

Bewerte jede Rückfrage nach:

strategischer Wirkung

Informationsgewinn

Risiko

Eignung für die Gesprächsphase

Bewerbungsmanagement

Ergänze ein zentrales Kanban-Board mit folgenden Statusspalten:

Gefunden

In Prüfung

Hoher Match

Bewerbung vorbereiten

Bewerbung versendet

Rückmeldung ausstehend

Interview geplant

Zweite Runde

Angebot

Absage

Zurückgezogen

Jede Bewerbung erhält:

Unternehmen

Position

Match-Score

Bewerbungsdatum

nächster Termin

Ansprechpartner

Gehaltsband

Notizen

Aufgaben

Dokumente

Interviewstatus

Erstelle zusätzlich:

Kalenderansicht

Erinnerungen

Aufgabenliste

Aktivitätsverlauf

Bewerbungsstatistik

Bewerbungsstatistik

Zeige Kennzahlen wie:

gefundene Stellen

analysierte Stellen

durchschnittlicher Match-Score

erstellte Bewerbungen

versendete Bewerbungen

Rückmeldungsquote

Interviewquote

Angebotsquote

durchschnittliche Bearbeitungszeit

häufigste Kompetenzlücken

KI-Funktionalität

Bereite die Anwendung so vor, dass ein Large Language Model über eine API angebunden werden kann.

Erstelle eine zentrale AI-Service-Schicht mit austauschbarem Provider.

Vorgesehene KI-Funktionen:

Lebenslauf analysieren

Stellenausschreibung strukturieren

Match-Score erzeugen

Kompetenzlücken erkennen

CV-Optimierungen vorschlagen

Unternehmensinformationen zusammenfassen

Bewerbungsstrategie entwickeln

Anschreiben erstellen

CV-Inhalte verbessern

Interviewfragen generieren

STAR-Antworten erstellen

Interview simulieren

Antworten bewerten

Nutze strukturierte JSON-Ausgaben für KI-Ergebnisse.

Alle KI-Inhalte müssen vom Nutzer bearbeitet und bestätigt werden können.

Die KI darf keine Erfahrungen, Arbeitgeber, Projekte, Kompetenzen, Zertifikate oder Erfolge erfinden. Nicht belegte Aussagen müssen deutlich als Vorschlag oder Annahme gekennzeichnet werden.

Datenmodell

Erstelle mindestens folgende Entitäten:

User

id

name

email

settings

created_at

CandidateProfile

id

user_id

contact_data

career_summary

skills

industries

experience_years

leadership_experience

education

certificates

languages

preferences

MasterCV

id

user_id

original_file

extracted_text

structured_content

updated_at

SearchProfile

id

user_id

target_roles

countries

regions

remote_preferences

salary_minimum

industries

excluded_industries

seniority

travel_preferences

exclusion_criteria

JobPosting

id

user_id

title

company

location

country

remote_share

source

original_url

description

publication_date

salary_range

contact_person

status

MatchAnalysis

id

job_posting_id

candidate_profile_id

overall_score

category_scores

fulfilled_requirements

partial_requirements

missing_requirements

transferable_skills

risks

differentiators

cv_recommendations

CompanyResearch

id

company

sources

profile

strategy

market

competitors

culture

news

opportunities

risks

assumptions

ApplicationStrategy

id

job_posting_id

positioning

core_message

motivation

arguments

objections

counterarguments

elevator_pitch

ApplicationDocument

id

job_posting_id

document_type

content

version

status

created_at

InterviewPreparation

id

job_posting_id

interview_type

briefing

questions

star_stories

feedback

preparation_status

Application

id

job_posting_id

status

application_date

next_action

next_action_date

contact_person

notes

Seitenstruktur

Erstelle folgende Hauptnavigation:

Dashboard

Mein Profil

Stellensuche

Match-Analysen

Bewerbungen

Dokumente

Interviewtraining

Einstellungen

Dashboard

Das Dashboard soll enthalten:

Begrüßung

Fortschritt des persönlichen Profils

neue Stellen

Stellen mit höchstem Match

offene Aufgaben

bevorstehende Interviews

Bewerbungsstatus

zentrale Kennzahlen

Schnellaktionen

Schnellaktionen:

Lebenslauf hochladen

Stelle hinzufügen

Match analysieren

Bewerbung erstellen

Interview starten

Design

Erstelle ein professionelles, ruhiges und hochwertiges SaaS-Design.

Designprinzipien:

modern

übersichtlich

seriös

vertrauenswürdig

wenig visuelle Ablenkung

klare Informationshierarchie

viel Weißraum

gut lesbare Typografie

responsive Darstellung

Verwende:

linke Sidebar für die Hauptnavigation

oberen Header mit Suche, Benachrichtigungen und Benutzerprofil

Karten für Kennzahlen

Tabellen für Stellen und Bewerbungen

Tabs für Detailseiten

Fortschrittsanzeigen für den Bewerbungsprozess

dezente Statusfarben

Tooltips für komplexe Bewertungen

leere Zustände mit klaren Handlungsaufforderungen

Die Anwendung soll auf Desktop, Tablet und Smartphone funktionieren.

Technische Anforderungen

Nutze:

React

TypeScript

Tailwind CSS

Supabase für Datenbank, Authentifizierung und Dateispeicherung

wiederverwendbare Komponenten

klare Trennung von UI, Datenzugriff und KI-Services

Row Level Security

sichere Speicherung personenbezogener Daten

Formularvalidierung

Loading States

Error States

Toast-Benachrichtigungen

Versionshistorie für Bewerbungsunterlagen

Erstelle zunächst eine funktionierende MVP-Version.

MVP-Prioritäten

Die erste Version muss folgende Funktionen vollständig abbilden:

Registrierung und Login

Lebenslauf-Upload

manuelle Pflege des Suchprofils

manuelles Hinzufügen einer Stellenausschreibung

strukturierte Anzeige des Lebenslaufs

Match-Analyse zwischen Lebenslauf und Stelle

CV-Optimierungsvorschläge

Unternehmens- und Bewerbungsstrategie

Generierung eines Anschreibens

Erstellung einer stellenbezogenen CV-Version

Interviewfragen und STAR-Antworten

Chat-basierte Interviewsimulation

Bewerbungs-Kanban

Speicherung aller Ergebnisse

Verwende für die erste Version realistische Demo-Daten, damit alle Ansichten unmittelbar getestet werden können.

Baue keine rein statische Landingpage. Erstelle eine tatsächlich nutzbare Anwendung mit Navigation, Formularen, Datenbankstruktur, CRUD-Funktionen, Demo-Daten und vorbereiteten KI-Schnittstellen.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5be4fded-8ea6-46dd-b40a-04a173c6a5ef).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
