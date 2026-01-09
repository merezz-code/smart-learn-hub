import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react'; // ajouter l'import si tu utilises lucide

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(252_87%_64%_/_0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(200_95%_55%_/_0.1),transparent_50%)]" />

        <div className="container-custom relative">
          <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-20">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                <span>Plateforme e-learning</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
                Apprenez plus <span className="gradient-text">intelligemment</span>, <br />pas plus dur
              </h1>

              <p className="text-xl text-muted-foreground mb-8">
                Une plateforme e-learning moderne avec des cours interactifs,
                des serious games et un chatbot IA pour vous accompagner.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/register">
                  <Button size="xl">
                    Commencer gratuitement <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="xl" variant="outline">
                    Explorer les cours
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">50+</p>
            <p className="text-muted-foreground">Cours disponibles</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">10K+</p>
            <p className="text-muted-foreground">Étudiants actifs</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">5K+</p>
            <p className="text-muted-foreground">Certificats délivrés</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">98%</p>
            <p className="text-muted-foreground">Taux de satisfaction</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 border border-border rounded-2xl p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à commencer votre apprentissage ?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'étudiants qui font confiance à notre plateforme pour développer leurs compétences
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <Button size="lg">Commencer gratuitement →</Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline">Voir les cours</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
