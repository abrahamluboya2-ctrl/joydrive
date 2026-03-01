import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Phone, Star, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function RidesManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: rides, isLoading } = trpc.rides.getPassengerRides.useQuery({ limit: 50 });
  const cancelRideMutation = trpc.rides.cancelRide.useMutation({
    onSuccess: () => {
      toast.success("Course annulée avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "driver_arriving":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "requested":
        return "En attente";
      case "accepted":
        return "Acceptée";
      case "driver_arriving":
        return "Chauffeur arrive";
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes courses</h1>
            <p className="text-sm text-gray-600">Historique et gestion de vos trajets</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement de vos courses...</p>
          </div>
        ) : rides && rides.length > 0 ? (
          <div className="space-y-4">
            {rides.map((ride: any) => (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Route Info */}
                    <div className="md:col-span-2">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Départ</p>
                            <p className="font-medium text-sm">{ride.pickupLocation?.address || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Arrivée</p>
                            <p className="font-medium text-sm">{ride.dropoffLocation?.address || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Type de véhicule</p>
                        <Badge variant="outline">{ride.vehicleType}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="font-medium text-sm">{parseFloat(ride.estimatedDistance).toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Durée estimée</p>
                        <p className="font-medium text-sm">{Math.ceil(ride.estimatedDuration / 60)} min</p>
                      </div>
                    </div>

                    {/* Status & Price */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Statut</p>
                        <Badge className={getStatusColor(ride.status)}>
                          {getStatusLabel(ride.status)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tarif</p>
                        <p className="text-xl font-bold text-indigo-600">R{parseFloat(ride.totalFare).toFixed(2)}</p>
                      </div>
                      {["requested", "accepted"].includes(ride.status) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelRideMutation.mutate({ rideId: ride.id })}
                          disabled={cancelRideMutation.isPending}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-500 mb-4">Vous n'avez pas encore de courses</p>
              <Button onClick={() => setLocation("/")}>
                Réserver une course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
