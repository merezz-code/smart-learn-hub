// src/pages/Admin.tsx - VERSION AVEC AUTH
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Settings,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 🔐 Fonction helper pour obtenir les headers avec token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger statistiques
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user.role,
        },
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Charger cours
      const coursesRes = await fetch(`${API_URL}/admin/courses`, {
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user.role,
        },
      });
      
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (formData: any) => {
    try {
      const response = await fetch(`${API_URL}/admin/courses`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user.role,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur création');
      }

      const newCourse = await response.json();
      toast.success('Cours créé avec succès !');
      setShowCreateModal(false);
      loadData();
      
      // Rediriger vers l'éditeur
      navigate(`/admin/course/${newCourse.id}/edit`);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateCourse = async (id: string, formData: any) => {
    try {
      const response = await fetch(`${API_URL}/admin/courses/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user.role,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur modification');
      }

      toast.success('Cours modifié avec succès !');
      setEditingCourse(null);
      loadData();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ? Toutes les leçons et quiz associés seront également supprimés.')) return;

    try {
      const response = await fetch(`${API_URL}/admin/courses/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user.role,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur suppression');
      }

      toast.success('Cours supprimé avec succès !');
      loadData();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/admin/courses/${id}/publish`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': user.role,
        },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur publication');
      }

      toast.success(currentStatus ? 'Cours dépublié' : 'Cours publié');
      loadData();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la publication');
    }
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Administration</h1>
            <p className="text-muted-foreground">Gérez les cours et le contenu de la plateforme</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau cours
          </Button>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Cours</p>
                  <p className="text-3xl font-bold">{stats.total_courses || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Étudiants</p>
                  <p className="text-3xl font-bold">{stats.total_students || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Leçons</p>
                  <p className="text-3xl font-bold">{stats.total_lessons || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Quiz</p>
                  <p className="text-3xl font-bold">{stats.total_quizzes || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Liste des cours */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Tous les cours</h2>
            <p className="text-sm text-muted-foreground">
              {courses.length} cours au total
            </p>
          </div>

          <div className="space-y-3">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Miniature */}
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                    alt={course.title}
                    className="w-full sm:w-24 h-16 object-cover rounded flex-shrink-0"
                  />

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <Badge variant={course.published ? 'default' : 'secondary'}>
                        {course.published ? 'Publié' : 'Brouillon'}
                      </Badge>
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="outline" className="capitalize">
                        {course.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.students_count || 0} inscrits
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {Math.floor(course.duration / 60)}h{course.duration % 60}min
                      </span>
                      <span className="flex items-center gap-1">
                        💰 {course.price === 0 ? 'Gratuit' : `${course.price}€`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublish(course.id, course.published)}
                      title={course.published ? 'Dépublier' : 'Publier'}
                    >
                      {course.published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/course/${course.id}/edit`)}
                      title="Éditer le contenu"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCourse(course)}
                      title="Modifier les infos"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCourse(course.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Aucun cours</h3>
                <p className="text-muted-foreground mb-4">
                  Créez votre premier cours pour commencer
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un cours
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Modal Créer/Modifier */}
        {(showCreateModal || editingCourse) && (
          <CourseFormModal
            course={editingCourse}
            onSave={editingCourse 
              ? (data) => handleUpdateCourse(editingCourse.id, data) 
              : handleCreateCourse
            }
            onClose={() => {
              setShowCreateModal(false);
              setEditingCourse(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}

// ========================================
// COMPOSANT : Modal Formulaire de cours
// ========================================
interface CourseFormModalProps {
  course?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

function CourseFormModal({ course, onSave, onClose }: CourseFormModalProps) {
 const [formData, setFormData] = useState({
  title: course?.title || '',
  short_description: course?.short_description || '',
  description: course?.description || '',
  category: course?.category || 'programming',
  level: course?.level || 'beginner',
  duration: course?.duration || 0,
  instructor: course?.instructor || '',
  instructor_avatar: course?.instructor_avatar || '', // ✅ Ajouté
  thumbnail: course?.thumbnail || '',
  price: course?.price || 0,
  content: course?.content || '',
  published: course?.published !== undefined ? course.published : 1,
});

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.duration < 0) {
      newErrors.duration = 'La durée doit être positive';
    }

    if (formData.price < 0) {
      newErrors.price = 'Le prix doit être positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    // ✅ Nettoyer les données avant envoi
    const cleanedData = {
      ...formData,
      // Convertir published en boolean
      published: formData.published === 1 || formData.published === true,
      // Supprimer thumbnail si vide
      thumbnail: formData.thumbnail.trim() || undefined,
      // Supprimer les champs vides optionnels
      short_description: formData.short_description.trim() || undefined,
      instructor: formData.instructor.trim() || undefined,
      instructor_avatar: formData.instructor_avatar?.trim() || undefined,
      content: formData.content.trim() || undefined,
    };

    onSave(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {course ? 'Modifier le cours' : 'Nouveau cours'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Titre du cours *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Introduction à Python"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description courte */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description courte
            </label>
            <Input
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Résumé en une phrase"
            />
          </div>

          {/* Description complète */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description complète *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée du cours..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Catégorie et Niveau */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="programming">Programmation</option>
                <option value="web_development">Développement Web</option>
                <option value="mobile_development">Mobile</option>
                <option value="data_science">Data Science</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="languages">Langues</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Niveau</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Durée et Prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Durée totale (minutes)
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="180"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Environ {Math.floor(formData.duration / 60)}h {formData.duration % 60}min
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prix (€)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                min="0"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = Gratuit
              </p>
            </div>
          </div>

          {/* Instructeur */}
          <div>
            <label className="block text-sm font-medium mb-1">Instructeur</label>
            <Input
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="Nom du formateur"
            />
          </div>

          {/* Miniature */}
          <div>
            <label className="block text-sm font-medium mb-1">
              URL de la miniature
            </label>
            <Input
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            {formData.thumbnail && (
              <img
                src={formData.thumbnail}
                alt="Aperçu"
                className="mt-2 w-full h-32 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contenu introductif (HTML)
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="<h2>Introduction</h2><p>Contenu...</p>"
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          {/* Publié */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published === 1}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked ? 1 : 0 })}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm font-medium">
              Publier immédiatement
            </label>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {course ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}