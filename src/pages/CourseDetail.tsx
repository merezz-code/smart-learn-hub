// src/pages/CourseDetail.tsx - VERSION FINALE CORRIGÉE
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, FileText, Clock, Users, Star, BookOpen, ChevronDown, ChevronUp,
  CheckCircle, Lock, ArrowLeft, Loader2, ChevronLeft, ChevronRight,
  BookmarkPlus, StickyNote, Award
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: string;
  duration?: number;
  instructor?: string;
  rating?: number;
  students_count?: number;
  price?: number;
}

interface CourseModule {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  module_id?: string;
  title: string;
  description?: string;
  content: string;
  video_url?: string;
  duration: number;
  order_index: number;
  has_quiz?: boolean;
}

interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  overall_progress: number;
  completed_lessons: string[];
  current_lesson_id: string | null;
  started_at: string;
  last_accessed_at: string;
  completed_at: string | null;
}

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit: number;
  max_attempts: number;
  questions_count: number;
}


// 🔐 Fonction helper pour obtenir les headers avec token - CORRIGÉE
const getAuthHeaders = () => {
  // ✅ CORRECTION : Utiliser 'token' au lieu de 'auth_token'
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('⚠️ Aucun token trouvé dans localStorage');
  } else {
    console.log('✅ Token trouvé:', token.substring(0, 20) + '...');
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);


  // 🔍 DEBUG : Vérifier le token au chargement
  useEffect(() => {
    const token = localStorage.getItem('token'); // ✅ CORRECTION
    console.log('🔍 État Auth:', {
      hasToken: !!token,
      isAuthenticated,
      userId: user?.id,
      userEmail: user?.email
    });
  }, [user, isAuthenticated]);

  // ⏱️ Timer temps passé
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [startTime]);

  // 📚 Charger les données du cours
  useEffect(() => {
    if (id) {
    loadCourseData();
    loadQuizzes();
  }
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log('🔍 Chargement cours ID:', id);
      
      // 1️⃣ Charger le cours (public, pas besoin de token)
      const courseRes = await fetch(`${API_URL}/courses/${id}`);
      if (!courseRes.ok) throw new Error('Cours non trouvé');
      
      const courseData = await courseRes.json();
      console.log('✅ Cours chargé:', courseData.title);
      setCourse(courseData);

      // 2️⃣ Charger les modules avec leçons
      const modulesRes = await fetch(`${API_URL}/courses/${id}/modules`, {
        headers: getAuthHeaders(),
      });
      
      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        console.log('✅ Modules chargés:', modulesData.length);
        setModules(modulesData);
        
        if (modulesData.length > 0) {
          setExpandedModules([modulesData[0].id.toString()]);
        }
      } else {
        console.warn('⚠️ Erreur chargement modules:', modulesRes.status);
      }

      // 3️⃣ Charger progression utilisateur
      if (isAuthenticated && user) {
        await loadUserProgress();
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      toast.error('Erreur de chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async () => {
  if (!id) return;
  
  try {
    setLoadingQuizzes(true);
    console.log('📚 Chargement des quiz du cours:', id);
    
    const response = await fetch(`${API_URL}/quizzes/course/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur chargement quiz');
    }

    const quizzesData = await response.json();
    console.log('✅ Quiz chargés:', quizzesData.length);
    setQuizzes(quizzesData);
  } catch (error) {
    console.error('❌ Erreur chargement quiz:', error);
    // Ne pas afficher d'erreur si pas de quiz, c'est normal
  } finally {
    setLoadingQuizzes(false);
  }
};

const handleStartQuiz = (quizId: string) => {
  if (!isAuthenticated) {
    toast.error('Veuillez vous connecter pour passer le quiz');
    navigate('/login');
    return;
  }
  navigate(`/quiz/${quizId}`);
};


  // 📊 Charger la progression
  const loadUserProgress = async () => {
    if (!user || !id) return;
    
    try {
      const response = await fetch(`${API_URL}/progress/user/${user.id}/course/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const progressData = await response.json();
        
        if (progressData && progressData.length > 0) {
          const completedLessons = progressData
            .filter((p: any) => p.completed && p.lesson_id)
            .map((p: any) => p.lesson_id.toString());
          
          const progress = {
            user_id: user.id,
            course_id: id,
            completed_lessons: completedLessons,
            overall_progress: Math.round((completedLessons.length / getTotalLessons()) * 100),
          };
          
          setUserProgress(progress);
          
          // Charger la première leçon
          const allLessons = modules.flatMap(m => m.lessons);
          if (allLessons.length > 0) {
            setActiveLesson(allLessons[0]);
          }
        }
      } else {
        console.warn('⚠️ Pas de progression trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur loadUserProgress:', error);
    }
  };

  const getTotalLessons = () => {
    return modules.reduce((sum, m) => sum + m.lessons.length, 0);
  };

  // ✅ Inscription au cours - CORRIGÉE
  const handleEnroll = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Connectez-vous pour vous inscrire');
      navigate('/login');
      return;
    }

    // ✅ CORRECTION : Utiliser 'token' au lieu de 'auth_token'
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ Token manquant');
      toast.error('Session expirée, veuillez vous reconnecter');
      navigate('/login');
      return;
    }

    console.log('🔑 Token présent pour inscription');

    try {
      const allLessons = modules.flatMap(m => m.lessons);
      
      // Créer une entrée de progression
      const response = await fetch(`${API_URL}/progress/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: id,
          lessonId: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur inscription');
      }

      const result = await response.json();
      console.log('✅ Inscription réussie:', result);

      setUserProgress({
        user_id: user.id,
        course_id: id,
        completed_lessons: [],
        overall_progress: 0,
      });
      
      if (allLessons.length > 0) {
        setActiveLesson(allLessons[0]);
      }
      
      toast.success('Inscription réussie ! 🎉');
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
    }
  };

  // 🎯 Cliquer sur une leçon
  const handleLessonClick = async (lesson: Lesson) => {
    if (!userProgress) {
      toast.error('Inscrivez-vous d\'abord au cours');
      return;
    }
    
    setActiveLesson(lesson);
  };

  // ✅ Marquer la leçon comme terminée - CORRIGÉE
  const handleMarkComplete = async () => {
    if (!activeLesson || !user || !id || !userProgress) return;
    
    // ✅ CORRECTION : Utiliser 'token' au lieu de 'auth_token'
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expirée, veuillez vous reconnecter');
      navigate('/login');
      return;
    }
    
    const completed = userProgress.completed_lessons || [];
    
    if (!completed.includes(activeLesson.id)) {
      try {
        const response = await fetch(`${API_URL}/progress/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            courseId: id,
            lessonId: activeLesson.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur de sauvegarde');
        }

        completed.push(activeLesson.id);
        const progress = Math.round((completed.length / getTotalLessons()) * 100);
        
        setUserProgress({
          ...userProgress,
          completed_lessons: completed,
          overall_progress: progress,
        });
        
        toast.success(progress === 100 ? 'Cours terminé ! 🎊' : 'Leçon complétée ! ✅');
        
        // Auto-passer à la suivante
        if (progress < 100) {
          setTimeout(handleNextLesson, 1500);
        }
      } catch (error: any) {
        console.error('❌ Erreur MAJ progression:', error);
        toast.error(error.message || 'Erreur de sauvegarde');
      }
    }
  };

  // 💾 Sauvegarder les notes
  const handleSaveNotes = async () => {
    toast.success('Notes sauvegardées ! 📝');
  };

  // 🔖 Favoris
  const handleBookmark = () => {
    toast.success('Ajouté aux favoris ! 🔖');
  };

  // ➡️ Leçon suivante
  const handleNextLesson = () => {
    const allLessons = modules.flatMap(m => m.lessons);
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
    if (idx < allLessons.length - 1) {
      handleLessonClick(allLessons[idx + 1]);
    } else {
      toast.success('Vous avez terminé toutes les leçons ! 🎊');
    }
  };

  // ⬅️ Leçon précédente
  const handlePreviousLesson = () => {
    const allLessons = modules.flatMap(m => m.lessons);
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
    if (idx > 0) {
      handleLessonClick(allLessons[idx - 1]);
    }
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
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Cours non trouvé</h1>
          <Button onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux cours
          </Button>
        </div>
      </Layout>
    );
  }

  const isEnrolled = !!userProgress;
  const allLessons = modules.flatMap(m => m.lessons);
  const idx = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;

  return (
    <Layout>
      <div className="min-h-screen">
        {/* 🎨 HEADER */}
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="flex justify-between mb-4">
              <Button variant="ghost" onClick={() => navigate('/courses')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              {isAuthenticated && user && (
                <Badge className="bg-green-500/20 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {user.email}
                </Badge>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Badge className="mb-3">{course.category}</Badge>
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-muted-foreground mb-6">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {course.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      {course.rating}
                    </div>
                  )}
                  {course.students_count && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students_count} étudiants
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {allLessons.length} leçons
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(course.duration / 60)}h
                    </div>
                  )}
                </div>
              </div>

              {/* 🎯 CARTE INSCRIPTION */}
              <div className="card-base p-6">
                <img 
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
                  className="w-full aspect-video object-cover rounded-xl mb-4" 
                  alt={course.title} 
                />
                
                {isEnrolled ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression</span>
                        <span className="font-semibold">{userProgress.overall_progress}%</span>
                      </div>
                      <Progress value={userProgress.overall_progress} />
                      <p className="text-xs text-muted-foreground mt-2">
                        {userProgress.completed_lessons.length}/{allLessons.length} leçons complétées
                      </p>
                    </div>
                    <Button className="w-full" size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Continuer
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold mb-4">
                      {!course.price || course.price === 0 ? 'Gratuit' : `${course.price}€`}
                    </div>
                    <Button className="w-full" size="lg" onClick={handleEnroll}>
                      S'inscrire maintenant
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 📖 CONTENU */}
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {isEnrolled && activeLesson ? (
                <>
                  {/* 📌 HEADER LEÇON */}
                  <div className="card-base p-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{activeLesson.title}</h2>
                      <p className="text-sm text-muted-foreground">{activeLesson.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {timeSpent} min
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="w-4 h-4 text-amber-500" />
                        {activeLesson.duration} min
                      </div>
                    </div>
                  </div>

                  {/* 🎥 CONTENU LEÇON */}
                  <div className="card-base p-6">
                    {activeLesson.video_url && (
                      <iframe 
                        src={activeLesson.video_url}
                        className="w-full aspect-video rounded-xl mb-6" 
                        allowFullScreen 
                        title={activeLesson.title}
                      />
                    )}
                    
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: activeLesson.content || '' }} 
                    />
                  </div>

                  {/* 📝 NOTES */}
                  {showNotes && (
                    <div className="card-base p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <StickyNote className="w-5 h-5" />
                        Mes notes personnelles
                      </h3>
                      <Textarea 
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="min-h-[150px] mb-3"
                        placeholder="Prenez des notes..."
                      />
                      <Button onClick={handleSaveNotes} size="sm">
                        💾 Sauvegarder les notes
                      </Button>
                    </div>
                  )}

                  {/* ⬅️➡️ NAVIGATION */}
                  <div className="flex justify-between pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousLesson}
                      disabled={idx <= 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Précédente
                    </Button>
                    <Button 
                      onClick={handleNextLesson}
                      disabled={idx >= allLessons.length - 1}
                    >
                      Suivante
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="card-base p-12 text-center">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Contenu verrouillé</h3>
                  <p className="text-muted-foreground mb-4">
                    Inscrivez-vous pour accéder au contenu du cours
                  </p>
                  <Button onClick={handleEnroll}>S'inscrire maintenant</Button>
                </div>
              )}
            </div>

            {/* 📋 SIDEBAR */}
            <div className="space-y-6">
              {/* 🎯 ACTIONS */}
              {isEnrolled && activeLesson && (
                <div className="card-base p-6">
                  <h3 className="font-semibold mb-4">Actions rapides</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleBookmark}
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
                      {showNotes ? 'Masquer' : 'Afficher'} les notes
                    </Button>
                    <Button 
                      className="w-full justify-start"
                      onClick={handleMarkComplete}
                      disabled={userProgress?.completed_lessons.includes(activeLesson.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {userProgress?.completed_lessons.includes(activeLesson.id) ? 'Complétée' : 'Marquer terminée'}
                    </Button>
                  </div>
                </div>
              )}

              {/* 📚 MODULES */}
              <div>
                <h3 className="font-semibold mb-4">Contenu du cours</h3>
                {modules.map(module => (
                  <div key={module.id} className="card-base mb-2">
                    <button 
                      className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedModules(prev => 
                        prev.includes(module.id.toString()) 
                          ? prev.filter(x => x !== module.id.toString())
                          : [...prev, module.id.toString()]
                      )}
                    >
                      <div className="text-left">
                        <p className="font-medium">{module.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {module.lessons.length} leçon{module.lessons.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      {expandedModules.includes(module.id.toString()) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    
                    {expandedModules.includes(module.id.toString()) && (
                      <div className="border-t">
                        {module.lessons.map(lesson => {
                          const done = userProgress?.completed_lessons?.includes(lesson.id.toString());
                          const active = activeLesson?.id === lesson.id;
                          
                          return (
                            <button
                              key={lesson.id}
                              className={`w-full flex gap-3 p-3 pl-6 text-left hover:bg-muted/50 transition-colors ${
                                active ? 'bg-primary/5 border-l-2 border-primary' : ''
                              }`}
                              onClick={() => handleLessonClick(lesson)}
                              disabled={!isEnrolled}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                done ? 'bg-success/10 text-success' : 'bg-muted'
                              }`}>
                                {done ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{lesson.title}</p>
                                {lesson.duration && (
                                  <p className="text-xs text-muted-foreground">
                                    {lesson.duration} min
                                  </p>
                                )}
                              </div>
                              {!isEnrolled && <Lock className="w-4 h-4 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {quizzes.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Quiz du cours</h2>
                      <p className="text-muted-foreground">
                        Testez vos connaissances
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="card-base p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {quiz.description}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {quiz.questions_count}
                              </span>
                            </div>
                            <span className="text-muted-foreground">Questions</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <span className="text-green-600 font-semibold">
                                {quiz.passing_score}%
                              </span>
                            </div>
                            <span className="text-muted-foreground">Requis</span>
                          </div>

                          {quiz.time_limit > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-muted-foreground">
                                {quiz.time_limit} min
                              </span>
                            </div>
                          )}

                          {quiz.max_attempts > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <span className="text-purple-600 font-semibold">
                                  {quiz.max_attempts}
                                </span>
                              </div>
                              <span className="text-muted-foreground">Tentatives</span>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="w-full"
                          size="lg"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Commencer le quiz
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {loadingQuizzes && (
                <div className="mt-12 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}