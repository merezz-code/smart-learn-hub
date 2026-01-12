// src/pages/AdminCourseEditor.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  GripVertical,
  Video,
  FileText,
  Save,
  ArrowLeft,
  Award,
  List,
  X,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminCourseEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [editingModule, setEditingModule] = useState<any>(null);
  const [moduleToDelete, setModuleToDelete] = useState<any>(null);
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [quizToDelete, setQuizToDelete] = useState<any>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token présent:', !!token);
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  useEffect(() => {
    if (id) loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      const courseRes = await fetch(`${API_URL}/courses/${id}`, {
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'user'
        },
      });
      const courseData = await courseRes.json();
      setCourse(courseData);

      const modulesRes = await fetch(`${API_URL}/admin/courses/${id}/modules`, {
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'admin'
        },
      });
      const modulesData = await modulesRes.json();
      setModules(modulesData);
      
      const quizzesRes = await fetch(`${API_URL}/admin/courses/${id}/quizzes`, {
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'admin'
        },
      });
      const quizzesData = await quizzesRes.json();
      setQuizzes(quizzesData);
      
      if (modulesData.length > 0) {
        setExpandedModules([modulesData[0].id.toString()]);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de validation des données du cours
const validateCourseData = (data: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validation du titre
  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Le titre doit contenir au moins 3 caractères';
  }
  
  // Validation de la description
  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères';
  }
  
  // Validation de la description courte
  if (data.short_description && data.short_description.length > 200) {
    errors.short_description = 'La description courte ne doit pas dépasser 200 caractères';
  }
  
  // Validation de la catégorie
  if (!data.category) {
    errors.category = 'Veuillez sélectionner une catégorie';
  }
  
  // Validation du niveau
  if (!data.level) {
    errors.level = 'Veuillez sélectionner un niveau';
  }
  
  // Validation de la durée
  if (data.duration && data.duration < 0) {
    errors.duration = 'La durée doit être positive';
  }
  
  // Validation du prix
  if (data.price && data.price < 0) {
    errors.price = 'Le prix doit être positif';
  }
  
  // Validation de l'instructeur
  if (!data.instructor || data.instructor.trim().length < 2) {
    errors.instructor = 'Le nom de l\'instructeur doit contenir au moins 2 caractères';
  }
  
  return errors;
};

function ModuleEditorModal({ module, onSave, onClose }: any) {
  const [title, setTitle] = useState(module.title || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Le titre du module est requis');
      return;
    }

    onSave(title);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {module.id ? 'Modifier le module' : 'Nouveau module'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

const handleSaveModule = async (title: string) => {
  try {
    const response = await fetch(`${API_URL}/admin/modules`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'x-user-role': user?.role || 'admin',
      },
      body: JSON.stringify({
        course_id: id,
        title,
        order_index: modules.length,
      }),
    });

    if (!response.ok) throw new Error();

    toast.success('Module créé avec succès');
    setEditingModule(null);
    loadCourseData();
  } catch {
    toast.error('Erreur lors de la création du module');
  }
};


function DeleteModuleModal({ module, onConfirm, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl border-destructive/20 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-destructive" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold">Supprimer le module ?</h2>
            <p className="text-muted-foreground mt-2">
              Êtes-vous sûr de vouloir supprimer <strong>"{module.title}"</strong> ? 
              <span className="block text-destructive font-medium mt-1">
                Cette action supprimera également toutes les leçons contenues dans ce module.
              </span>
            </p>
          </div>

          <div className="flex w-full gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1" 
              onClick={() => onConfirm(module.id)}
            >
              Supprimer tout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DeleteLessonModal({ lesson, onConfirm, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <Trash2 className="w-10 h-10 text-amber-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Supprimer la leçon ?</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer la leçon <span className="font-semibold text-gray-700">"{lesson.title}"</span> ? 
            <br />Cette action est irréversible.
          </p>

          <div className="flex w-full gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl border-gray-200" 
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-white" 
              onClick={() => onConfirm(lesson.id)}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DeleteQuizModal({ quiz, onConfirm, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
            <Award className="w-10 h-10 text-purple-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Supprimer le quiz ?</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer le quiz <span className="font-semibold text-gray-700">"{quiz.title}"</span> ? 
            <br />Toutes les questions et les résultats associés seront perdus.
          </p>

          <div className="flex w-full gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl border-gray-200" 
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-white" 
              onClick={() => onConfirm(quiz.id)}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

  const handleAddLesson = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    const lessonsCount = module?.lessons?.length || 0;
    
    setEditingItem({
      type: 'lesson',
      data: {
        module_id: moduleId,
        course_id: id,
        title: '',
        description: '',
        content: '',
        content_type: 'text',
        video_url: '',
        duration: 0,
        order_index: lessonsCount,
        is_free_preview: false,
      },
    });
  };

  const handleSaveLesson = async (lessonData: any) => {
    try {
      const url = lessonData.id 
        ? `${API_URL}/admin/lessons/${lessonData.id}`
        : `${API_URL}/admin/lessons`;
      
      const method = lessonData.id ? 'PUT' : 'POST';

      const cleanData = {
        ...lessonData,
        course_id: parseInt(lessonData.course_id),
        module_id: parseInt(lessonData.module_id),
        duration: parseInt(lessonData.duration) || 0,
        order_index: parseInt(lessonData.order_index) || 0,
        is_free_preview: Boolean(lessonData.is_free_preview),
      };

      if (!cleanData.video_url || cleanData.video_url.trim() === '') {
        delete cleanData.video_url;
        delete cleanData.video_thumbnail;
      } else {
        // Si video_url existe, garder video_thumbnail seulement s'il a une valeur
        if (!cleanData.video_thumbnail || cleanData.video_thumbnail.trim() === '') {
          delete cleanData.video_thumbnail;
        }
      }

      console.log('📤 Données envoyées:', cleanData);

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'admin',
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur serveur:', errorData);
        throw new Error(errorData.message || 'Erreur sauvegarde');
      }

      toast.success('Leçon sauvegardée !');
      setEditingItem(null);
      loadCourseData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'admin',
        },
      });

      if (!response.ok) throw new Error('Erreur suppression');

      toast.success('Module supprimé');
      loadCourseData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'admin',
        },
      });

      if (!response.ok) throw new Error('Erreur suppression');

      toast.success('Leçon supprimée');
      loadCourseData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCreateQuiz = () => {
    setEditingQuiz({
      course_id: id,
      title: '',
      description: '',
      passing_score: 70,
      time_limit: 30,
      max_attempts: 0,
      questions: [],
    });
  };

  const handleSaveQuiz = async (quizData: any) => {
    try {
      console.log('💾 Sauvegarde quiz avec questions:', quizData);
      
      // Validation des questions
      if (!quizData.questions || quizData.questions.length === 0) {
        toast.error('Veuillez ajouter au moins une question');
        return;
      }

      // Vérifier que toutes les questions sont valides
      for (let i = 0; i < quizData.questions.length; i++) {
        const q = quizData.questions[i];
        if (!q.question_text || q.question_text.trim() === '') {
          toast.error(`Question ${i + 1}: Le texte de la question est requis`);
          return;
        }
        if (!q.options || q.options.length < 2) {
          toast.error(`Question ${i + 1}: Au moins 2 options sont requises`);
          return;
        }
        // Vérifier que les options ont du texte
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].text || q.options[j].text.trim() === '') {
            toast.error(`Question ${i + 1}, Option ${j + 1}: Le texte est requis`);
            return;
          }
        }
        if (!q.correct_answer) {
          toast.error(`Question ${i + 1}: Veuillez sélectionner la bonne réponse`);
          return;
        }
      }
      
      const url = quizData.id 
        ? `${API_URL}/admin/quizzes/${quizData.id}`
        : `${API_URL}/admin/quizzes`;
      
      const method = quizData.id ? 'PUT' : 'POST';

      // Préparer les données du quiz (sans les questions pour l'instant)
      const quizPayload = {
        course_id: parseInt(quizData.course_id),
        title: quizData.title,
        description: quizData.description,
        passing_score: parseInt(quizData.passing_score) || 70,
        time_limit: parseInt(quizData.time_limit) || 0,
        max_attempts: parseInt(quizData.max_attempts) || 0,
      };

      if (quizData.id) {
        quizPayload.id = quizData.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'admin',
        },
        body: JSON.stringify(quizPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur serveur:', errorData);
        throw new Error(errorData.message || 'Erreur sauvegarde quiz');
      }

      const savedQuiz = await response.json();
      const quizId = savedQuiz.id || quizData.id;

      console.log('✅ Quiz sauvegardé, ID:', quizId);

      // Maintenant sauvegarder les questions
      if (quizData.id) {
        // Si c'est une mise à jour, supprimer d'abord les anciennes questions
        console.log('🗑️ Suppression des anciennes questions...');
        await fetch(`${API_URL}/admin/quizzes/${quizId}/questions`, {
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(),
            'x-user-role': user?.role || 'admin',
          },
        });
      }

      // Créer les nouvelles questions
      console.log('➕ Création des questions...');
      for (let i = 0; i < quizData.questions.length; i++) {
        const question = quizData.questions[i];
        
        // ✅ CORRECTION CRITIQUE: Convertir les options d'objets en array de strings
        const optionsArray = question.options.map((opt: any) => opt.text);
        
        const questionPayload = {
          quiz_id: parseInt(quizId),
          question_text: question.question_text,
          question_type: question.question_type || 'multiple_choice', 
          options: optionsArray, // ✅ Array de strings
          correct_answer: question.correct_answer,
          points: parseInt(question.points) || 1,
          explanation: question.explanation && question.explanation.trim() !== '' 
            ? question.explanation 
            : undefined, // ✅ undefined si vide
          order_index: i,
        };

        console.log(`📤 Envoi question ${i + 1}:`, questionPayload);

        const questionResponse = await fetch(`${API_URL}/admin/questions`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'x-user-role': user?.role || 'admin',
          },
          body: JSON.stringify(questionPayload),
        });

        if (!questionResponse.ok) {
          const errorData = await questionResponse.json();
          console.error('Erreur création question:', errorData);
          console.error('Payload envoyé:', questionPayload);
          throw new Error(`Erreur création question ${i + 1}: ${errorData.error || errorData.message}`);
        }
        
        console.log(`✅ Question ${i + 1} créée`);
      }

      toast.success('Quiz sauvegardé avec succès !');
      setEditingQuiz(null);
      loadCourseData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde du quiz');
    }
  };

  const handleEditQuiz = async (quizId: string) => {
    try {
      // Charger le quiz complet avec ses questions
      const response = await fetch(`${API_URL}/admin/quizzes/${quizId}`, {
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'admin',
        },
      });

      if (!response.ok) throw new Error('Erreur chargement quiz');

      const quizData = await response.json();
      
      // S'assurer que les questions ont le bon format
      if (quizData.questions) {
        quizData.questions = quizData.questions.map((q: any) => {
          // Parser les options si c'est une string JSON
          let options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          
          // Convertir array de strings en array d'objets {id, text}
          if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'string') {
            options = options.map((text: string, index: number) => ({
              id: String.fromCharCode(97 + index), // a, b, c, d...
              text: text
            }));
          }
          
          return {
            ...q,
            options: options
          };
        });
      }

      setEditingQuiz(quizData);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user?.role || 'admin',
        },
      });

      if (!response.ok) throw new Error('Erreur suppression');

      toast.success('Quiz supprimé');
      loadCourseData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">{course?.title}</h1>
            <p className="text-muted-foreground">Éditeur de cours</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'content'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4 inline mr-2" />
            Contenu
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'quiz'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Quiz ({quizzes.length})
          </button>
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Modules et Leçons</h2>
              <Button onClick={() => setEditingModule({ title: '' })}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau module
              </Button>
            </div>

            <div className="space-y-4">
              {modules.map((module) => (
                <Card key={module.id} className="overflow-hidden">
                  <div className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleModule(module.id.toString())}
                          className="p-1 hover:bg-background rounded"
                        >
                          {expandedModules.includes(module.id.toString()) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.lessons?.length || 0} leçon(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAddLesson(module.id)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Évite d'ouvrir/fermer le module
                            setModuleToDelete(module); // Ouvre le modal de confirmation
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {expandedModules.includes(module.id.toString()) && (
                    <div className="p-4 space-y-2">
                      {module.lessons && module.lessons.length > 0 ? (
                        module.lessons.map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.content_type === 'video' ? (
                                <Video className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              )}
                              <div>
                                <p className="font-medium">{lesson.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {lesson.duration} min
                                  {lesson.is_free_preview && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                      Aperçu gratuit
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingItem({ type: 'lesson', data: lesson })}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setLessonToDelete(lesson)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          Aucune leçon. Cliquez sur + pour ajouter une leçon.
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))}

              {modules.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">Aucun module créé</p>
                  <Button onClick={ModuleEditorModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer le premier module
                  </Button>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Quiz du cours</h2>
              <Button onClick={handleCreateQuiz}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau quiz
              </Button>
            </div>

            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{quiz.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {quiz.description}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">
                          📊 Score requis: <strong>{quiz.passing_score}%</strong>
                        </span>
                        <span className="text-muted-foreground">
                          ⏱️ Durée: <strong>{quiz.time_limit} min</strong>
                        </span>
                        <span className="text-muted-foreground">
                          🔄 Tentatives: <strong>{quiz.max_attempts || '∞'}</strong>
                        </span>
                        <span className="text-muted-foreground">
                          ❓ Questions: <strong>{quiz.questions_count || 0}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditQuiz(quiz.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuizToDelete(quiz)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {quizzes.length === 0 && (
                <Card className="p-12 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">Aucun quiz créé</p>
                  <Button onClick={handleCreateQuiz}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer le premier quiz
                  </Button>
                </Card>
              )}
            </div>
          </>
        )}

        {editingItem?.type === 'lesson' && (
          <LessonEditorModal
            lesson={editingItem.data}
            onSave={handleSaveLesson}
            onClose={() => setEditingItem(null)}
          />
        )}

        {editingQuiz && (
          <QuizEditorModal
            quiz={editingQuiz}
            onSave={handleSaveQuiz}
            onClose={() => setEditingQuiz(null)}
          />
        )}

        {editingModule && (
          <ModuleEditorModal
            module={editingModule}
            onSave={handleSaveModule}
            onClose={() => setEditingModule(null)}
          />
        )}
        
        {moduleToDelete && (
          <DeleteModuleModal
            module={moduleToDelete}
            onClose={() => setModuleToDelete(null)}
            onConfirm={(id: number) => {
              handleDeleteModule(id);
              setModuleToDelete(null);
            }}
          />
        )}

        {/* modal pour supprimer une leçon */}
        {lessonToDelete && (
          <DeleteLessonModal
            lesson={lessonToDelete}
            onClose={() => setLessonToDelete(null)}
            onConfirm={(id: string) => {
              handleDeleteLesson(id);
              setLessonToDelete(null);
            }}
          />
        )}

        {/* modal Quiz */}
        {quizToDelete && (
          <DeleteQuizModal
            quiz={quizToDelete}
            onClose={() => setQuizToDelete(null)}
            onConfirm={(id: string) => {
              handleDeleteQuiz(id);
              setQuizToDelete(null);
            }}
          />
        )}

      </div>
    </Layout>
  );
}

function QuizEditorModal({ quiz, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    ...quiz,
    questions: quiz.questions || [],
  });

  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question_text: '',
          question_type: 'multiple_choice', // ✅ IMPORTANT: valeur par défaut
          options: [
            { id: 'a', text: '' },
            { id: 'b', text: '' },
          ], // ✅ Commencer avec 2 options minimum
          correct_answer: 'a',
          points: 1,
          explanation: '',
          order_index: formData.questions.length,
        },
      ],
    });
    setEditingQuestion(formData.questions.length);
  };

  // ✅ NOUVEAU: Ajouter une option à une question
  const handleAddOption = (questionIndex: number) => {
    const question = formData.questions[questionIndex];
    const newOptionId = String.fromCharCode(97 + question.options.length); // a, b, c, d, e...
    
    const newOptions = [
      ...question.options,
      { id: newOptionId, text: '' }
    ];
    
    handleUpdateQuestion(questionIndex, { options: newOptions });
  };

  // ✅ NOUVEAU: Supprimer une option
  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const question = formData.questions[questionIndex];
    
    if (question.options.length <= 2) {
      toast.error('Vous devez avoir au moins 2 options');
      return;
    }
    
    const newOptions = question.options.filter((_: any, i: number) => i !== optionIndex);
    
    // Réassigner les IDs (a, b, c, d...)
    newOptions.forEach((opt: any, i: number) => {
      opt.id = String.fromCharCode(97 + i);
    });
    
    handleUpdateQuestion(questionIndex, { options: newOptions });
  };

  const handleUpdateQuestion = (index: number, updates: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setFormData({ ...formData, questions: newQuestions });
    
    // Effacer les erreurs pour cette question
    const newErrors = { ...errors };
    delete newErrors[`question_${index}`];
    delete newErrors[`question_${index}_text`];
    delete newErrors[`question_${index}_options`];
    delete newErrors[`question_${index}_answer`];
    setErrors(newErrors);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validation du quiz
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.passing_score || formData.passing_score < 0 || formData.passing_score > 100) {
      newErrors.passing_score = 'Le score doit être entre 0 et 100';
    }

    // Validation des questions
    if (!formData.questions || formData.questions.length === 0) {
      newErrors.questions = 'Ajoutez au moins une question';
    } else {
      formData.questions.forEach((q: any, i: number) => {
        if (!q.question_text || q.question_text.trim() === '') {
          newErrors[`question_${i}_text`] = 'Le texte de la question est requis';
        }
        if (!q.options || q.options.length < 2) {
          newErrors[`question_${i}_options`] = 'Au moins 2 options sont requises';
        } else {
          // Vérifier que toutes les options ont du texte
          const emptyOptions = q.options.filter((opt: any) => !opt.text || opt.text.trim() === '');
          if (emptyOptions.length > 0) {
            newErrors[`question_${i}_options`] = 'Toutes les options doivent avoir du texte';
          }
        }

        if (!q.correct_answer) {
          newErrors[`question_${i}_answer`] = 'Sélectionnez la bonne réponse';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    } else {
      toast.error('Veuillez corriger les erreurs du formulaire');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {quiz.id ? 'Modifier le quiz' : 'Nouveau quiz'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.title;
                  setErrors(newErrors);
                }}
                required
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Score minimum (%) *</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passing_score}
                  onChange={(e) => {
                    setFormData({ ...formData, passing_score: parseInt(e.target.value) });
                    const newErrors = { ...errors };
                    delete newErrors.passing_score;
                    setErrors(newErrors);
                  }}
                  className={errors.passing_score ? 'border-red-500' : ''}
                />
                {errors.passing_score && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.passing_score}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Temps limite (min)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                  placeholder="0 = illimité"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tentatives max</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.max_attempts}
                  onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                  placeholder="0 = illimité"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Questions ({formData.questions.length})
              </h3>
              <Button type="button" onClick={handleAddQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une question
              </Button>
            </div>

            {errors.questions && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.questions}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {formData.questions.map((question: any, index: number) => (
                <Card key={index} className={`p-4 ${
                  errors[`question_${index}_text`] || 
                  errors[`question_${index}_options`] || 
                  errors[`question_${index}_answer`] 
                    ? 'border-red-500' 
                    : ''
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingQuestion(editingQuestion === index ? null : index)}
                      >
                        {editingQuestion === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {editingQuestion === index ? (
                    <div className="space-y-3">
                      <div>
                        <Input
                          placeholder="Question"
                          value={question.question_text}
                          onChange={(e) => handleUpdateQuestion(index, { question_text: e.target.value })}
                          className={errors[`question_${index}_text`] ? 'border-red-500' : ''}
                        />
                        {errors[`question_${index}_text`] && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`question_${index}_text`]}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium">Options:</label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddOption(index)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Ajouter option
                          </Button>
                        </div>
                        
                        {question.options.map((opt: any, optIndex: number) => (
                          <div key={opt.id} className="flex gap-2 items-center">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              checked={question.correct_answer === opt.id}
                              onChange={() => handleUpdateQuestion(index, { correct_answer: opt.id })}
                              className="flex-shrink-0"
                            />
                            <Input
                              placeholder={`Option ${opt.id.toUpperCase()}`}
                              value={opt.text}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optIndex].text = e.target.value;
                                handleUpdateQuestion(index, { options: newOptions });
                              }}
                              className="flex-1"
                            />
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemoveOption(index, optIndex)}
                                className="flex-shrink-0"
                              >
                                <Minus className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {errors[`question_${index}_options`] && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`question_${index}_options`]}
                          </p>
                        )}
                        {errors[`question_${index}_answer`] && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`question_${index}_answer`]}
                          </p>
                        )}
                      </div>

                      <Textarea
                        placeholder="Explication (optionnelle)"
                        value={question.explanation}
                        onChange={(e) => handleUpdateQuestion(index, { explanation: e.target.value })}
                        rows={2}
                      />

                      <Input
                        type="number"
                        placeholder="Points"
                        value={question.points}
                        onChange={(e) => handleUpdateQuestion(index, { points: parseInt(e.target.value) })}
                        className="w-24"
                        min="1"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground truncate">
                        {question.question_text || 'Nouvelle question'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {question.options.length} option(s)
                      </p>
                      {(errors[`question_${index}_text`] || 
                        errors[`question_${index}_options`] || 
                        errors[`question_${index}_answer`]) && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Cette question contient des erreurs
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder le quiz
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function LessonEditorModal({ lesson, onSave, onClose }: any) {
  const [formData, setFormData] = useState(lesson);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    }

    if (!formData.content || formData.content.trim() === '') {
      newErrors.content = 'Le contenu de la leçon est requis';
    }

    if (formData.duration !== undefined && (isNaN(formData.duration) || formData.duration < 0)) {
      newErrors.duration = 'La durée doit être un nombre positif';
    }

    if ((formData.content_type === 'video' || formData.content_type === 'mixed')) {
      if (formData.video_url && !formData.video_url.match(/^https?:\/\/.+/)) {
        newErrors.video_url = 'URL invalide (doit commencer par http:// ou https://)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    } else {
      toast.error('Veuillez corriger les erreurs de la leçon');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {lesson.id ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            {lesson.id ? 'Modifier la leçon' : 'Nouvelle leçon'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TITRE */}
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Introduction aux variables"
              className={errors.title ? 'border-destructive ring-destructive/20' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Description (optionnelle)</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Courte description de ce que l'élève va apprendre..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TYPE DE CONTENU */}
            <div>
              <label className="block text-sm font-medium mb-1">Type de contenu</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={formData.content_type}
                onChange={(e) => handleChange('content_type', e.target.value)}
              >
                <option value="text">Texte uniquement</option>
                <option value="video">Vidéo + Texte</option>
                <option value="mixed">Mixte</option>
              </select>
            </div>

            {/* DURÉE */}
            <div>
              <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                min="0"
                className={errors.duration ? 'border-destructive' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.duration}
                </p>
              )}
            </div>
          </div>

          {/* URL VIDÉO (Conditionnel) */}
          {(formData.content_type === 'video' || formData.content_type === 'mixed') && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium mb-1">URL de la vidéo (YouTube/Vimeo) *</label>
              <Input
                value={formData.video_url}
                onChange={(e) => handleChange('video_url', e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className={errors.video_url ? 'border-destructive' : ''}
              />
              {errors.video_url && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.video_url}
                </p>
              )}
            </div>
          )}

          {/* CONTENU HTML */}
          <div>
            <label className="block text-sm font-medium mb-1">Contenu de la leçon (HTML) *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="<h3>Introduction</h3><p>Votre contenu ici...</p>"
              rows={8}
              className={`font-mono text-sm ${errors.content ? 'border-destructive ring-destructive/20' : ''}`}
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.content}
              </p>
            )}
          </div>

          {/* APERÇU GRATUIT */}
          <div className="flex items-center space-x-2 py-2">
            <input
              type="checkbox"
              id="is_free_preview"
              className="w-4 h-4 accent-primary"
              checked={formData.is_free_preview === true || formData.is_free_preview === 1}
              onChange={(e) => handleChange('is_free_preview', e.target.checked)}
            />
            <label htmlFor="is_free_preview" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Rendre cette leçon disponible en aperçu gratuit
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="px-8">
              <Save className="w-4 h-4 mr-2" />
              {lesson.id ? 'Mettre à jour' : 'Créer la leçon'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

