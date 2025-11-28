import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { mockUserProgress, mockEnrolledCourses } from '@/data/mockData';
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
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Cours inscrits',
      value: mockUserProgress.coursesEnrolled,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Trophy,
      label: 'Cours terminés',
      value: mockUserProgress.coursesCompleted,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Target,
      label: 'Quiz réussis',
      value: mockUserProgress.quizzesPassed,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Flame,
      label: 'Jours consécutifs',
      value: mockUserProgress.streak,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
  };

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bonjour, <span className="gradient-text">{user?.name}</span> 👋
            </h1>
            <p className="text-muted-foreground">
              Continuez votre apprentissage où vous l'avez laissé
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
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

                <div className="space-y-4">
                  {mockEnrolledCourses.slice(0, 3).map((course) => (
                    <Link key={course.id} to={`/course/${course.id}`}>
                      <div className="card-interactive p-4 flex gap-4">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-1 truncate">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.instructorName}
                          </p>
                          <div className="flex items-center gap-3">
                            <Progress value={course.progress} className="flex-1 h-2" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {course.progress}%
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
              </div>

              {/* Weekly Activity */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Activité cette semaine</h2>
                <div className="card-base p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Temps total</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {formatTime(mockUserProgress.totalTimeSpent)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => {
                      const activity = Math.random() * 100;
                      return (
                        <div key={index} className="text-center">
                          <div
                            className={`w-full aspect-square rounded-lg mb-1 ${
                              activity > 70 ? 'gradient-bg' :
                              activity > 30 ? 'bg-primary/40' :
                              activity > 0 ? 'bg-primary/20' : 'bg-muted'
                            }`}
                          />
                          <span className="text-xs text-muted-foreground">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
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
                      <span className="font-medium">{mockUserProgress.averageScore}%</span>
                    </div>
                    <Progress value={mockUserProgress.averageScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Leçons complétées</span>
                      <span className="font-medium">{mockUserProgress.lessonsCompleted}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="card-base p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-warning" />
                  Badges obtenus
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {mockUserProgress.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="text-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      title={badge.description}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <p className="text-xs font-medium mt-1 truncate">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>

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
