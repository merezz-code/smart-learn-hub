import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { CourseCard } from '@/components/courses/CourseCard';
import { mockCourses } from '@/data/mockData';
import { 
  GraduationCap, 
  Brain, 
  Gamepad2, 
  MessageCircle, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Award
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Assistant IA Intelligent',
    description: 'Posez vos questions et obtenez des réponses précises basées sur vos cours grâce au RAG.',
  },
  {
    icon: Gamepad2,
    title: 'Mini-jeux Éducatifs',
    description: 'Apprenez en vous amusant avec des jeux interactifs qui renforcent vos connaissances.',
  },
  {
    icon: TrendingUp,
    title: 'Suivi de Progression',
    description: 'Visualisez vos progrès avec des statistiques détaillées et gagnez des badges.',
  },
  {
    icon: MessageCircle,
    title: 'Contenu Interactif',
    description: 'Vidéos, textes, PDFs et quiz pour un apprentissage complet et varié.',
  },
];

const stats = [
  { value: '10K+', label: 'Étudiants actifs' },
  { value: '500+', label: 'Cours disponibles' },
  { value: '95%', label: 'Taux de satisfaction' },
  { value: '24/7', label: 'Support IA' },
];

export default function Index() {
  const featuredCourses = mockCourses.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(252_87%_64%_/_0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(200_95%_55%_/_0.1),transparent_50%)]" />
        
        <div className="container-custom relative">
          <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-20">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                <span>Plateforme e-learning propulsée par l'IA</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
                Apprenez plus <span className="gradient-text">intelligemment</span>,
                <br />pas plus dur
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl animate-slide-up stagger-1">
                SmartLearn combine cours interactifs, mini-jeux éducatifs et un assistant IA 
                intelligent pour une expérience d'apprentissage personnalisée et efficace.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-12 animate-slide-up stagger-2">
                <Link to="/register">
                  <Button variant="hero" size="xl">
                    Commencer gratuitement
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" size="xl">
                    Explorer les cours
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 animate-slide-up stagger-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-background gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">+10,000 étudiants</p>
                  <p className="text-muted-foreground">nous font confiance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pourquoi choisir <span className="gradient-text">SmartLearn</span> ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une plateforme complète qui s'adapte à votre façon d'apprendre
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card-base p-6 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Cours populaires</h2>
              <p className="text-muted-foreground">Commencez votre parcours d'apprentissage</p>
            </div>
            <Link to="/courses">
              <Button variant="outline" className="hidden sm:flex">
                Voir tous les cours
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/courses">
              <Button variant="outline">
                Voir tous les cours
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white/10,transparent_50%)]" />
            
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                Prêt à transformer votre apprentissage ?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers d'étudiants qui ont déjà accéléré leur progression avec SmartLearn.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button 
                    variant="secondary" 
                    size="xl"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    Créer un compte gratuit
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              
              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-primary-foreground/90">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Accès gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Sans carte bancaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Annulation facile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold gradient-text">SmartLearn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SmartLearn. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
