import { cvSchema } from "../src/lib/ai-schemas";
import { runStructured } from "../src/lib/ai-runner.server";
const r = await runStructured(cvSchema, "Analysiere den folgenden Lebenslauf strukturiert.\n\nDr. Michael Berger, Transformationsmanager, 15 Jahre Automobilindustrie, Leitung von Projekten mit 20 Mitarbeitern, Studium Maschinenbau TU Muenchen 2005, Englisch verhandlungssicher.");
console.log(JSON.stringify(r).slice(0, 400));
