//query.js
import { openai } from "../utils/openai.js";

export async function answerQuestion(question, module = null) {
  const prompt = `
Tu es un assistant pédagogique intelligent.
Réponds de manière claire, simple et structurée.

QUESTION :
${question}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return response.choices[0].message.content;
}



// import { openai } from "../utils/openai.js";
// import { getVectorStore } from "./vectorStore.js";

// export async function answerQuestion(question, module = null) {
//   const vectorStore = await getVectorStore();

//   const docs = await vectorStore.similaritySearch(question, 4);

//   const context = docs.map(d => d.pageContent).join("\n\n");

//   const prompt = `
// Tu es un assistant pédagogique intelligent pour une plateforme e-learning.
// Tu réponds uniquement à partir du contenu fourni.
// Si l'information n'existe pas, dis clairement que le cours ne couvre pas ce point.

// CONTEXTE :
// ${context}

// QUESTION :
// ${question}

// Réponse pédagogique, claire, structurée :
// `;

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.1,
//   });

//   return response.choices[0].message.content;
// }
