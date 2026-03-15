import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, DollarSign, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">🚗 Joy Drive</div>
          <div className="space-x-4">
            <Button variant="ghost">Accueil</Button>
            <Button>Se connecter</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bienvenue sur Joy Drive
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            L'application de covoiturage la plus simple et la plus fiable
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Commencer maintenant
            </Button>
            <Button size="lg" variant="outline">
              En savoir plus
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <Card>
            <CardHeader>
              <MapPin className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle>Localisation GPS</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Trouvez les trajets à proximité en temps réel
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle>Communauté</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Rejoignez des milliers de conducteurs et passagers
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle>Tarifs justes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tarification transparente et compétitive
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle>Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Réservez votre trajet en moins d'une minute
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-lg mb-8">Téléchargez Joy Drive et trouvez votre prochain trajet</p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
            Télécharger l'application
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Joy Drive</h3>
              <p>L'application de covoiturage la plus simple</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Conditions</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2026 Joy Drive. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
