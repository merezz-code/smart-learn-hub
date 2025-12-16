// src/components/courses/ProgressTracker.tsx
import { UserCourseProgress, Course } from '@/types/course';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  Award,
  TrendingUp,
  BookOpen,
  Target,
} from 'lucide-react';

interface ProgressTrackerProps {
  course: Course;
  progress: UserCourseProgress;
  showDetails?: boolean;
  compact?: boolean;
}

export function ProgressTracker({ 
  course, 
  progress, 
  showDetails = true,
  compact = false,
}: ProgressTrackerProps) {
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = progress.completedLessons?.length || 0;
  const percentComplete = progress.overallProgress || 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-semibold">{Math.round(percentComplete)}%</span>
        </div>
        <Progress value={percentComplete} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {completedLessons} / {totalLessons} leçons complétées
        </p>
      </div>
    );
  }

  return (
    <div className="card-base p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Votre progression
        </h3>
        {progress.status === 'completed' && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Complété</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progression globale</span>
          <span className="text-2xl font-bold gradient-text">
            {Math.round(percentComplete)}%
          </span>
        </div>
        <Progress value={percentComplete} className="h-3" />
      </div>

      {showDetails && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Leçons complétées */}
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Leçons</span>
              </div>
              <p className="text-xl font-bold">
                {completedLessons}/{totalLessons}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((completedLessons / totalLessons) * 100)}% complétées
              </p>
            </div>

            {/* Temps passé */}
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-xs text-muted-foreground">Temps passé</span>
              </div>
              <p className="text-xl font-bold">
                {formatTime(progress.timeSpent || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                sur {formatTime(course.duration)}
              </p>
            </div>
          </div>

          {/* Modules Progress */}
          <div>
            <h4 className="text-sm font-medium mb-3">Progression par module</h4>
            <div className="space-y-3">
              {course.modules.map((module) => {
                const moduleLessons = module.lessons;
                const completedInModule = moduleLessons.filter(l => 
                  progress.completedLessons?.includes(l.id)
                ).length;
                const moduleProgress = (completedInModule / moduleLessons.length) * 100;

                return (
                  <div key={module.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="truncate flex-1 text-muted-foreground">
                        {module.title}
                      </span>
                      <span className="font-medium ml-2">
                        {completedInModule}/{moduleLessons.length}
                      </span>
                    </div>
                    <Progress value={moduleProgress} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Milestone */}
          {percentComplete < 100 && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Prochain objectif</p>
                  <p className="text-xs text-muted-foreground">
                    Complétez {totalLessons - completedLessons} leçon{totalLessons - completedLessons > 1 ? 's' : ''} de plus pour terminer le cours
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Certificate */}
          {progress.status === 'completed' && progress.certificateId && (
            <div className="p-4 rounded-xl bg-success/5 border border-success/20">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Certificat disponible</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Félicitations ! Vous avez terminé ce cours.
                  </p>
                  <Button size="sm" variant="outline">
                    Télécharger le certificat
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}