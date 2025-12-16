// src/components/courses/LessonList.tsx
import { CourseModule, Lesson } from '@/types/course';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  FileText, 
  CheckCircle, 
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

interface LessonListProps {
  modules: CourseModule[];
  currentLessonId?: string;
  completedLessons?: string[];
  onLessonClick: (lesson: Lesson) => void;
  isEnrolled?: boolean;
}

export function LessonList({ 
  modules, 
  currentLessonId, 
  completedLessons = [],
  onLessonClick,
  isEnrolled = false,
}: LessonListProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    modules.length > 0 ? [modules[0].id] : []
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (completedLessons.includes(lesson.id)) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    return lesson.videoUrl ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-2">
      {modules.map((module) => {
        const isExpanded = expandedModules.includes(module.id);
        const completedCount = module.lessons.filter(l => 
          completedLessons.includes(l.id)
        ).length;
        
        return (
          <div key={module.id} className="card-base overflow-hidden">
            {/* Module Header */}
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              onClick={() => toggleModule(module.id)}
            >
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{module.title}</h3>
                  {completedCount === module.lessons.length && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{module.lessons.length} leçons</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {module.duration} min
                  </span>
                  {completedCount > 0 && (
                    <span className="text-success">
                      {completedCount}/{module.lessons.length} complété
                    </span>
                  )}
                </div>
              </div>
              
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </button>

            {/* Module Content */}
            {isExpanded && (
              <div className="border-t border-border">
                {module.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isCurrent = currentLessonId === lesson.id;
                  const isLocked = !isEnrolled;
                  
                  return (
                    <button
                      key={lesson.id}
                      className={`w-full flex items-center gap-3 p-3 pl-6 text-left transition-colors ${
                        isCurrent 
                          ? 'bg-primary/5 border-l-2 border-primary' 
                          : 'hover:bg-muted/50'
                      } ${isLocked ? 'opacity-60' : ''}`}
                      onClick={() => !isLocked && onLessonClick(lesson)}
                      disabled={isLocked}
                    >
                      {/* Lesson Number/Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCompleted 
                          ? 'bg-success/10 text-success' 
                          : isCurrent
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          getLessonIcon(lesson)
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isCurrent ? 'text-primary' : ''
                        }`}>
                          {index + 1}. {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration} min
                          </span>
                          {lesson.hasQuiz && (
                            <span className="text-warning">• Quiz</span>
                          )}
                          {lesson.videoUrl && (
                            <span>• Vidéo</span>
                          )}
                        </div>
                      </div>

                      {/* Status Icon */}
                      {!isLocked && isCompleted && (
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      )}
                      {isLocked && (
                        <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}