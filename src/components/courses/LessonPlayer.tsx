// src/components/courses/LessonPlayer.tsx
import { useState, useEffect } from 'react';
import { Lesson, LessonProgress } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  CheckCircle,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  StickyNote,
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { courseService } from '@/lib/courseService';
import { useAuth } from '@/contexts/AuthContext';

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function LessonPlayer({ 
  lesson, 
  onComplete, 
  onPrevious, 
  onNext,
  hasNext = false,
  hasPrevious = false,
}: LessonPlayerProps) {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);

  useEffect(() => {
    loadLessonProgress();
  }, [lesson.id, user]);

  const loadLessonProgress = async () => {
    if (!user) return;

    try {
      const progressData = await courseService.getLessonProgress(
        user.id, 
        lesson.courseId, 
        lesson.id
      );
      setLessonProgress(progressData);
      if (progressData?.notes) {
        setNotes(progressData.notes);
      }
    } catch (error) {
      console.error('Erreur chargement progression:', error);
    }
  };

  const handleComplete = async () => {
    if (onComplete) {
      onComplete();
    }

    if (user) {
      try {
        await courseService.markLessonComplete(user.id, lesson.courseId, lesson.id);
        toast.success('Leçon marquée comme terminée !');
      } catch (error) {
        console.error('Erreur complétion:', error);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!user) {
      toast.error('Connectez-vous pour sauvegarder vos notes');
      return;
    }

    try {
      await courseService.updateLessonNotes(user.id, lesson.courseId, lesson.id, notes);
      toast.success('Notes sauvegardées !');
    } catch (error) {
      console.error('Erreur sauvegarde notes:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAddBookmark = () => {
    // TODO: Implémenter la fonctionnalité de favoris
    toast.success('Favori ajouté !');
  };

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lesson.duration} min</span>
            </div>
            {lessonProgress?.completed && (
              <div className="flex items-center gap-1 text-success">
                <CheckCircle className="w-4 h-4" />
                <span>Terminé</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddBookmark}
            title="Ajouter aux favoris"
          >
            <BookmarkPlus className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotes(!showNotes)}
            title="Prendre des notes"
          >
            <StickyNote className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Player (if video) */}
      {lesson.videoUrl && (
        <div className="card-base overflow-hidden">
          <div className="aspect-video bg-foreground/5 relative">
            <iframe
              src={lesson.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        </div>
      )}

      {/* Text Content */}
      <div className="card-base p-6">
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      </div>

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="card-base p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ressources
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
                <div className="flex-1">
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {resource.type.toUpperCase()}
                    {resource.size && ` • ${(resource.size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {showNotes && (
        <div className="card-base p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <StickyNote className="w-5 h-5" />
            Mes notes
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
        <div className="card-base p-6 border-2 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Quiz disponible</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Testez vos connaissances avec le quiz de cette leçon
              </p>
              <Button size="sm" onClick={() => window.location.href = `/quiz/${lesson.quizId}`}>
                Commencer le quiz
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Leçon précédente
        </Button>

        <div className="flex items-center gap-3">
          {!lessonProgress?.completed && (
            <Button onClick={handleComplete} variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Marquer comme terminé
            </Button>
          )}
          
          <Button
            onClick={onNext}
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