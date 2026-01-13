import { Chroma } from "langchain/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { getAllCourses } from "../services/course.service.js";

export async function indexCourses() {
  const courses = await getAllCourses();

  const documents = courses.map(course => ({
    pageContent: `
      Titre : ${course.title}
      Module : ${course.module}
      Niveau : ${course.level}

      Contenu :
      ${course.content}
    `,
    metadata: {
      courseId: course.id,
      title: course.title,
      module: course.module
    }
  }));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });

  const chunks = await splitter.splitDocuments(documents);

  await Chroma.fromDocuments(
    chunks,
    new OpenAIEmbeddings(),
    { collectionName: "smartlearn-courses" }
  );

  console.log("✅ Cours indexés depuis la base de données");
}
