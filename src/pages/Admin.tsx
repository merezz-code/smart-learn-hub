import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, BookOpen, Users, TrendingUp, DollarSign, Loader2 } from 'lucide-react';

// Types adaptés pour Supabase (colonnes exactes)
interface Course {
  id: string;
  title: string;
  description: string;
  short_description?: string | null;
  thumbnail?: string | null;
  category: string;
  level: string;
  duration?: number | null; // Column exacte dans Supabase
  instructor?: string | null;
  instructor_avatar?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  students_count?: number | null;
  objectives?: string[] | null;
  prerequisites?: string[] | null;
  published?: boolean | null;
  price?: number | null;
  created_at?: string;
  updated_at?: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category: '',
    level: 'beginner',
    duration: 0,
    objectives: '',
    prerequisites: '',
    price: 0,
    published: true,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  });

  const categories = ['Développement Web', 'Intelligence Artificielle', 'Data Science', 'Cybersécurité', 'DevOps', 'Mobile'];

  // Charger les cours au montage du composant
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les cours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      short_description: '',
      category: '',
      level: 'beginner',
      duration: 0,
      objectives: '',
      prerequisites: '',
      price: 0,
      published: true,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    });
    setEditingCourse(null);
    setActiveTab('courses');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Préparer les données en excluant difficulty_level si null/0
      const courseData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        published: formData.published,
      };

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (formData.short_description) courseData.short_description = formData.short_description;
      if (formData.thumbnail) courseData.thumbnail = formData.thumbnail;
      if (formData.duration > 0) courseData.duration = formData.duration;
      if (formData.price > 0) courseData.price = formData.price;
      
      // Convertir les strings en arrays pour objectives et prerequisites
      if (formData.objectives) {
        const objectivesArray = formData.objectives.split(',').map(s => s.trim()).filter(Boolean);
        if (objectivesArray.length > 0) courseData.objectives = objectivesArray;
      }
      
      if (formData.prerequisites) {
        const prerequisitesArray = formData.prerequisites.split(',').map(s => s.trim()).filter(Boolean);
        if (prerequisitesArray.length > 0) courseData.prerequisites = prerequisitesArray;
      }

      if (editingCourse) {
        // Mise à jour
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;

        toast({
          title: "Cours modifié",
          description: `Le cours "${courseData.title}" a été mis à jour.`,
        });
      } else {
        // Création
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);

        if (error) throw error;

        toast({
          title: "Cours créé",
          description: `Le cours "${courseData.title}" a été créé avec succès.`,
        });
      }

      await loadCourses();
      resetForm();
    } catch (error: any) {
      console.error('Erreur soumission:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      short_description: course.short_description || '',
      category: course.category,
      level: course.level,
      duration: course.duration || 0,
      objectives: course.objectives ? course.objectives.join(', ') : '',
      prerequisites: course.prerequisites ? course.prerequisites.join(', ') : '',
      price: course.price || 0,
      published: course.published ?? true,
      thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    });
    setActiveTab('add');
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Cours supprimé",
        description: "Le cours a été supprimé avec succès.",
      });
      await loadCourses();
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le cours",
        variant: "destructive",
      });
    }
  };

  const stats = {
    totalCourses: courses.length,
    totalPublished: courses.filter(c => c.published).length,
    totalDraft: courses.filter(c => !c.published).length,
    avgPrice: courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + (c.price || 0), 0) / courses.length) : 0,
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Administration</h1>
            <p className="text-muted-foreground">Gérez vos cours et suivez les statistiques</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cours</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalCourses}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Publiés</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalPublished}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Brouillons</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalDraft}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix moyen</p>
                    <p className="text-2xl font-bold text-foreground">{stats.avgPrice}€</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/50 backdrop-blur-sm w-full sm:w-auto">
              <TabsTrigger value="courses" className="flex-1 sm:flex-none">Gestion des cours</TabsTrigger>
              <TabsTrigger value="add" className="flex-1 sm:flex-none">
                {editingCourse ? 'Modifier' : 'Ajouter'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-foreground">Liste des cours ({courses.length})</h2>
                <Button onClick={() => { resetForm(); setActiveTab('add'); }} className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  Nouveau cours
                </Button>
              </div>

              {courses.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Aucun cours</h3>
                    <p className="text-muted-foreground mb-4">Créez votre premier cours pour commencer</p>
                    <Button onClick={() => setActiveTab('add')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un cours
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {courses.map((course) => (
                    <Card key={course.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <img 
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
                            alt={course.title}
                            className="w-full sm:w-24 h-32 sm:h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{course.category}</Badge>
                              <Badge variant={course.level === 'beginner' ? 'default' : course.level === 'intermediate' ? 'secondary' : 'destructive'} className="text-xs">
                                {course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                              </Badge>
                              {course.published ? (
                                <Badge className="bg-green-500/20 text-green-600 text-xs">Publié</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Brouillon</Badge>
                              )}
                              {(course.price || 0) === 0 ? (
                                <Badge className="bg-blue-500/20 text-blue-600 text-xs">Gratuit</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">{course.price}€</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(course)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(course.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="add">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{editingCourse ? 'Modifier le cours' : 'Ajouter un nouveau cours'}</CardTitle>
                  <CardDescription>
                    {editingCourse ? 'Modifiez les informations du cours' : 'Remplissez les informations pour créer un nouveau cours'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Titre du cours *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ex: Introduction à React"
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Catégorie *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                          disabled={submitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Décrivez le contenu du cours..."
                          rows={4}
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="short_description">Description courte</Label>
                        <Input
                          id="short_description"
                          value={formData.short_description}
                          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                          placeholder="Une phrase accrocheuse..."
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="level">Niveau</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(value) => setFormData({ ...formData, level: value })}
                          disabled={submitting}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Débutant</SelectItem>
                            <SelectItem value="intermediate">Intermédiaire</SelectItem>
                            <SelectItem value="advanced">Avancé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="duration">Durée (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="price">Prix (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="thumbnail">URL de l'image</Label>
                        <Input
                          id="thumbnail"
                          value={formData.thumbnail}
                          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                          placeholder="https://..."
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="objectives">Objectifs (séparés par des virgules)</Label>
                        <Textarea
                          id="objectives"
                          value={formData.objectives}
                          onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                          placeholder="Maîtriser React, Créer des applications, ..."
                          rows={3}
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="prerequisites">Prérequis (séparés par des virgules)</Label>
                        <Textarea
                          id="prerequisites"
                          value={formData.prerequisites}
                          onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                          placeholder="HTML/CSS, JavaScript, ..."
                          rows={3}
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="published" className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="published"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            disabled={submitting}
                            className="w-4 h-4"
                          />
                          Publier le cours immédiatement
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button type="submit" className="flex-1" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {editingCourse ? 'Mise à jour...' : 'Création...'}
                          </>
                        ) : (
                          editingCourse ? 'Mettre à jour' : 'Créer le cours'
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
