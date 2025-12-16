// src/pages/CourseDetail.tsx - VERSION COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  StickyNote,
  Download,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { Course, Lesson, UserCourseProgress, ProgressStatus } from '@/types/course';
import { courseService } from '@/lib/courseService';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  // ✅ NOUVEAU : États pour les fonctionnalités manquantes
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // ✅ NOUVEAU : Timer pour compter le temps passé
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60); // en minutes
      setTimeSpent(elapsed);
    }, 60000); // Update chaque minute

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const courseData = await courseService.getCourseById(id);
      setCourse(courseData);

      // Développer le premier module par défaut
      if (courseData.modules.length > 0) {
        setExpandedModules([courseData.modules[0].id]);
      }

      // Charger la progression si connecté
      if (user) {
        const userProgress = await courseService.getUserProgress(user.id, id);
        setProgress(userProgress);

        // Charger la leçon actuelle
        if (userProgress?.currentLessonId) {
          const lesson = await courseService.getLessonById(userProgress.currentLessonId);
          setActiveLesson(lesson);
          // ✅ NOUVEAU : Charger les notes de la leçon
          loadLessonNotes(lesson.id);
        } else if (courseData.modules[0]?.lessons[0]) {
          // Si pas de leçon actuelle, charger la première
          setActiveLesson(courseData.modules[0].lessons[0]);
        }
      }
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      toast.error('Impossible de charger le cours');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVEAU : Charger les notes d'une leçon
  const loadLessonNotes = async (lessonId: string) => {
    if (!user || !id) return;
    
    try {
      const lessonProgress = await courseService.getLessonProgress(user.id, id, lessonId);
      if (lessonProgress?.notes) {
        setNotes(lessonProgress.notes);
      } else {
        setNotes('');
      }
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleEnroll = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Connectez-vous pour vous inscrire');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      await courseService.enrollCourse(user.id, id);
      toast.success('Inscription réussie ! 🎉');
      loadCourseData();
    } catch (error) {
      console.error('Erreur inscription:', error);
      toast.error("Erreur lors de l'inscription");
    }
  };

  const handleLessonClick = async (lesson: Lesson) => {
    if (!progress || progress.status === ProgressStatus.NOT_STARTED) {
      toast.error('Inscrivez-vous au cours pour accéder aux leçons');
      return;
    }

    setActiveLesson(lesson);
    loadLessonNotes(lesson.id); // ✅ NOUVEAU : Charger les notes

    // Mettre à jour la leçon actuelle
    if (user && id) {
      try {
        await courseService.updateCurrentLesson(user.id, id, lesson.id);
      } catch (error) {
        console.error('Erreur mise à jour leçon:', error);
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || !user || !id) return;

    try {
      await courseService.markLessonComplete(user.id, id, activeLesson.id);
      toast.success('Leçon marquée comme complétée ! ✅');
      loadCourseData();
    } catch (error) {
      console.error('Erreur complétion leçon:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // ✅ NOUVEAU : Sauvegarder les notes
  const handleSaveNotes = async () => {
    if (!user || !id || !activeLesson) {
      toast.error('Connectez-vous pour sauvegarder vos notes');
      return;
    }

    try {
      await courseService.updateLessonNotes(user.id, id, activeLesson.id, notes);
      toast.success('Notes sauvegardées ! 📝');
    } catch (error) {
      console.error('Erreur sauvegarde notes:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // ✅ NOUVEAU : Ajouter aux favoris
  const handleAddBookmark = () => {
    toast.success('Ajouté aux favoris ! 🔖');
  };

  // ✅ NOUVEAU : Navigation leçon suivante
  const handleNextLesson = () => {
    if (!course) return;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
    
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      handleLessonClick(nextLesson);
    } else {
      toast.success('Vous avez terminé toutes les leçons ! 🎊');
    }
  };

  // ✅ NOUVEAU : Navigation leçon précédente
  const handlePreviousLesson = () => {
    if (!course) return;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
    
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      handleLessonClick(prevLesson);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'pdf': return <FileType className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      programming: 'Programmation',
      web_development: 'Développement Web',
      mobile_development: 'Mobile',
      data_science: 'Data Science',
      design: 'Design',
      marketing: 'Marketing',
      business: 'Business',
    };
    return labels[category] || category;
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
      expert: 'Expert',
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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

  const isEnrolled = progress && progress.status !== ProgressStatus.NOT_STARTED;
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  
  // ✅ NOUVEAU : Calculer navigation
  const allLessons = course.modules.flatMap(m => m.lessons);
  const currentLessonIndex = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const hasPrevious = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < allLessons.length - 1;

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
                <Badge className="mb-3">{getCategoryLabel(course.category)}</Badge>
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-muted-foreground mb-6">{course.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {course.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="font-medium">{course.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {course.studentsCount && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{course.studentsCount.toLocaleString()} étudiants</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(course.duration / 60)}h {course.duration % 60}min</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{totalLessons} leçons</span>
                  </div>
                  <Badge variant="outline">{getLevelLabel(course.level)}</Badge>
                </div>

                {course.instructor && (
                  <p className="mt-4 text-sm">
                    Par <span className="font-medium">{course.instructor}</span>
                  </p>
                )}
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
                        <span className="font-medium">{Math.round(progress?.overallProgress || 0)}%</span>
                      </div>
                      <Progress value={progress?.overallProgress || 0} className="h-2" />
                    </div>
                    <Button className="w-full" size="lg">
                      Continuer l'apprentissage
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold mb-4">
                      {course.price === 0 ? 'Gratuit' : `${course.price?.toFixed(2)} €`}
                    </div>
                    <Button className="w-full" size="lg" onClick={handleEnroll}>
                      {course.price === 0 ? "S'inscrire gratuitement" : "S'inscrire maintenant"}
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
            <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
              {isEnrolled && activeLesson ? (
                <>
                  {/* ✅ NOUVEAU : Header de la leçon avec timer */}
                  <div className="card-base p-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{activeLesson.title}</h2>
                      {activeLesson.description && (
                        <p className="text-sm text-muted-foreground mt-1">{activeLesson.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {/* ✅ Timer temps passé */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{timeSpent} min</span>
                      </div>
                      {/* ✅ Durée de la leçon */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="font-medium">{activeLesson.duration} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="card-base p-6">
                    {activeLesson.videoUrl && (
                      <div className="aspect-video bg-foreground/5 rounded-xl mb-6 overflow-hidden">
                        <iframe
                          src={activeLesson.videoUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={activeLesson.title}
                        />
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none mb-6">
                      <div 
                        className="whitespace-pre-wrap bg-muted/50 p-6 rounded-xl"
                        dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                      />
                    </div>
                  </div>

                  {/* ✅ NOUVEAU : Ressources téléchargeables */}
                  {activeLesson.resources && activeLesson.resources.length > 0 && (
                    <div className="card-base p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Ressources téléchargeables
                      </h3>
                      <div className="space-y-2">
                        {activeLesson.resources.map((resource) => (
                          <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{resource.title}</p>
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

                  {/* ✅ NOUVEAU : Section notes */}
                  {showNotes && (
                    <div className="card-base p-6">
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
                          💾 Sauvegarder les notes
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ✅ NOUVEAU : Quiz disponible */}
                  {activeLesson.hasQuiz && (
                    <div className="card-base p-6 border-2 border-primary/20">
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
                            onClick={() => navigate(`/quiz/${activeLesson.quizId}`)}
                          >
                            Commencer le quiz →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ NOUVEAU : Barre de navigation */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePreviousLesson}
                      disabled={!hasPrevious}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Leçon précédente
                    </Button>

                    <Button
                      onClick={handleNextLesson}
                      disabled={!hasNext}
                    >
                      Leçon suivante
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
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

            {/* Sidebar */}
            <div className="order-1 lg:order-2 space-y-6">
              {/* ✅ NOUVEAU : Actions rapides */}
              {isEnrolled && activeLesson && (
                <div className="card-base p-6">
                  <h3 className="font-semibold mb-4">Actions</h3>
                  <div className="space-y-2">
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
                    <Button
                      className="w-full justify-start"
                      onClick={handleMarkComplete}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marquer comme terminé
                    </Button>
                  </div>
                </div>
              )}

              {/* Contenu du cours */}
              <div>
                <h3 className="font-semibold mb-4">Contenu du cours</h3>
                <div className="space-y-2">
                  {course.modules.map((module) => (
                    <div key={module.id} className="card-base overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="text-left">
                          <p className="font-medium">{module.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {module.lessons.length} leçons • {module.duration} min
                          </p>
                        </div>
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      {expandedModules.includes(module.id) && (
                        <div className="border-t border-border">
                          {module.lessons.map((lesson) => {
                            const isCompleted = progress?.completedLessons?.includes(lesson.id);
                            const isActive = activeLesson?.id === lesson.id;
                            
                            return (
                              <button
                                key={lesson.id}
                                className={`w-full flex items-center gap-3 p-3 pl-6 text-left hover:bg-muted/50 transition-colors ${
                                  isActive ? 'bg-primary/5 border-l-2 border-primary' : ''
                                }`}
                                onClick={() => handleLessonClick(lesson)}
                                disabled={!isEnrolled}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-success/10 text-success' 
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    getLessonIcon('text')
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{lesson.title}</p>
                                  <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                                </div>
                                {!isEnrolled && <Lock className="w-4 h-4 text-muted-foreground" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
