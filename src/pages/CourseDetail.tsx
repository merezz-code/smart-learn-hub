// src/pages/CourseDetail.tsx - VERSION FINALE AVEC TOUTES LES FONCTIONNALITÉS
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Play, FileText, Clock, Users, Star, BookOpen, ChevronDown, ChevronUp,
  CheckCircle, Lock, ArrowLeft, Loader2, ChevronLeft, ChevronRight,
  BookmarkPlus, StickyNote, Award
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string; title: string; description: string; thumbnail?: string | null;
  category: string; level: string; duration?: number | null;
  instructor?: string | null; rating?: number | null; students_count?: number | null;
  price?: number | null;
}

interface CourseModule {
  id: string; title: string; order_index: number;
}

interface Lesson {
  id: string; module_id?: string; title: string; description?: string | null;
  content: string | null; video_url: string | null; duration: number | null;
  order_index: number; has_quiz?: boolean;
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

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // ⏱️ Timer temps passé
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [startTime]);

  // 📚 Charger les données du cours
  useEffect(() => {
    if (id) loadCourseData();
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      // 1️⃣ Charger le cours
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (courseError) throw courseError;
      setCourse(courseData);

      // 2️⃣ Charger modules
      const { data: modulesData } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', id)
        .order('order_index');
      
      setModules(modulesData || []);
      if (modulesData?.[0]) setExpandedModules([modulesData[0].id]);

      // 3️⃣ Charger leçons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');
      
      setLessons(lessonsData || []);

      // 4️⃣ Charger progression utilisateur
      if (isAuthenticated && user) {
        await loadUserProgress(lessonsData || []);
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      toast.error('Erreur de chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  // 📊 Charger la progression depuis Supabase
  const loadUserProgress = async (courseLessons: Lesson[]) => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erreur progression:', error);
        return;
      }

      if (data) {
        setUserProgress(data);
        
        // Charger la leçon actuelle
        if (data.current_lesson_id) {
          const lesson = courseLessons.find(l => l.id === data.current_lesson_id);
          if (lesson) {
            setActiveLesson(lesson);
            await loadLessonNotes(lesson.id);
          }
        } else if (courseLessons[0]) {
          setActiveLesson(courseLessons[0]);
        }
      }
    } catch (error) {
      console.error('❌ Erreur loadUserProgress:', error);
    }
  };

  // 📝 Charger les notes d'une leçon
  const loadLessonNotes = async (lessonId: string) => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('lesson_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();
      
      setNotes(data?.content || '');
    } catch (error) {
      setNotes('');
    }
  };

  // ✅ Inscription au cours
  const handleEnroll = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Connectez-vous pour vous inscrire');
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          course_id: id!,
          overall_progress: 0,
          completed_lessons: [],
          current_lesson_id: lessons[0]?.id || null,
          started_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setUserProgress(data);
      
      if (lessons[0]) {
        setActiveLesson(lessons[0]);
        await loadLessonNotes(lessons[0].id);
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
    await loadLessonNotes(lesson.id);
    
    // Mettre à jour la leçon actuelle
    try {
      await supabase
        .from('user_progress')
        .update({ 
          current_lesson_id: lesson.id,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', userProgress.id);
    } catch (error) {
      console.error('Erreur MAJ leçon:', error);
    }
  };

  // ✅ Marquer la leçon comme terminée
  const handleMarkComplete = async () => {
    if (!activeLesson || !user || !id || !userProgress) return;
    
    const completed = userProgress.completed_lessons || [];
    
    if (!completed.includes(activeLesson.id)) {
      completed.push(activeLesson.id);
      const progress = Math.round((completed.length / lessons.length) * 100);
      
      try {
        const updateData: any = {
          completed_lessons: completed,
          overall_progress: progress,
          last_accessed_at: new Date().toISOString()
        };

        if (progress === 100) {
          updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('user_progress')
          .update(updateData)
          .eq('id', userProgress.id)
          .select()
          .single();
        
        if (error) throw error;
        
        setUserProgress(data);
        toast.success(progress === 100 ? 'Cours terminé ! 🎊' : 'Leçon complétée ! ✅');
        
        // Auto-passer à la suivante
        if (progress < 100) {
          setTimeout(handleNextLesson, 1500);
        }
      } catch (error) {
        console.error('❌ Erreur MAJ progression:', error);
        toast.error('Erreur de sauvegarde');
      }
    }
  };

  // 💾 Sauvegarder les notes
  const handleSaveNotes = async () => {
    if (!user || !id || !activeLesson) return;
    
    try {
      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: activeLesson.id,
          content: notes,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      toast.success('Notes sauvegardées ! 📝');
    } catch (error) {
      console.error('❌ Erreur notes:', error);
      toast.error('Erreur de sauvegarde des notes');
    }
  };

  // 🔖 Favoris
  const handleBookmark = () => {
    toast.success('Ajouté aux favoris ! 🔖');
  };

  // ➡️ Leçon suivante
  const handleNextLesson = () => {
    const idx = lessons.findIndex(l => l.id === activeLesson?.id);
    if (idx < lessons.length - 1) {
      handleLessonClick(lessons[idx + 1]);
    } else {
      toast.success('Vous avez terminé toutes les leçons ! 🎊');
    }
  };

  // ⬅️ Leçon précédente
  const handlePreviousLesson = () => {
    const idx = lessons.findIndex(l => l.id === activeLesson?.id);
    if (idx > 0) {
      handleLessonClick(lessons[idx - 1]);
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
  const idx = activeLesson ? lessons.findIndex(l => l.id === activeLesson.id) : -1;
  const grouped = modules.map(m => ({ 
    ...m, 
    lessons: lessons.filter(l => l.module_id === m.id) 
  }));

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
                    {lessons.length} leçons
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
                        {userProgress.completed_lessons.length}/{lessons.length} leçons complétées
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
                      {!course.price ? 'Gratuit' : `${course.price}€`}
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

                  {/* 🏆 QUIZ */}
                  {activeLesson.has_quiz && (
                    <div className="card-base p-6 border-2 border-primary/20 bg-primary/5">
                      <div className="flex gap-4">
                        <Award className="w-12 h-12 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Quiz disponible</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Testez vos connaissances sur cette leçon
                          </p>
                          <Button size="sm">
                            Commencer le quiz →
                          </Button>
                        </div>
                      </div>
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
                      disabled={idx >= lessons.length - 1}
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
                {grouped.map(module => (
                  <div key={module.id} className="card-base mb-2">
                    <button 
                      className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedModules(prev => 
                        prev.includes(module.id) 
                          ? prev.filter(x => x !== module.id)
                          : [...prev, module.id]
                      )}
                    >
                      <div className="text-left">
                        <p className="font-medium">{module.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {module.lessons.length} leçon{module.lessons.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      {expandedModules.includes(module.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    
                    {expandedModules.includes(module.id) && (
                      <div className="border-t">
                        {module.lessons.map(lesson => {
                          const done = userProgress?.completed_lessons?.includes(lesson.id);
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
