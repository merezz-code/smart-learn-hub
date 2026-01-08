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

  useEffect(() => {
    if (id) loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      // Charger le cours
      const courseRes = await fetch(`${API_URL}/courses/${id}`, {
        headers: { 'x-user-role': user?.role },
      });
      const courseData = await courseRes.json();
      setCourse(courseData);

      // Charger les modules avec leçons
      const modulesRes = await fetch(`${API_URL}/admin/courses/${id}/modules`, {
        headers: { 'x-user-role': user?.role },
      });
      const modulesData = await modulesRes.json();
      setModules(modulesData);
      
      // Expand le premier module par défaut
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

  const handleAddModule = async () => {
    const title = prompt('Titre du nouveau module:');
    if (!title) return;

    try {
      const response = await fetch(`${API_URL}/admin/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.role,
        },
        body: JSON.stringify({
          course_id: id,
          title,
          order_index: modules.length,
        }),
      });

      if (!response.ok) throw new Error('Erreur création module');

      toast.success('Module créé !');
      loadCourseData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création');
    }
  };

  const handleAddLesson = async (moduleId: string) => {
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
        order_index: 0,
      },
    });
  };

  const handleSaveLesson = async (lessonData: any) => {
    try {
      const url = lessonData.id 
        ? `${API_URL}/admin/lessons/${lessonData.id}`
        : `${API_URL}/admin/lessons`;
      
      const method = lessonData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.role,
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) throw new Error('Erreur sauvegarde');

      toast.success('Leçon sauvegardée !');
      setEditingItem(null);
      loadCourseData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Supprimer ce module et toutes ses leçons ?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': user?.role },
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
    if (!confirm('Supprimer cette leçon ?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': user?.role },
      });

      if (!response.ok) throw new Error('Erreur suppression');

      toast.success('Leçon supprimée');
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">{course?.title}</h1>
            <p className="text-muted-foreground">Éditeur de contenu</p>
          </div>
          <Button onClick={handleAddModule}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un module
          </Button>
        </div>

        {/* Modules */}
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <Card key={module.id} className="overflow-hidden">
              {/* Module Header */}
              <div className="bg-muted/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                  <button
                    onClick={() => toggleModule(module.id.toString())}
                    className="flex-1 text-left flex items-center gap-2"
                  >
                    {expandedModules.includes(module.id.toString()) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronUp className="w-5 h-5" />
                    )}
                    <div>
                      <p className="font-semibold">
                        Module {moduleIndex + 1}: {module.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {module.lessons?.length || 0} leçon(s)
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddLesson(module.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Lessons */}
              {expandedModules.includes(module.id.toString()) && (
                <div className="p-4 space-y-2">
                  {module.lessons && module.lessons.length > 0 ? (
                    module.lessons.map((lesson: any, lessonIndex: number) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 group"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {lessonIndex + 1}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium">{lesson.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {lesson.video_url && (
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                Vidéo
                              </span>
                            )}
                            {lesson.content && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Texte
                              </span>
                            )}
                            <span>• {lesson.duration} min</span>
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
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
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Aucune leçon</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleAddLesson(module.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une leçon
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}

          {modules.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Aucun module créé</p>
              <Button onClick={handleAddModule}>
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier module
              </Button>
            </Card>
          )}
        </div>

        {/* Modal Edition Leçon */}
        {editingItem?.type === 'lesson' && (
          <LessonEditorModal
            lesson={editingItem.data}
            onSave={handleSaveLesson}
            onClose={() => setEditingItem(null)}
          />
        )}
      </div>
    </Layout>
  );
}

// Modal d'édition de leçon
function LessonEditorModal({ lesson, onSave, onClose }: any) {
  const [formData, setFormData] = useState(lesson);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          {lesson.id ? 'Modifier la leçon' : 'Nouvelle leçon'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Introduction aux variables"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Courte description..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type de contenu</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.content_type}
              onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
            >
              <option value="text">Texte uniquement</option>
              <option value="video">Vidéo + Texte</option>
              <option value="mixed">Mixte</option>
            </select>
          </div>

          {(formData.content_type === 'video' || formData.content_type === 'mixed') && (
            <div>
              <label className="block text-sm font-medium mb-1">URL de la vidéo (YouTube/Vimeo)</label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Contenu (HTML)</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="<h3>Titre</h3><p>Votre contenu...</p>"
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="0"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_free_preview}
                  onChange={(e) => setFormData({ ...formData, is_free_preview: e.target.checked ? 1 : 0 })}
                />
                <span className="text-sm">Aperçu gratuit</span>
              </label>
            </div>
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