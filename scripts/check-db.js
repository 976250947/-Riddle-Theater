import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const s = await p.story.findUnique({
  where: { id: "tingwan" },
  select: { id: true, endings: true, stages: true, packData: true }
});

console.log("endings type:", Array.isArray(s.endings) ? "array" : typeof s.endings, "len:", s.endings?.length);
console.log("endings[0]:", JSON.stringify(s.endings?.[0]));
console.log("---");
console.log("stages type:", Array.isArray(s.stages) ? "array" : typeof s.stages, "len:", s.stages?.length);
console.log("stages[0]:", JSON.stringify(s.stages?.[0]));
console.log("---");
console.log("packData keys:", Object.keys(s.packData || {}));
const pd = s.packData || {};
console.log("packData.stages keys:", Object.keys(pd.stages || {}));
const firstStageKey = Object.keys(pd.stages || {})[0];
if (firstStageKey) {
  const st = pd.stages[firstStageKey];
  console.log("packData first stage:", firstStageKey);
  console.log("  has storyText:", !!st.storyText);
  console.log("  has npcDialogue:", !!st.npcDialogue);
  console.log("  has choices:", !!st.choices, "count:", st.choices?.length);
  console.log("  has public_script:", !!st.public_script);
}

await p.$disconnect();
