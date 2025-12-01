import { useState } from 'react';
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
import { mockCourses } from '@/data/mockData';
import { Course } from '@/types';
import { Plus, Pencil, Trash2, BookOpen, Users, TrendingUp, DollarSign } from 'lucide-react';

const Admin = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 0,
    lessonsCount: 0,
    price: 0,
    isFree: true,
    tags: '',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  });

  const categories = ['Développement Web', 'Intelligence Artificielle', 'Data Science', 'Cybersécurité', 'DevOps', 'Mobile'];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      duration: 0,
      lessonsCount: 0,
      price: 0,
      isFree: true,
      tags: '',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    });
    setEditingCourse(null);
    setActiveTab('courses');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const courseData: Course = {
      id: editingCourse?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      thumbnail: formData.thumbnail,
      instructorId: '1',
      instructorName: 'Admin',
      category: formData.category,
      level: formData.level,
      duration: formData.duration,
      lessonsCount: formData.lessonsCount,
      rating: editingCourse?.rating || 0,
      enrolledCount: editingCourse?.enrolledCount || 0,
      price: formData.price,
      isFree: formData.isFree,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: editingCourse?.createdAt || new Date(),
    };

    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? courseData : c));
      toast({
        title: "Cours modifié",
        description: `Le cours "${courseData.title}" a été mis à jour.`,
      });
    } else {
      setCourses([courseData, ...courses]);
      toast({
        title: "Cours ajouté",
        description: `Le cours "${courseData.title}" a été créé avec succès.`,
      });
    }
    
    resetForm();
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      lessonsCount: course.lessonsCount,
      price: course.price,
      isFree: course.isFree,
      tags: course.tags.join(', '),
      thumbnail: course.thumbnail,
    });
    setActiveTab('add');
  };

  const handleDelete = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
    toast({
      title: "Cours supprimé",
      description: "Le cours a été supprimé avec succès.",
    });
  };

  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((acc, c) => acc + c.enrolledCount, 0),
    avgRating: (courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1),
    totalRevenue: courses.reduce((acc, c) => acc + (c.isFree ? 0 : c.price * c.enrolledCount), 0),
  };

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
                    <p className="text-sm text-muted-foreground">Étudiants inscrits</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalStudents.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Note moyenne</p>
                    <p className="text-2xl font-bold text-foreground">{stats.avgRating}/5</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus totaux</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalRevenue.toLocaleString()}€</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
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
                <h2 className="text-xl font-semibold text-foreground">Liste des cours</h2>
                <Button onClick={() => { resetForm(); setActiveTab('add'); }} className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  Nouveau cours
                </Button>
              </div>

              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <img 
                          src={course.thumbnail} 
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
                            {course.isFree ? (
                              <Badge className="bg-green-500/20 text-green-600 text-xs">Gratuit</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">{course.price}€</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-4 text-sm text-muted-foreground border-t sm:border-t-0 pt-3 sm:pt-0">
                          <div className="text-center">
                            <p className="font-semibold text-foreground">{course.enrolledCount}</p>
                            <p className="text-xs">inscrits</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground">{course.rating}</p>
                            <p className="text-xs">note</p>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Catégorie *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="level">Niveau</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setFormData({ ...formData, level: value })}
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
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lessonsCount">Nombre de leçons</Label>
                        <Input
                          id="lessonsCount"
                          type="number"
                          value={formData.lessonsCount}
                          onChange={(e) => setFormData({ ...formData, lessonsCount: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="price">Prix (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0, isFree: parseInt(e.target.value) === 0 })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="thumbnail">URL de l'image</Label>
                        <Input
                          id="thumbnail"
                          value={formData.thumbnail}
                          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="React, JavaScript, Frontend"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button type="submit" className="flex-1">
                        {editingCourse ? 'Mettre à jour' : 'Créer le cours'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
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
