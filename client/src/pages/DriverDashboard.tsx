import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Star, Zap, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(false);

  const { data: profile } = trpc.drivers.getProfile.useQuery();
  const updateStatusMutation = trpc.drivers.updateStatus.useMutation({
    onSuccess: (data) => {
      setIsOnline(data.status === "online");
      toast.success(`Statut mis à jour: ${data.status}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du statut");
    },
  });

  const handleToggleOnline = () => {
    updateStatusMutation.mutate(isOnline ? "offline" : "online");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord chauffeur</h1>
              <p className="text-sm text-gray-600">Gérez vos courses et vos revenus</p>
            </div>
          </div>
          <Button
            size="lg"
            className={isOnline ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}
            onClick={handleToggleOnline}
            disabled={updateStatusMutation.isPending}
          >
            {isOnline ? (
              <>
                <ToggleRight className="w-5 h-5 mr-2" />
                En ligne
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 mr-2" />
                Hors ligne
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Courses totales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{profile?.totalRides || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Tous les temps</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenus totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">R{parseFloat((profile?.totalEarnings || 0).toString()).toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Revenus cumulés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Note moyenne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">{parseFloat((profile?.rating || 0).toString()).toFixed(1)}</p>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">{profile?.ratingCount || 0} avis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={isOnline ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {isOnline ? "En ligne" : "Hors ligne"}
              </Badge>
              <p className="text-xs text-gray-500 mt-2">
                {profile?.isVerified ? "✓ Vérifié" : "⏳ En attente de vérification"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profil Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de profil</CardTitle>
            <CardDescription>Vos détails en tant que chauffeur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Numéro de permis</p>
                <p className="font-medium">{profile?.licenseNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiration du permis</p>
                <p className="font-medium">
                  {profile?.licenseExpiry ? new Date(profile.licenseExpiry).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Compte bancaire</p>
                <p className="font-medium">••••••••{profile?.bankAccount?.slice(-4) || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut de vérification</p>
                <Badge className={profile?.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {profile?.isVerified ? "Vérifié" : "En attente"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Rides */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Courses disponibles</CardTitle>
            <CardDescription>Les courses en attente d'acceptation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune course disponible pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">Mettez-vous en ligne pour recevoir des demandes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
