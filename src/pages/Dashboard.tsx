// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import {
  BookOpen,
  Trophy,
  Clock,
  Flame,
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  Play,
  Loader2,
} from 'lucide-react';
import { UserStats, UserCourseProgress, Course } from '@/types/course';
import { courseService } from '@/lib/courseService';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<(Course & { progress: UserCourseProgress })[]>([]);
  const [loading, setLoading] = useState(true);
  // 1. Ajoutez un état pour l'activité
  const [weeklyActivity, setWeeklyActivity] = useState<Record<number, number>>({});

  // 2. Chargez la donnée dans loadDashboardData
 

  // 3. Modifiez le rendu de la section "Activité cette semaine"
  const days = [
    { label: 'L', index: 1 },
    { label: 'M', index: 2 },
    { label: 'M', index: 3 },
    { label: 'J', index: 4 },
    { label: 'V', index: 5 },
    { label: 'S', index: 6 },
    { label: 'D', index: 0 },
  ];

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les statistiques
      const userStats = await courseService.getUserStats(user.id);
      setStats(userStats);

      // Charger les cours inscrits avec progression
      const courses = await courseService.getEnrolledCourses(user.id);
      setEnrolledCourses(courses);
       const activity = await courseService.getWeeklyActivity(user.id);
  setWeeklyActivity(activity);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const statsCards = [
    {
      icon: BookOpen,
      label: 'Cours inscrits',
      value: stats?.inProgressCourses || 0,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Trophy,
      label: 'Cours terminés',
      value: stats?.completedCourses || 0,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Target,
      label: 'Score moyen',
      value: `${Math.round(stats?.averageScore || 0)}%`,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Flame,
      label: 'Série actuelle',
      value: `${stats?.currentStreak || 0} j`,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">

              Bonjour, <span className="gradient-text">{user?.name || 'Apprenant'}</span> 👋

            </h1>
            <p className="text-muted-foreground">
              Continuez votre apprentissage où vous l'avez laissé
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="card-base p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Continue Learning */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Continuer l'apprentissage</h2>
                  <Link to="/courses">
                    <Button variant="ghost" size="sm">
                      Voir tout
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.sort((a, b) =>
  new Date(b.progress.lastAccessedAt).getTime() -
  new Date(a.progress.lastAccessedAt).getTime()
).map((item) => (
                      <Link key={item.id} to={`/course/${item.id}`}>
                        <div className="card-interactive p-4 flex gap-4">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium mb-1 truncate">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.instructor || 'Instructeur'}
                            </p>
                            <div className="flex items-center gap-3">
                              <Progress value={item.progress.overallProgress} className="flex-1 h-2" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {Math.round(item.progress.overallProgress)}%
                              </span>
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" className="flex-shrink-0 self-center">
                            <Play className="w-5 h-5" />
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="card-base p-8 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Aucun cours en cours</h3>
                    <p className="text-muted-foreground mb-4">
                      Explorez notre catalogue et commencez un nouveau cours
                    </p>
                    <Link to="/courses">
                      <Button>Explorer les cours</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Weekly Activity */}
              {/* <div>
                <h2 className="text-xl font-semibold mb-4">Activité cette semaine</h2>
                <div className="card-base p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Temps total</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {formatTime(stats?.totalTimeSpent || 0)}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => {
                      const minutes = weeklyActivity[day.index] || 0;
                      // On définit l'intensité de la couleur selon le temps (ex: max 120min)
                      const intensity = Math.min(minutes / 120 * 100, 100);

                      return (
                        <div key={day.label} className="text-center">
                          <div
                            className={`w-full aspect-square rounded-lg mb-1 transition-all ${intensity > 70 ? 'gradient-bg' :
                                intensity > 30 ? 'bg-primary/40' :
                                  intensity > 0 ? 'bg-primary/20' : 'bg-muted'
                              }`}
                            title={`${day.label} - ${minutes} min passées`}
                          />
                          <span className="text-xs text-muted-foreground">{day.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div> */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="card-base p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Progression globale
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Score moyen</span>
                      <span className="font-medium">{Math.round(stats?.averageScore || 0)}%</span>
                    </div>
                    <Progress value={stats?.averageScore || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Cours complétés</span>
                      <span className="font-medium">
                        {stats?.completedCourses || 0} / {stats?.totalCourses || 0}
                      </span>
                    </div>
                    <Progress
                      value={stats?.totalCourses ? (stats.completedCourses / stats.totalCourses * 100) : 0}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>

              {/* Badges */}
              {stats?.badges && stats.badges.length > 0 && (
                <div className="card-base p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-warning" />
                    Badges obtenus
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    {stats.badges.slice(0, 6).map((userBadge) => (
                      <div
                        key={userBadge.id}
                        className="text-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        title={userBadge.badge.description}
                      >
                        <span className="text-2xl">{userBadge.badge.icon}</span>
                        <p className="text-xs font-medium mt-1 truncate">
                          {userBadge.badge.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  {stats.badges.length > 6 && (
                    <Button variant="ghost" size="sm" className="w-full mt-3">
                      Voir tous les badges ({stats.badges.length})
                    </Button>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="card-base p-6">
                <h3 className="font-semibold mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <Link to="/game" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      🎮 Jouer au mini-jeu
                    </Button>
                  </Link>
                  <Link to="/chat" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      🤖 Poser une question à l'IA
                    </Button>
                  </Link>
                  <Link to="/courses" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      📚 Explorer les cours
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}