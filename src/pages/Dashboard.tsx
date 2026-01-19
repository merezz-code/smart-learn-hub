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
import { UserStats, Course } from '@/types/course';
import { courseService } from '@/lib/courseService';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyActivity, setWeeklyActivity] = useState<Record<number, number>>({});

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
      const [userStats, activity, rawCourses] = await Promise.all([
        courseService.getUserStats(user.id),
        courseService.getWeeklyActivity(user.id),
        courseService.getEnrolledCourses(user.id)
      ]);

      setStats(userStats);
      setWeeklyActivity(activity);

      // Déduplication et priorité aux cours complétés
      const courseMap = new Map<number, any>();
      rawCourses.forEach((item: any) => {
        const existing = courseMap.get(item.id);
        const isThisLineCompleted = item.progress.completed === 1 || item.progress.overallProgress === 100;

        if (!existing || (isThisLineCompleted && !existing.isFullyCompleted)) {
          courseMap.set(item.id, {
            ...item,
            isFullyCompleted: isThisLineCompleted
          });
        }
      });

      const finalCourses = Array.from(courseMap.values()).sort((a, b) =>
        new Date(b.progress.lastAccessedAt).getTime() - new Date(a.progress.lastAccessedAt).getTime()
      );

      setEnrolledCourses(finalCourses);
    } catch (error) {
      console.error('Erreur dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

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
    { icon: BookOpen, label: 'Cours inscrits', value: stats?.inProgressCourses || 0, color: 'text-primary', bgColor: 'bg-primary/10' },
    { icon: Trophy, label: 'Cours terminés', value: stats?.completedCourses || 0, color: 'text-success', bgColor: 'bg-success/10' },
    { icon: Target, label: 'Score moyen', value: `${Math.round(stats?.averageScore || 0)}%`, color: 'text-warning', bgColor: 'bg-warning/10' },
    { icon: Flame, label: 'Série actuelle', value: `${stats?.currentStreak || 0} j`, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  ];

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bonjour, <span className="gradient-text">{user?.name || 'Apprenant'}</span> 👋
            </h1>
            <p className="text-muted-foreground">Continuez votre apprentissage où vous l'avez laissé</p>
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
            <div className="lg:col-span-2 space-y-8">
              {/* Continue Learning */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Continuer l'apprentissage</h2>
                  <Link to="/courses">
                    <Button variant="ghost" size="sm">
                      Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                {enrolledCourses.length > 0 ? (
                  <div className="flex flex-col gap-6"> {/* Espacement entre les cours */}
                    {enrolledCourses.map((item) => {
                      const displayProgress = item.isFullyCompleted ? 100 : item.progress.overallProgress;
                      return (
                        <Link key={item.id} to={`/course/${item.id}`} className="block group">
                          <div className="card-interactive p-5 flex gap-6 items-center border border-transparent hover:border-primary/20 transition-all shadow-sm">
                            <div className="relative w-32 h-20 flex-shrink-0 overflow-hidden rounded-xl">
                              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              {item.isFullyCompleted && (
                                <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                                  <Trophy className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{item.title}</h3>
                                {item.isFullyCompleted && (
                                  <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded">TERMINE</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{item.instructor || 'Instructeur'}</p>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-medium">
                                  <span>Progression</span>
                                  <span>{Math.round(displayProgress)}%</span>
                                </div>
                                <Progress value={displayProgress} className="h-2" />
                              </div>
                            </div>
                            <Button size="icon" variant="secondary" className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                              <Play className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="card-base p-12 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Aucun cours en cours</h3>
                    <Link to="/courses"><Button className="mt-2">Explorer les cours</Button></Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card-base p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Progression globale
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
                      <span className="font-medium">{stats?.completedCourses || 0} / {stats?.totalCourses || 0}</span>
                    </div>
                    <Progress value={stats?.totalCourses ? (stats.completedCourses / stats.totalCourses * 100) : 0} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Badges */}
              {stats?.badges && stats.badges.length > 0 && (
                <div className="card-base p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-warning" /> Badges obtenus
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {stats.badges.slice(0, 6).map((userBadge: any) => (
                      <div key={userBadge.id} className="text-center p-2 rounded-lg bg-muted/50" title={userBadge.badge.description}>
                        <span className="text-2xl">{userBadge.badge.icon}</span>
                        <p className="text-[10px] font-medium mt-1 truncate">{userBadge.badge.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}