import express from 'express';
import Lesson from '../models/Lesson.js';

const router = express.Router();

router.get('/course/:courseId', async (req, res) => {
  try {
    const lessons = await Lesson.findByCourseId(req.params.courseId);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.update(req.params.id, req.body);
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Lesson.delete(req.params.id);
    res.json({ message: 'Leçon supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;