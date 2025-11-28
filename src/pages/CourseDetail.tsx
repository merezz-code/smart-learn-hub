import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCourses, mockChapters } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  FileText, 
  FileType, 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function CourseDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [expandedChapters, setExpandedChapters] = useState<string[]>(['ch1']);
  const [activeLesson, setActiveLesson] = useState<string | null>('l1');
  const [isEnrolled, setIsEnrolled] = useState(false);

  const course = mockCourses.find(c => c.id === id);
  const chapters = mockChapters.filter(ch => ch.courseId === id);

  if (!course) {
    return (
      <Layout>
        <div className="section-padding text-center">
          <h1 className="text-2xl font-bold mb-4">Cours non trouvé</h1>
          <Link to="/courses">
            <Button>Retour aux cours</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour vous inscrire');
      return;
    }
    setIsEnrolled(true);
    toast.success('Inscription réussie !');
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'pdf': return <FileType className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const currentLesson = chapters
    .flatMap(ch => ch.lessons)
    .find(l => l.id === activeLesson);

  const totalLessons = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedLessons = chapters
    .flatMap(ch => ch.lessons)
    .filter(l => l.isCompleted).length;
  const progress = (completedLessons / totalLessons) * 100;

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Course Header */}
        <div className="bg-muted/50 border-b border-border">
          <div className="container-custom py-8">
            <Link to="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour aux cours
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <Badge className="mb-3">{course.category}</Badge>
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-muted-foreground mb-6">{course.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolledCount.toLocaleString()} étudiants</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(course.duration / 60)}h {course.duration % 60}min</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessonsCount} leçons</span>
                  </div>
                </div>

                <p className="mt-4 text-sm">
                  Par <span className="font-medium">{course.instructorName}</span>
                </p>
              </div>

              {/* Enrollment Card */}
              <div className="card-base p-6">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full aspect-video object-cover rounded-xl mb-4"
                />
                
                {isEnrolled ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <Button className="w-full" size="lg">
                      Continuer l'apprentissage
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold mb-4">
                      {course.isFree ? 'Gratuit' : `${course.price.toFixed(2)} €`}
                    </div>
                    <Button className="w-full" size="lg" onClick={handleEnroll}>
                      {course.isFree ? "S'inscrire gratuitement" : "S'inscrire maintenant"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container-custom py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lesson Content */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {isEnrolled && currentLesson ? (
                <div className="card-base p-6">
                  <h2 className="text-xl font-semibold mb-4">{currentLesson.title}</h2>
                  
                  {currentLesson.type === 'video' && (
                    <div className="aspect-video bg-foreground/5 rounded-xl mb-4 flex items-center justify-center">
                      <iframe
                        src={currentLesson.content}
                        className="w-full h-full rounded-xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {currentLesson.type === 'text' && (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap bg-muted/50 p-6 rounded-xl">
                        {currentLesson.content}
                      </div>
                    </div>
                  )}

                  {currentLesson.type === 'pdf' && (
                    <div className="aspect-[4/3] bg-muted rounded-xl flex items-center justify-center">
                      <p className="text-muted-foreground">Lecteur PDF</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card-base p-12 text-center">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Contenu verrouillé</h3>
                  <p className="text-muted-foreground mb-4">
                    Inscrivez-vous pour accéder au contenu du cours
                  </p>
                  <Button onClick={handleEnroll}>S'inscrire maintenant</Button>
                </div>
              )}
            </div>

            {/* Curriculum */}
            <div className="order-1 lg:order-2">
              <h3 className="font-semibold mb-4">Contenu du cours</h3>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="card-base overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <div className="text-left">
                        <p className="font-medium">{chapter.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {chapter.lessons.length} leçons
                        </p>
                      </div>
                      {expandedChapters.includes(chapter.id) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    {expandedChapters.includes(chapter.id) && (
                      <div className="border-t border-border">
                        {chapter.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            className={`w-full flex items-center gap-3 p-3 pl-6 text-left hover:bg-muted/50 transition-colors ${
                              activeLesson === lesson.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                            }`}
                            onClick={() => isEnrolled && setActiveLesson(lesson.id)}
                            disabled={!isEnrolled}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              lesson.isCompleted 
                                ? 'bg-success/10 text-success' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {lesson.isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                getLessonIcon(lesson.type)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                            </div>
                            {!isEnrolled && <Lock className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
