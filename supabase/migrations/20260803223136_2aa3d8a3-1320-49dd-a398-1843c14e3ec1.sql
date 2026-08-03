
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  headline TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.master_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  file_name TEXT,
  extracted_text TEXT,
  structured_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.search_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_roles TEXT[] NOT NULL DEFAULT '{}',
  countries TEXT[] NOT NULL DEFAULT '{}',
  regions TEXT[] NOT NULL DEFAULT '{}',
  work_model TEXT,
  max_office_days INT,
  travel_readiness TEXT,
  salary_minimum INT,
  seniority TEXT,
  leadership_scope TEXT,
  company_sizes TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  excluded_industries TEXT[] NOT NULL DEFAULT '{}',
  exclusion_criteria TEXT,
  contract_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  country TEXT,
  region TEXT,
  remote_share TEXT,
  seniority TEXT,
  source TEXT,
  original_url TEXT,
  description TEXT,
  publication_date DATE,
  deadline DATE,
  salary_range TEXT,
  salary_value INT,
  contact_person TEXT,
  status TEXT NOT NULL DEFAULT 'gefunden',
  priority INT NOT NULL DEFAULT 3,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.match_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings ON DELETE CASCADE,
  overall_score INT NOT NULL DEFAULT 0,
  category_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  outlook TEXT,
  fulfilled_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  partial_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  transferable_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  differentiators JSONB NOT NULL DEFAULT '[]'::jsonb,
  cv_recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.company_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_posting_id UUID REFERENCES public.job_postings ON DELETE CASCADE,
  company TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_input TEXT,
  dossier JSONB NOT NULL DEFAULT '{}'::jsonb,
  assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  open_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.application_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings ON DELETE CASCADE,
  positioning TEXT,
  core_message TEXT,
  motivation_company TEXT,
  motivation_role TEXT,
  arguments JSONB NOT NULL DEFAULT '[]'::jsonb,
  objections JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  tone TEXT,
  story_one_liner TEXT,
  story_elevator TEXT,
  story_long TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_posting_id UUID REFERENCES public.job_postings ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'cover_letter',
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  tone TEXT,
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'entwurf',
  quality_check JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.interview_preparations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings ON DELETE CASCADE,
  interview_type TEXT NOT NULL DEFAULT 'hr',
  briefing JSONB NOT NULL DEFAULT '{}'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  reverse_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
  preparation_status TEXT NOT NULL DEFAULT 'offen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.star_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_posting_id UUID REFERENCES public.job_postings ON DELETE SET NULL,
  title TEXT NOT NULL,
  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  learning TEXT,
  relevance TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'gefunden',
  application_date DATE,
  next_action TEXT,
  next_action_date DATE,
  contact_person TEXT,
  salary_band TEXT,
  notes TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.master_cvs, public.search_profiles, public.job_postings, public.match_analyses, public.company_research, public.application_strategies, public.application_documents, public.interview_preparations, public.star_stories, public.applications TO authenticated;
GRANT ALL ON public.profiles, public.master_cvs, public.search_profiles, public.job_postings, public.match_analyses, public.company_research, public.application_strategies, public.application_documents, public.interview_preparations, public.star_stories, public.applications TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_preparations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.star_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own master_cvs" ON public.master_cvs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own search_profiles" ON public.search_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own job_postings" ON public.job_postings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own match_analyses" ON public.match_analyses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own company_research" ON public.company_research FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own application_strategies" ON public.application_strategies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own application_documents" ON public.application_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own interview_preparations" ON public.interview_preparations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own star_stories" ON public.star_stories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own applications" ON public.applications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER t_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_master_cvs_upd BEFORE UPDATE ON public.master_cvs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_search_profiles_upd BEFORE UPDATE ON public.search_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_job_postings_upd BEFORE UPDATE ON public.job_postings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_match_analyses_upd BEFORE UPDATE ON public.match_analyses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_company_research_upd BEFORE UPDATE ON public.company_research FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_application_strategies_upd BEFORE UPDATE ON public.application_strategies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_application_documents_upd BEFORE UPDATE ON public.application_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_interview_preparations_upd BEFORE UPDATE ON public.interview_preparations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_star_stories_upd BEFORE UPDATE ON public.star_stories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_applications_upd BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  uid UUID := NEW.id;
  j1 UUID; j2 UUID; j3 UUID; j4 UUID;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, headline, location)
  VALUES (uid, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Dr. Michael Berger'), NEW.email,
          'Head of Business Transformation | Strategie & Operational Excellence', 'Mainz, Rheinland-Pfalz');

  INSERT INTO public.master_cvs (user_id, file_name, confirmed, extracted_text, structured_content)
  VALUES (uid, 'Lebenslauf_Berger_2026.pdf', true,
'BERUFSERFAHRUNG
2021 - heute | Head of Business Transformation, Meridian Industries AG, Wiesbaden
Verantwortung für das konzernweite Transformationsportfolio (18 Programme, 42 Mio. EUR Budget), Führung von 24 Mitarbeitenden in einer Matrixorganisation.
2016 - 2021 | Senior Manager Strategy & Operations, Halden Consulting GmbH, Frankfurt
Beratung von Industrie- und Pharmakunden zu Wachstumsstrategie, Operating Model und Prozessexzellenz.
2011 - 2016 | Projektleiter Prozessmanagement, Rheinwerk Technologies, Mainz

AUSBILDUNG
Dr. rer. pol., Universität Mannheim | Diplom-Kaufmann, Universität Mainz

ZERTIFIKATE
PMP, Prosci Change Practitioner, Six Sigma Black Belt, SAFe Agilist

SPRACHEN
Deutsch (Muttersprache), Englisch (verhandlungssicher), Französisch (B1)',
'{"summary":"Transformationsverantwortlicher mit 15 Jahren Erfahrung an der Schnittstelle von Strategie, Prozessexzellenz und Digitalisierung.","experience":[{"company":"Meridian Industries AG","role":"Head of Business Transformation","period":"2021 - heute","industry":"Industrie","achievements":["Portfolio von 18 Transformationsprogrammen mit 42 Mio. EUR Budget verantwortet","EBIT-Effekt von 27 Mio. EUR über drei Jahre realisiert","Time-to-Market um 31 Prozent reduziert"]},{"company":"Halden Consulting GmbH","role":"Senior Manager Strategy & Operations","period":"2016 - 2021","industry":"Beratung","achievements":["14 Klientenprojekte im Operating-Model-Redesign geleitet","Durchschnittliche Kosteneinsparung von 12 Prozent je Programm"]},{"company":"Rheinwerk Technologies","role":"Projektleiter Prozessmanagement","period":"2011 - 2016","industry":"Technologie","achievements":["End-to-End-Prozesslandkarte für 900 Mitarbeitende aufgebaut"]}],"skills":["Strategieentwicklung","Business Transformation","Operational Excellence","Prozessmanagement","Programmmanagement","Change Management","Operating Model Design","KI-Transformation"],"methods":["Lean Six Sigma","SAFe","Prosci ADKAR","OKR","Design Thinking"],"leadership":"24 direkte Mitarbeitende, Matrixführung von bis zu 80 Personen","education":[{"degree":"Dr. rer. pol.","institution":"Universität Mannheim","year":"2011"},{"degree":"Diplom-Kaufmann","institution":"Universität Mainz","year":"2007"}],"certificates":["PMP","Prosci Change Practitioner","Six Sigma Black Belt","SAFe Agilist"],"languages":[{"name":"Deutsch","level":"Muttersprache"},{"name":"Englisch","level":"Verhandlungssicher"},{"name":"Französisch","level":"B1"}],"tools":["SAP S/4HANA","Celonis","Jira","Power BI","Miro"],"career_level":"Senior Führungskraft / Bereichsleitung","target_roles":["Head of Transformation","Director Business Excellence","VP Strategy & Operations"],"alternative_titles":["Transformation Director","Head of Corporate Development","Programmleiter Digitalisierung"]}'::jsonb);

  INSERT INTO public.search_profiles (user_id, target_roles, countries, regions, work_model, max_office_days, travel_readiness, salary_minimum, seniority, leadership_scope, company_sizes, industries, excluded_industries, exclusion_criteria, contract_type)
  VALUES (uid, ARRAY['Business Transformation','Strategieentwicklung','Digitale Transformation','Operational Excellence','Programmmanagement'],
          ARRAY['Deutschland','Schweiz'], ARRAY['Rheinland-Pfalz','Hessen','Bayern'], 'Hybrid', 2, 'bis 30 Prozent', 145000,
          'Senior / Bereichsleitung', 'Disziplinarische Führung ab 10 Mitarbeitenden', ARRAY['1.000 - 5.000','über 5.000'],
          ARRAY['Industrie','Pharma','Technologie','Energie'], ARRAY['Glücksspiel','Rüstung'],
          'Keine reine Vor-Ort-Präsenz, keine Reisetätigkeit über 50 Prozent', 'Unbefristete Festanstellung');

  INSERT INTO public.job_postings (user_id, title, company, location, country, region, remote_share, seniority, source, original_url, publication_date, deadline, salary_range, salary_value, contact_person, status, priority, description)
  VALUES
   (uid,'Head of Business Transformation','Nordlicht Pharma SE','Wiesbaden','Deutschland','Hessen','60 % Remote','Bereichsleitung','LinkedIn','https://example.com/jobs/nordlicht-transformation', CURRENT_DATE - 4, CURRENT_DATE + 24, '160.000 - 185.000 EUR', 172000,'Frau Dr. Anke Reimann, VP People','hoher_match',1,
    'Nordlicht Pharma SE sucht eine Führungspersönlichkeit für die konzernweite Transformationsagenda. Aufgaben: Verantwortung für das Transformationsportfolio, Aufbau eines Transformation Office, Steuerung von Digitalisierungs- und KI-Initiativen, Führung eines Teams von 15 Personen, Berichtslinie an den COO. Anforderungen: mindestens 10 Jahre Erfahrung in Transformation oder Strategie, Erfahrung im regulierten Pharmaumfeld, nachweisbare Programmverantwortung ab 20 Mio. EUR, Change-Management-Zertifizierung, verhandlungssicheres Englisch, GxP-Kenntnisse von Vorteil.'),
   (uid,'Director Operational Excellence','Helvetia Precision AG','Zug','Schweiz','Zug','40 % Remote','Direktor','Unternehmenswebsite','https://example.com/jobs/helvetia-opex', CURRENT_DATE - 11, CURRENT_DATE + 10, 'CHF 190.000 - 215.000', 195000,'Herr Marc Bächtold','in_pruefung',2,
    'Als Director Operational Excellence verantworten Sie die Effizienzagenda der Gruppe über sechs Produktionsstandorte. Anforderungen: Six Sigma Black Belt, Erfahrung in der Fertigungsindustrie, Führung internationaler Teams, Erfahrung mit Shopfloor-Digitalisierung, Reisebereitschaft 40 Prozent, Deutsch und Englisch fließend.'),
   (uid,'Vice President Corporate Development','Rheinfels Energie GmbH','Mainz','Deutschland','Rheinland-Pfalz','Hybrid, 2 Tage Büro','VP','Xing','https://example.com/jobs/rheinfels-vp', CURRENT_DATE - 2, CURRENT_DATE + 30, '175.000 - 200.000 EUR', 187000,'Frau Julia Sander, CEO Office','gefunden',1,
    'Für den Ausbau des Geschäftsmodells im Bereich erneuerbare Energien suchen wir eine VP Corporate Development. Aufgaben: Konzernstrategie, M&A-Pipeline, Beteiligungssteuerung, Aufbau neuer Geschäftsfelder. Anforderungen: Erfahrung in Strategie oder Top-Management-Beratung, M&A-Transaktionserfahrung, Erfahrung in der Energiewirtschaft, Promotion von Vorteil, Auftritt auf Vorstandsebene.'),
   (uid,'Head of AI Transformation','Bavaria Digital Systems GmbH','München','Deutschland','Bayern','100 % Remote möglich','Bereichsleitung','Jobportal','https://example.com/jobs/bavaria-ai', CURRENT_DATE - 18, CURRENT_DATE + 5, '155.000 - 175.000 EUR', 165000,'Herr Tobias Krenz','bewerbung_versendet',2,
    'Wir suchen eine Leitung für die KI-Transformation: Aufbau der KI-Roadmap, Use-Case-Portfolio, Data-Governance, Zusammenarbeit mit Produkt und IT. Anforderungen: Erfahrung in Digitalisierungsprogrammen, technisches Grundverständnis für Machine Learning und LLM, Erfahrung im Aufbau von Data- und AI-Organisationen, Stakeholdermanagement bis Vorstandsebene.')
  RETURNING id INTO j1;

  SELECT id INTO j1 FROM public.job_postings WHERE user_id = uid AND company = 'Nordlicht Pharma SE';
  SELECT id INTO j2 FROM public.job_postings WHERE user_id = uid AND company = 'Helvetia Precision AG';
  SELECT id INTO j3 FROM public.job_postings WHERE user_id = uid AND company = 'Rheinfels Energie GmbH';
  SELECT id INTO j4 FROM public.job_postings WHERE user_id = uid AND company = 'Bavaria Digital Systems GmbH';

  INSERT INTO public.match_analyses (user_id, job_posting_id, overall_score, summary, outlook, category_scores, fulfilled_requirements, partial_requirements, missing_requirements, transferable_skills, risks, differentiators, cv_recommendations) VALUES
  (uid, j1, 87,
   'Sehr starke Passung im Kern der Rolle: Portfolioverantwortung, Transformation Office und Führungserfahrung sind durchgängig belegt. Hauptlücke ist die fehlende Erfahrung im regulierten Pharmaumfeld.',
   'sehr hohe Passung',
   '[{"label":"Fachliche Kompetenzen","score":92},{"label":"Berufserfahrung","score":95},{"label":"Führungserfahrung","score":90},{"label":"Branchenerfahrung","score":55},{"label":"Methodenkenntnisse","score":93},{"label":"Ausbildung","score":95},{"label":"Sprachkenntnisse","score":90},{"label":"Seniorität","score":88},{"label":"Standort und Mobilität","score":95},{"label":"Arbeitsmodell","score":90},{"label":"Gehaltskompatibilität","score":88},{"label":"Kulturelle Passung","score":75}]'::jsonb,
   '["Mehr als 10 Jahre Erfahrung in Transformation und Strategie","Programmverantwortung über 20 Mio. EUR (42 Mio. EUR Portfolio)","Change-Management-Zertifizierung (Prosci)","Verhandlungssicheres Englisch","Disziplinarische Führung von 24 Mitarbeitenden"]'::jsonb,
   '["Aufbau eines Transformation Office: Strukturen wurden weiterentwickelt, ein Neuaufbau ist im Lebenslauf nicht explizit belegt","KI-Initiativen: Erfahrung vorhanden, aber ohne messbare Ergebnisse dokumentiert"]'::jsonb,
   '["Erfahrung im regulierten Pharmaumfeld","GxP-Kenntnisse"]'::jsonb,
   '["Erfahrung in stark regulierten Industrieprozessen als Brücke zu GxP","Beratungserfahrung mit Pharmakunden bei Halden Consulting"]'::jsonb,
   '["Recruiter könnte fehlende Pharmaerfahrung als K.-o.-Kriterium werten","Wechsel aus der Industrie in die Pharmabranche erfordert klare Begründung"]'::jsonb,
   '["Kombination aus Beratung und Linienverantwortung","Nachweisbarer EBIT-Effekt von 27 Mio. EUR","Promotion plus Six Sigma Black Belt"]'::jsonb,
   '[{"area":"Kurzprofil","current":"Transformationsverantwortlicher mit 15 Jahren Erfahrung an der Schnittstelle von Strategie, Prozessexzellenz und Digitalisierung.","suggestion":"Transformationsverantwortlicher mit 15 Jahren Erfahrung in stark regulierten Industrieumfeldern - verantwortlich für ein Portfolio von 42 Mio. EUR und 27 Mio. EUR realisierten EBIT-Effekt.","reason":"Regulierungsbezug und Zahlen adressieren die Kernanforderung der Stelle.","relevance":"hoch"},{"area":"Keywords","current":"Prozessmanagement, Change Management","suggestion":"Ergänzen: Transformation Office, Portfoliosteuerung, regulatorische Compliance, Data Governance","reason":"Diese Begriffe stehen wörtlich in der Ausschreibung und erhöhen die ATS-Trefferquote.","relevance":"hoch"},{"area":"Berufserfahrung Meridian","current":"Verantwortung für das konzernweite Transformationsportfolio","suggestion":"Aufbau und Leitung des konzernweiten Transformation Office mit 18 Programmen, 42 Mio. EUR Budget und direkter Berichtslinie an den COO","reason":"Spiegelt die ausgeschriebene Aufgabe und Berichtslinie präzise.","relevance":"hoch"},{"area":"Zertifikate","current":"PMP, Prosci, Six Sigma Black Belt, SAFe","suggestion":"Prosci Change Practitioner an erste Stelle setzen","reason":"Die Ausschreibung nennt Change-Zertifizierung explizit als Anforderung.","relevance":"mittel"}]'::jsonb),
  (uid, j2, 71,
   'Solide Passung über Methodik und Führungserfahrung. Einschränkungen bestehen bei Fertigungserfahrung im Schweizer Markt und der geforderten Reisebereitschaft.',
   'gute Passung',
   '[{"label":"Fachliche Kompetenzen","score":85},{"label":"Berufserfahrung","score":80},{"label":"Führungserfahrung","score":82},{"label":"Branchenerfahrung","score":60},{"label":"Methodenkenntnisse","score":95},{"label":"Ausbildung","score":90},{"label":"Sprachkenntnisse","score":85},{"label":"Seniorität","score":80},{"label":"Standort und Mobilität","score":45},{"label":"Arbeitsmodell","score":60},{"label":"Gehaltskompatibilität","score":85},{"label":"Kulturelle Passung","score":70}]'::jsonb,
   '["Six Sigma Black Belt","Führung internationaler Teams","Deutsch und Englisch fließend"]'::jsonb,
   '["Erfahrung in der Fertigungsindustrie über Industriekunden vorhanden, aber nicht in Linienverantwortung an Produktionsstandorten"]'::jsonb,
   '["Reisebereitschaft von 40 Prozent liegt über dem Suchprofil","Erfahrung mit Shopfloor-Digitalisierung nicht belegt"]'::jsonb,
   '["Celonis-Erfahrung als Brücke zur Shopfloor-Transparenz","Multi-Site-Programmsteuerung bei Meridian"]'::jsonb,
   '["Standort Zug erfordert Umzug oder hohe Reisetätigkeit","Fehlende Schweizer Marktkenntnis"]'::jsonb,
   '["Seltene Kombination aus Black Belt und Portfolioverantwortung"]'::jsonb,
   '[{"area":"Kernkompetenzen","current":"Operational Excellence","suggestion":"Operational Excellence in Multi-Site-Produktionsnetzwerken","reason":"Direkter Bezug zu sechs Produktionsstandorten.","relevance":"hoch"},{"area":"Mobilität","current":"nicht angegeben","suggestion":"Hinweis auf Bereitschaft zu regelmäßiger Präsenz in der Schweiz ergänzen","reason":"Entkräftet das größte Ausschlussrisiko.","relevance":"hoch"}]'::jsonb),
  (uid, j3, 79,
   'Strategie-, Beratungs- und Vorstandserfahrung passen sehr gut. M&A-Transaktionserfahrung ist der zentrale Nachweis, der fehlt.',
   'realistische Bewerbung',
   '[{"label":"Fachliche Kompetenzen","score":85},{"label":"Berufserfahrung","score":88},{"label":"Führungserfahrung","score":85},{"label":"Branchenerfahrung","score":50},{"label":"Methodenkenntnisse","score":80},{"label":"Ausbildung","score":98},{"label":"Sprachkenntnisse","score":90},{"label":"Seniorität","score":82},{"label":"Standort und Mobilität","score":100},{"label":"Arbeitsmodell","score":95},{"label":"Gehaltskompatibilität","score":92},{"label":"Kulturelle Passung","score":78}]'::jsonb,
   '["Erfahrung in Top-Management-Beratung","Promotion","Auftritt auf Vorstandsebene","Standort Mainz"]'::jsonb,
   '["Aufbau neuer Geschäftsfelder über Innovationsprogramme belegt, jedoch ohne P&L-Verantwortung"]'::jsonb,
   '["M&A-Transaktionserfahrung","Erfahrung in der Energiewirtschaft"]'::jsonb,
   '["Beteiligungssteuerung über Portfoliomanagement übertragbar","Due-Diligence-nahe Analysen aus der Beratung"]'::jsonb,
   '["Fehlende Transaktionserfahrung im engeren Sinn","Quereinstieg in die Energiebranche"]'::jsonb,
   '["Regionale Verwurzelung in Rheinland-Pfalz","Verbindung aus Strategie und Umsetzungsstärke"]'::jsonb,
   '[{"area":"Kurzprofil","current":"Strategie, Prozessexzellenz und Digitalisierung","suggestion":"Strategie, Geschäftsmodellentwicklung und Portfoliosteuerung","reason":"Trifft die Sprache der Corporate-Development-Rolle.","relevance":"hoch"}]'::jsonb);

  INSERT INTO public.company_research (user_id, job_posting_id, company, sources, dossier, assumptions, open_questions)
  VALUES (uid, j1, 'Nordlicht Pharma SE',
   '[{"type":"Unternehmenswebsite","url":"https://example.com/nordlicht"},{"type":"Geschäftsbericht 2025","url":"https://example.com/nordlicht/gb2025"}]'::jsonb,
   '{"profile":"Mittelgroßes europäisches Pharmaunternehmen mit Schwerpunkt auf Generika und Spezialpräparaten, rund 6.800 Mitarbeitende, Hauptsitz Wiesbaden.","business_model":"Entwicklung, Zulassung und Vertrieb von verschreibungspflichtigen Präparaten in 24 Märkten.","market":"Wachsender Generikamarkt mit hohem Preisdruck und zunehmender Regulierung.","competitors":"Stada, Hexal, Dr. Reddy''s Europe","strategy":"Programm Nordlicht 2030: Portfoliobereinigung, Digitalisierung der Produktion und Aufbau eines datengetriebenen Zulassungsprozesses.","transformation":"Konzernweites Effizienzprogramm mit Zielgröße 80 Mio. EUR bis 2028.","ai":"Erste Pilotprojekte zu KI-gestützter Dokumentenprüfung in Regulatory Affairs.","news":"Übernahme eines Produktionsstandorts in Portugal im Q4 2025.","leadership":"CEO seit 2023, COO-Position im Aufbau des Transformationsbereichs führend.","culture":"Ergebnisorientiert, konsensgetrieben, hohe Bedeutung von Compliance.","ratings":"3,7 von 5 auf Arbeitgeberplattformen; gelobt werden Stabilität und Weiterbildung, kritisiert werden langsame Entscheidungswege.","opportunities":"Hoher Handlungsdruck schafft Mandat für die Rolle.","risks":"Historisch gewachsene Silostrukturen, langsame Entscheidungsprozesse.","role_challenges":"Transformation Office muss gegen etablierte Bereichsinteressen durchgesetzt werden."}'::jsonb,
   '["Die Berichtslinie an den COO deutet auf ein starkes Mandat hin - nicht offiziell bestätigt.","Das Effizienzziel von 80 Mio. EUR stammt aus einer Presseeinschätzung."]'::jsonb,
   '["Wie groß ist das Budget des Transformation Office im ersten Jahr?","Welche Entscheidungsbefugnis hat die Rolle gegenüber Bereichsleitungen?","Wie wird der Erfolg nach zwölf Monaten gemessen?"]'::jsonb);

  INSERT INTO public.application_strategies (user_id, job_posting_id, positioning, core_message, motivation_company, motivation_role, arguments, objections, keywords, tone, story_one_liner, story_elevator, story_long)
  VALUES (uid, j1,
   'Transformationsverantwortlicher, der Strategie und Umsetzung verbindet und Effizienzprogramme in regulierten Industrieumfeldern messbar zum Ergebnis bringt.',
   'Ich baue Transformationsstrukturen auf, die auch gegen gewachsene Silos liefern - nachweisbar mit 27 Mio. EUR EBIT-Effekt.',
   'Nordlicht steht mit dem Programm 2030 vor genau der Aufgabe, die ich in den letzten fünf Jahren bei Meridian verantwortet habe: Portfolio schärfen, Prozesse digitalisieren, Entscheidungswege verkürzen.',
   'Die Rolle verbindet Portfolioverantwortung mit dem Aufbau eines Transformation Office und direkter Berichtslinie an den COO - das entspricht meiner Erfahrung und meinem nächsten Entwicklungsschritt.',
   '["Portfolioverantwortung über 42 Mio. EUR und 18 Programme","27 Mio. EUR realisierter EBIT-Effekt in drei Jahren","Aufbau von Governance- und Steuerungsstrukturen in einer Matrixorganisation","Prosci- und Six-Sigma-Methodik in der Linie angewendet, nicht nur beraten"]'::jsonb,
   '[{"objection":"Keine Pharmaerfahrung","counter":"Fünf Jahre Steuerung regulierter Industrieprozesse mit Audit- und Compliance-Anforderungen sowie Pharmaprojekte aus der Beratungszeit."},{"objection":"Transformation Office wurde nicht neu aufgebaut","counter":"Die Governance bei Meridian wurde 2022 vollständig neu aufgesetzt, inklusive Portfolioboard und Nutzenverfolgung."}]'::jsonb,
   ARRAY['Transformation Office','Portfoliosteuerung','Change Management','Operational Excellence','Data Governance','regulatorische Compliance'],
   'strategisch und executive',
   'Ich mache Transformationsprogramme in regulierten Umfeldern messbar wirksam.',
   'In den letzten fünf Jahren habe ich bei Meridian Industries das konzernweite Transformationsportfolio verantwortet: 18 Programme, 42 Mio. EUR Budget, 24 Mitarbeitende. Entscheidend war nicht die Programmliste, sondern die Steuerung - wir haben ein Portfolioboard etabliert, Nutzenverfolgung eingeführt und dadurch 27 Mio. EUR EBIT-Effekt realisiert. Genau diese Kombination aus Struktur und Durchsetzungsfähigkeit möchte ich bei Nordlicht in das Programm 2030 einbringen.',
   'Meine Laufbahn folgt einer klaren Linie: erst Prozessverantwortung in der Linie, dann Strategie- und Operating-Model-Beratung, heute Portfolioverantwortung im Konzern. Diese Abfolge erlaubt mir, Transformationsziele nicht nur zu definieren, sondern gegen operative Widerstände durchzusetzen. Bei Meridian war die Ausgangslage vergleichbar mit Nordlicht: gewachsene Silos, hoher Kostendruck, ein Portfolio ohne belastbare Nutzenverfolgung. Wir haben zuerst Transparenz geschaffen, dann priorisiert und schließlich konsequent gemessen.');

  INSERT INTO public.application_documents (user_id, job_posting_id, document_type, title, tone, version, status, content, quality_check)
  VALUES (uid, j1, 'cover_letter', 'Anschreiben Nordlicht Pharma SE', 'strategisch und executive', 2, 'in_pruefung',
   '{"salutation":"Sehr geehrte Frau Dr. Reimann,","paragraphs":[{"id":"p1","label":"Einstieg","text":"mit dem Programm Nordlicht 2030 stellen Sie Portfolio, Produktion und Zulassungsprozesse gleichzeitig neu auf. Genau diese Aufgabe habe ich in den vergangenen fünf Jahren bei Meridian Industries verantwortet - mit einem Portfolio von 18 Programmen und 42 Mio. EUR Budget."},{"id":"p2","label":"Eignung","text":"Als Head of Business Transformation habe ich ein Portfolioboard mit belastbarer Nutzenverfolgung etabliert und daraus 27 Mio. EUR EBIT-Effekt realisiert. Die Steuerung erfolgte in einer Matrixorganisation mit 24 direkten Mitarbeitenden und Berichtslinie an den COO - eine Konstellation, die der ausgeschriebenen Rolle sehr nahe kommt."},{"id":"p3","label":"Umgang mit der Lücke","text":"In regulierten Umfeldern arbeite ich seit über zehn Jahren: Audit- und Compliance-Anforderungen waren bei Meridian fester Bestandteil jeder Prozessänderung, in meiner Beratungszeit habe ich mehrere Pharmakunden zu Operating-Model-Fragen begleitet. GxP-Spezifika würde ich strukturiert in den ersten Monaten aufbauen."},{"id":"p4","label":"Abschluss","text":"Über ein Gespräch, in dem ich meine Sicht auf die ersten 100 Tage im Transformation Office darstellen kann, freue ich mich sehr."}],"closing":"Mit freundlichen Grüßen\nDr. Michael Berger"}'::jsonb,
   '[{"item":"Vollständigkeit","status":"bestanden","note":"Alle Pflichtangaben enthalten."},{"item":"Rechtschreibung und Grammatik","status":"bestanden","note":"Keine Auffälligkeiten."},{"item":"Übereinstimmung mit dem Lebenslauf","status":"bestanden","note":"Zahlen stimmen mit dem Master-CV überein."},{"item":"ATS-Kompatibilität","status":"bestanden","note":"Keine Tabellen oder Grafiken."},{"item":"Keyword-Abdeckung","status":"pruefen","note":"Begriff Data Governance fehlt noch."},{"item":"Seitenzahl","status":"bestanden","note":"Eine Seite."},{"item":"Mögliche Übertreibungen","status":"pruefen","note":"Formulierung zu GxP-Aufbau als Absicht kennzeichnen."}]'::jsonb);

  INSERT INTO public.application_documents (user_id, job_posting_id, document_type, title, tone, version, status, content)
  VALUES (uid, j1, 'cv', 'Lebenslauf - Version Nordlicht Pharma', 'klassisch und seriös', 1, 'entwurf',
   '{"headline":"Head of Business Transformation | Regulierte Industrien","summary":"Transformationsverantwortlicher mit 15 Jahren Erfahrung in regulierten Industrieumfeldern, verantwortlich für ein Portfolio von 42 Mio. EUR.","sections":[{"key":"core_skills","label":"Kernkompetenzen","visible":true,"items":["Transformation Office","Portfoliosteuerung","Operational Excellence","Change Management","Data Governance"]},{"key":"experience","label":"Berufserfahrung","visible":true,"items":["Meridian Industries AG - Head of Business Transformation (2021 - heute)","Halden Consulting GmbH - Senior Manager Strategy & Operations (2016 - 2021)","Rheinwerk Technologies - Projektleiter Prozessmanagement (2011 - 2016)"]},{"key":"certificates","label":"Zertifikate","visible":true,"items":["Prosci Change Practitioner","PMP","Six Sigma Black Belt","SAFe Agilist"]},{"key":"languages","label":"Sprachen","visible":true,"items":["Deutsch - Muttersprache","Englisch - verhandlungssicher","Französisch - B1"]}]}'::jsonb);

  INSERT INTO public.interview_preparations (user_id, job_posting_id, interview_type, preparation_status, briefing, questions, reverse_questions)
  VALUES (uid, j1, 'hiring_manager', 'in_arbeit',
   '{"company_summary":"Nordlicht Pharma SE, rund 6.800 Mitarbeitende, Programm Nordlicht 2030 mit Effizienzziel von 80 Mio. EUR.","role_requirements":["Aufbau des Transformation Office","Steuerung von Digitalisierungs- und KI-Initiativen","Führung von 15 Personen"],"challenges":["Silostrukturen","langsame Entscheidungswege","hoher Kostendruck"],"strengths":["42 Mio. EUR Portfolioverantwortung","27 Mio. EUR EBIT-Effekt","Prosci- und Six-Sigma-Methodik in der Linie"],"weak_points":["Keine GxP-Erfahrung","Erstmalige Rolle in der Pharmabranche"],"developments":["Standortübernahme in Portugal Q4 2025"],"counterparts":["COO","VP People","Leitung Regulatory Affairs"],"interests":["Umsetzungsgeschwindigkeit","Akzeptanz in den Fachbereichen","Compliance-Sicherheit"]}'::jsonb,
   '[{"question":"Wie würden Sie das Transformation Office in den ersten 100 Tagen aufbauen?","category":"Transformation","probability":"sehr hoch","difficulty":"mittel","goal":"Prüfen, ob Struktur und Priorisierung durchdacht sind.","structure":"Ausgangslage, Vorgehen in drei Phasen, erste messbare Ergebnisse","answer":"Ich starte mit Transparenz: Portfolioaufnahme, Nutzenbewertung und Stakeholder-Landkarte in den ersten vier Wochen. Danach folgt die Governance - Portfolioboard, Entscheidungslogik, Nutzenverfolgung. Ab Woche zehn setze ich zwei sichtbare Quick Wins um, damit das Office Glaubwürdigkeit gewinnt. Bei Meridian hat genau dieses Vorgehen im ersten Jahr 8 Mio. EUR Effekt erzeugt.","follow_up":"Was tun Sie, wenn ein Bereichsleiter die Portfolioaufnahme blockiert?"},{"question":"Ihnen fehlt Pharmaerfahrung. Warum sollten wir Sie trotzdem nehmen?","category":"kritische Lücken","probability":"sehr hoch","difficulty":"hoch","goal":"Belastbarkeit und Selbstreflexion prüfen.","structure":"Lücke anerkennen, Übertragbarkeit belegen, Lernplan skizzieren","answer":"Die Lücke ist real, GxP-Detailwissen bringe ich nicht mit. Was ich mitbringe, ist zehn Jahre Steuerung regulierter Prozesse mit Audit-Anforderungen und mehrere Pharmaprojekte aus der Beratungszeit. Fachliche Tiefe hole ich über das Regulatory-Team - meine Aufgabe ist die Transformationsarchitektur, nicht die Fachprüfung.","follow_up":"Wie stellen Sie sicher, dass Ihre Programme regulatorisch tragfähig sind?"},{"question":"Erzählen Sie von einem gescheiterten Programm.","category":"Fehler und Misserfolge","probability":"hoch","difficulty":"hoch","goal":"Umgang mit Misserfolg und Lernfähigkeit bewerten.","structure":"STAR mit klarer Erkenntnis","answer":"Ein ERP-Rollout in einer Landesgesellschaft ist 2019 an fehlender lokaler Einbindung gescheitert. Wir haben ihn nach vier Monaten gestoppt, Kosten von 1,2 Mio. EUR abgeschrieben und das Vorgehen umgestellt: seitdem ist eine lokale Sponsorenrolle Pflichtbestandteil jedes Rollouts.","follow_up":"Wie haben Sie den Stopp gegenüber dem Vorstand vertreten?"},{"question":"Was ist Ihre Gehaltsvorstellung?","category":"Gehalt","probability":"hoch","difficulty":"mittel","goal":"Erwartungsabgleich.","structure":"Bandbreite nennen, Begründung, Flexibilität signalisieren","answer":"Auf Basis meiner aktuellen Verantwortung und der Marktbandbreite für diese Rolle sehe ich mich bei 170.000 bis 185.000 EUR Jahresgesamtvergütung. Die Struktur aus Fix und variablem Anteil ist für mich verhandelbar.","follow_up":"Wie flexibel sind Sie beim variablen Anteil?"}]'::jsonb,
   '[{"audience":"Hiring Manager","question":"Woran messen Sie den Erfolg dieser Rolle nach zwölf Monaten?","impact":"hoch","insight":"hoch","risk":"gering","phase":"Erstgespräch"},{"audience":"HR","question":"Wie ist das Transformation Office organisatorisch gegenüber den Bereichen aufgehängt?","impact":"mittel","insight":"hoch","risk":"gering","phase":"Erstgespräch"},{"audience":"Geschäftsführung","question":"Welche Entscheidung aus dem Programm 2030 würden Sie heute anders treffen?","impact":"sehr hoch","insight":"hoch","risk":"mittel","phase":"Finalrunde"}]'::jsonb);

  INSERT INTO public.star_stories (user_id, job_posting_id, title, situation, task, action, result, learning, relevance, tags) VALUES
  (uid, j1, 'Aufbau der Transformationssteuerung bei Meridian',
   'Meridian hatte 2021 18 laufende Programme ohne konsolidierte Nutzenverfolgung; der Vorstand konnte den Wertbeitrag nicht beurteilen.',
   'Ich sollte die Portfoliosteuerung innerhalb von sechs Monaten aufbauen und den Wertbeitrag belastbar machen.',
   'Portfolioaufnahme mit allen Programmleitungen, Einführung eines Portfolioboards mit Quartalsrhythmus, verbindliche Nutzenmethodik gemeinsam mit dem Controlling, Stopp von vier Programmen ohne Business Case.',
   '27 Mio. EUR EBIT-Effekt über drei Jahre, Reduktion der Programmanzahl von 18 auf 11, Time-to-Market minus 31 Prozent.',
   'Governance wirkt nur, wenn das Controlling die Nutzenmethodik mitträgt.',
   'Entspricht der Kernaufgabe der Rolle bei Nordlicht.',
   ARRAY['Transformation','Portfoliosteuerung','Führung']),
  (uid, NULL, 'Turnaround eines gescheiterten ERP-Rollouts',
   'Ein ERP-Rollout in einer Landesgesellschaft lief 2019 vier Monate ohne Fortschritt.',
   'Verantwortung übernehmen und über Fortführung oder Stopp entscheiden.',
   'Ursachenanalyse mit lokalen Key Usern, Eskalation an den Vorstand mit Stopp-Empfehlung, Neuaufsetzung mit lokaler Sponsorenrolle.',
   'Vermeidung weiterer 2,4 Mio. EUR Kosten, erfolgreicher Rollout zwölf Monate später in vier Ländern.',
   'Ein früher Stopp ist günstiger als ein später Erfolg.',
   'Belegt Entscheidungsstärke gegenüber Vorstand.',
   ARRAY['Fehler','Change Management','Stakeholder']);

  INSERT INTO public.applications (user_id, job_posting_id, status, application_date, next_action, next_action_date, contact_person, salary_band, notes, position) VALUES
  (uid, j1, 'bewerbung_vorbereiten', NULL, 'Anschreiben finalisieren und CV-Version exportieren', CURRENT_DATE + 2, 'Frau Dr. Anke Reimann', '160.000 - 185.000 EUR', 'Priorität 1 - höchster Match im Portfolio.', 0),
  (uid, j2, 'in_pruefung', NULL, 'Reisebereitschaft und Umzugsoption klären', CURRENT_DATE + 5, 'Herr Marc Bächtold', 'CHF 190.000 - 215.000', 'Standortfrage entscheidet über Bewerbung.', 0),
  (uid, j3, 'hoher_match', NULL, 'Unternehmensanalyse starten', CURRENT_DATE + 3, 'Frau Julia Sander', '175.000 - 200.000 EUR', 'Regional ideal, M&A-Erfahrung muss argumentiert werden.', 0),
  (uid, j4, 'interview_geplant', CURRENT_DATE - 12, 'Interviewsimulation Fachinterview durchführen', CURRENT_DATE + 4, 'Herr Tobias Krenz', '155.000 - 175.000 EUR', 'Erstgespräch positiv verlaufen, Fachrunde steht an.', 0);

  RETURN NEW;
END;
$fn$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
