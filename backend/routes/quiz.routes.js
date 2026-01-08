import express from 'express';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    
    const questions = await Question.findByQuizId(quiz.id);
    res.json({ ...quiz, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/lesson/:lessonId', async (req, res) => {
  try {
    const quiz = await Quiz.findByLessonId(req.params.lessonId);
    if (!quiz) {
      return res.status(404).json({ error: 'Pas de quiz' });
    }
    
    const questions = await Question.findByQuizId(quiz.id);
    res.json({ ...quiz, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:quizId/questions', async (req, res) => {
  try {
    const question = await Question.create({
      quiz_id: req.params.quizId,
      ...req.body
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;