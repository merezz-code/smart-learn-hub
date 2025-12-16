// src/pages/Index.tsx - VERSION SIMPLE SANS ERREURS
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Apprenez à votre{' '}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  rythme
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Une plateforme e-learning moderne avec des cours interactifs,
                des serious games et un chatbot IA pour vous accompagner.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/courses">
                  <Button size="lg">
                    Explorer les cours →
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                <div className="text-8xl">🎓</div>
              </div>
              
              {/* Floating Card 1 */}
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="text-2xl font-bold">4.9/5</p>
                    <p className="text-xs text-muted-foreground">Note moyenne</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👥</span>
                  <div>
                    <p className="text-2xl font-bold">10K+</p>
                    <p className="text-xs text-muted-foreground">Étudiants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                50+
              </p>
              <p className="text-muted-foreground">Cours disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                10K+
              </p>
              <p className="text-muted-foreground">Étudiants actifs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                5K+
              </p>
              <p className="text-muted-foreground">Certificats délivrés</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                98%
              </p>
              <p className="text-muted-foreground">Taux de satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin pour{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                réussir
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme complète avec toutes les fonctionnalités nécessaires
              pour votre apprentissage
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cours interactifs</h3>
              <p className="text-muted-foreground">
                Apprenez avec des cours structurés et progressifs
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Certificats</h3>
              <p className="text-muted-foreground">
                Obtenez des certificats de réussite
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Badges & Récompenses</h3>
              <p className="text-muted-foreground">
                Gagnez des badges en progressant
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Serious Games</h3>
              <p className="text-muted-foreground">
                Apprenez en jouant avec nos mini-jeux
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chatbot IA</h3>
              <p className="text-muted-foreground">
                Posez vos questions à notre assistant intelligent
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi progression</h3>
              <p className="text-muted-foreground">
                Suivez votre évolution en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Commencez votre parcours d'apprentissage en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Créez votre compte</h3>
              <p className="text-muted-foreground">
                Inscrivez-vous gratuitement en quelques secondes
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Choisissez vos cours</h3>
              <p className="text-muted-foreground">
                Explorez notre catalogue et inscrivez-vous aux cours qui vous intéressent
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Apprenez et progressez</h3>
              <p className="text-muted-foreground">
                Suivez les leçons, passez les quiz et obtenez vos certificats
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 border border-border rounded-2xl p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à commencer votre apprentissage ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'étudiants qui font confiance à notre plateforme
              pour développer leurs compétences
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <Button size="lg">
                  Commencer gratuitement →
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline">
                  Voir les cours
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
