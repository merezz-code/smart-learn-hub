// src/pages/LessonView.tsx - Page complète pour voir une leçon
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  BookmarkPlus,
  StickyNote,
  Clock,
  FileText,
  Download,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/lib/courseService';
import { Lesson, Course } from '@/types/course';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // Timer pour compter le temps passé
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60); // en minutes
      setTimeSpent(elapsed);
    }, 60000); // Update chaque minute

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    loadData();
  }, [courseId, lessonId, user]);

  const loadData = async () => {
    if (!courseId || !lessonId) return;

    try {
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);

      const lessonData = await courseService.getLessonById(lessonId);
      setLesson(lessonData);

      // Charger les notes et statut
      if (user) {
        const progress = await courseService.getLessonProgress(user.id, courseId, lessonId);
        if (progress) {
          setNotes(progress.notes || '');
          setIsCompleted(progress.completed);
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Impossible de charger la leçon');
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !courseId || !lessonId) return;

    try {
      await courseService.markLessonComplete(user.id, courseId, lessonId);
      setIsCompleted(true);
      toast.success('Leçon marquée comme terminée ! ✅');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSaveNotes = async () => {
    if (!user || !courseId || !lessonId) {
      toast.error('Connectez-vous pour sauvegarder vos notes');
      return;
    }

    try {
      await courseService.updateLessonNotes(user.id, courseId, lessonId, notes);
      toast.success('Notes sauvegardées ! 📝');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAddBookmark = () => {
    toast.success('Ajouté aux favoris ! 🔖');
  };

  const handlePrevious = () => {
    if (!course) return;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      navigate(`/course/${courseId}/lesson/${prevLesson.id}`);
    }
  };

  const handleNext = () => {
    if (!course) return;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    } else {
      toast.success('Vous avez terminé toutes les leçons ! 🎊');
    }
  };

  const allLessons = course?.modules.flatMap(m => m.lessons) || [];
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  if (!lesson || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour au cours
              </button>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-muted-foreground mt-1">{lesson.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{timeSpent} min</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-warning" />
                <span className="font-medium">{lesson.duration} min</span>
              </div>

              {/* Completed Badge */}
              {isCompleted && (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Terminé</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {lesson.videoUrl && (
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                  src={lesson.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
            )}

            {/* Lesson Content */}
            <div className="bg-card rounded-xl border p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>

            {/* Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Ressources téléchargeables
                </h3>
                <div className="space-y-2">
                  {lesson.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.type.toUpperCase()}
                          {resource.size && ` • ${(resource.size / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {showNotes && (
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <StickyNote className="w-5 h-5" />
                  Mes notes personnelles
                </h3>
                <Textarea
                  placeholder="Prenez des notes sur cette leçon..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[150px] mb-3"
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotes} size="sm">
                    Sauvegarder les notes
                  </Button>
                </div>
              </div>
            )}

            {/* Quiz Notice */}
            {lesson.hasQuiz && (
              <div className="bg-card rounded-xl border-2 border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Quiz disponible</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Testez vos connaissances avec le quiz de cette leçon
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/quiz/${lesson.quizId}`)}
                    >
                      Commencer le quiz →
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            {/* Actions */}
            <div className="bg-card rounded-xl border p-6 space-y-3">
              <h3 className="font-semibold mb-4">Actions</h3>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleAddBookmark}
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Ajouter aux favoris
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowNotes(!showNotes)}
              >
                <StickyNote className="w-4 h-4 mr-2" />
                {showNotes ? 'Masquer les notes' : 'Prendre des notes'}
              </Button>

              {!isCompleted && (
                <Button
                  className="w-full"
                  onClick={handleMarkComplete}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer comme terminé
                </Button>
              )}
            </div>

            {/* Progress */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="font-semibold mb-4">Progression du cours</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leçon</span>
                  <span className="font-medium">
                    {currentIndex + 1} / {allLessons.length}
                  </span>
                </div>
                <Progress 
                  value={((currentIndex + 1) / allLessons.length) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Leçon précédente
          </Button>

          <Button
            onClick={handleNext}
            disabled={!hasNext}
          >
            Leçon suivante
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}