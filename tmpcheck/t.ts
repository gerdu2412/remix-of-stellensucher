import { cvSchema } from "../src/lib/ai-schemas";
import { z } from "zod";
const j = (z as any).toJSONSchema(cvSchema, { io: "input" });
console.log(JSON.stringify(j).slice(0, 700));
console.log(JSON.stringify(cvSchema.parse({ summary: null, experience: null })).slice(0, 300));
