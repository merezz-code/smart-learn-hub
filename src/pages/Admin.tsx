import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Sécurité : admin uniquement
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'x-user-role': user.role },
      });
      setStats(await statsRes.json());

      const coursesRes = await fetch(`${API_URL}/admin/courses`, {
        headers: { 'x-user-role': user.role },
      });
      setCourses(await coursesRes.json());
    } catch (error) {
      console.error(error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      await fetch(`${API_URL}/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': user.role },
      });

      toast.success('Cours supprimé');
      loadData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      await fetch(`${API_URL}/admin/courses/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
        },
        body: JSON.stringify({ published: !published }),
      });

      toast.success(published ? 'Cours dépublié' : 'Cours publié');
      loadData();
    } catch {
      toast.error('Erreur lors de la publication');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground">
              Gestion des cours et du contenu
            </p>
          </div>

          <Button onClick={() => navigate('/admin/course/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau cours
          </Button>
        </div>

        {/* STATISTIQUES */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Cours"
              value={stats.total_courses}
              icon={<BookOpen className="w-8 h-8 text-primary" />}
            />
            <StatCard
              label="Étudiants"
              value={stats.total_students}
              icon={<Users className="w-8 h-8 text-blue-500" />}
            />
            <StatCard
              label="Leçons"
              value={stats.total_lessons}
              icon={<Award className="w-8 h-8 text-green-500" />}
            />
            <StatCard
              label="Quiz"
              value={stats.total_quizzes}
              icon={<TrendingUp className="w-8 h-8 text-orange-500" />}
            />
          </div>
        )}

        {/* LISTE DES COURS */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Tous les cours
          </h2>

          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition"
              >
                <div className="flex-1">
                  <div className="flex gap-3 items-center mb-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <Badge
                      variant={course.published ? 'default' : 'secondary'}
                    >
                      {course.published ? 'Publié' : 'Brouillon'}
                    </Badge>
                    <Badge variant="outline">
                      {course.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {course.description}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleTogglePublish(course.id, course.published)
                    }
                    title={
                      course.published ? 'Dépublier' : 'Publier'
                    }
                  >
                    {course.published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>

                  {/* ✅ BOUTON ÉDITER (AdminCourseEditor) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(`/admin/course/${course.id}/edit`)
                    }
                    title="Éditer le cours"
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
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}

/* ------------------ */
/* Composant StatCard */
/* ------------------ */
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </Card>
  );
}
