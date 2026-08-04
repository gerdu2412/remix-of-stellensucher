import { cvSchema } from "../src/lib/ai-schemas";
import { zodSchema } from "ai";
const s: any = zodSchema(cvSchema as any);
console.log(JSON.stringify(s.jsonSchema).slice(0, 900));
console.log(JSON.stringify(cvSchema.parse({ summary: null, experience: null })).slice(0, 200));
