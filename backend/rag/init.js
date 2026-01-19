// init.js
import { indexCourses } from "./indexer.js";

console.log("Initialisation de la base vectorielle...");
indexCourses()
  .then(() => console.log("Terminé !"))
  .catch(err => console.error(err));