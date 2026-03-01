import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Star, Clock, DollarSign, LogOut } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import JoyAI from "@/components/JoyAI";

export default function PassengerHome() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [vehicleType, setVehicleType] = useState<"Lite" | "Drive" | "VIP">("Lite");

  const requestRideMutation = trpc.rides.requestRide.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Course créée ! Tarif estimé : R${parseFloat(data.totalFare).toFixed(2)}`);
      setPickupAddress("");
      setDropoffAddress("");
      setLocation("/rides");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création de la course");
    },
  });

  const handleRequestRide = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupAddress || !dropoffAddress) {
      toast.error("Veuillez entrer les adresses de départ et d'arrivée");
      return;
    }

    requestRideMutation.mutate({
      vehicleType,
      pickupLocation: {
        address: pickupAddress,
        lat: -26.1076,
        lng: 28.0567,
      },
      dropoffLocation: {
        address: dropoffAddress,
        lat: -26.1149,
        lng: 28.0829,
      },
      paymentMethod: "card",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bienvenue sur Joy Drive</CardTitle>
            <CardDescription>Réservez une course en quelques clics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              Connectez-vous pour commencer à réserver des courses
            </p>
            <Button className="w-full" onClick={() => setLocation("/login")}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Joy Drive</h1>
            <p className="text-sm text-gray-600">Bienvenue, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-gray-500">Passager</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                setLocation("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Réserver une course</CardTitle>
                <CardDescription>Entrez vos adresses de départ et d'arrivée</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestRide} className="space-y-6">
                  {/* Pickup Location */}
                  <div className="space-y-2">
                    <Label htmlFor="pickup">Lieu de départ</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <Input
                        id="pickup"
                        placeholder="Entrez votre adresse de départ"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div className="space-y-2">
                    <Label htmlFor="dropoff">Lieu d'arrivée</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <Input
                        id="dropoff"
                        placeholder="Entrez votre adresse d'arrivée"
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Vehicle Type Selection */}
                  <div className="space-y-3">
                    <Label>Type de véhicule</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Lite", "Drive", "VIP"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setVehicleType(type)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            vehicleType === type
                              ? "border-indigo-600 bg-indigo-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="font-medium text-sm">{type}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {type === "Lite" && "Économique"}
                            {type === "Drive" && "Confort"}
                            {type === "VIP" && "Premium"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={requestRideMutation.isPending}
                  >
                    {requestRideMutation.isPending ? "Création en cours..." : "Réserver une course"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Stats */}
          <div className="space-y-4">
            {/* Joy AI */}
            <JoyAI onCommandReceived={(command) => {
              if (command === "view_rides") {
                setLocation("/rides");
              } else if (command === "book_ride") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }} />

            {/* Current Ride Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course actuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Aucune course en cours</p>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setLocation("/rides")}
                  >
                    Voir mes courses
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Types Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nos services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Lite</p>
                    <p className="text-xs text-gray-600">À partir de R5</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Drive</p>
                    <p className="text-xs text-gray-600">À partir de R9</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">VIP</p>
                    <p className="text-xs text-gray-600">À partir de R22</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avantages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Réservation rapide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Chauffeurs notés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>Support 24/7</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
