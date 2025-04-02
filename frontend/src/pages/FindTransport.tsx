import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  MapPin,
  Search,
  Clock,
  ArrowRight,
  Bus,
  Bike,
  Car,
} from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import Layout from "@/components/ui/layout";
import GoogleMapReact from "google-map-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";



const FindTransport = () => {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [searchNearby, setSearchNearby] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string | null>(null);
  const [locationError, setLocationError] = useState("");
  const [locations, setLocations] = useState<Record<string, string>>({});
  const [center, setCenter] = useState({ lat: -1.9441, lng: 30.0619 });
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  // Removed duplicate declaration of nearbyVehicles

  const GEOCODING_FORWARD_API = "https://nominatim.openstreetmap.org/search?format=json&q=";
  const GEOCODING_API = "https://nominatim.openstreetmap.org/reverse?format=json";

  const { data: nearbyVehicles = [], isLoading } = useQuery<Array<{ id: string; latitude: number; longitude: number; type?: string; estimatedTime?: number }>>({
    queryKey: ["nearbyVehicles"],
    queryFn: async () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          setLocationError("Geolocation is not supported by your browser.");
          return reject("No geolocation");
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const fetchNearbyVehicles = async () => {
              try {
                const { latitude, longitude } = position.coords;
                setCenter({ lat: latitude, lng: longitude });

                const token = localStorage.getItem("token");
                const res = await axios.get(`${BASE_URL}/vehicles/driver/nearby`, {
                  headers: { Authorization: `Bearer ${token}` },
                  params: { latitude, longitude, radius: 50 },
                });
                resolve(res.data);
              } catch (error) {
                reject(error);
              }
            };

            fetchNearbyVehicles();
          },
          (error) => {
            setLocationError("Failed to get your location.");
            reject(error);
          }
        );
      });
    },
  });

  useEffect(() => {
    const fetchLocations = async () => {
      const newLocations: Record<string, string> = {};

      for (const vehicle of nearbyVehicles) {
        try {
          const response = await axios.get(`${GEOCODING_API}&lat=${vehicle.latitude}&lon=${vehicle.longitude}`);
          newLocations[vehicle.id] = response.data.display_name || "Unknown Location";
        } catch {
          newLocations[vehicle.id] = "Location not found";
        }
      }
      setLocations(newLocations);
    };

    if (nearbyVehicles.length > 0) fetchLocations();
  }, [nearbyVehicles]);


  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
  };


  const filteredVehicles = nearbyVehicles.filter((v: any) => {
    const matchesType = vehicleFilter ? v.vehicle?.type?.toLowerCase() === vehicleFilter : true;
    const matchesSearch = v.vehicle?.type?.toLowerCase().includes(searchNearby.toLowerCase());
    return matchesType && matchesSearch;
  });


  return (
    <Layout>
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold text-primary">Find Ride</h1>
        <p className="text-lg text-muted-foreground">Discover nearby ride options and plan your journey</p>
      </div>
      <Card className="mt-4">
        <CardContent className="pt-6">
          <Tabs defaultValue="nearby" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="nearby">Nearby Options</TabsTrigger>
              {/* <TabsTrigger value="search">Search Route</TabsTrigger> */}
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="from"
                      placeholder="Current location"
                      className="pl-10"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="to"
                      placeholder="Destination"
                      className="pl-10"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nearby" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for nearby transport"
                  className="pl-10"
                  value={searchNearby}
                  onChange={(e) => setSearchNearby(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-auto pb-2">
                <Button
                  variant="outline"
                  className={`rounded-full ${vehicleFilter === null ? "bg-primary text-white" : ""}`}
                  onClick={() => setVehicleFilter(null)}
                >
                  All
                </Button>
                <Button
                  variant="outline"
                  className={`rounded-full ${vehicleFilter === "e_bike" ? "bg-primary text-white" : ""}`}
                  onClick={() => setVehicleFilter("e_bike")}
                >
                  <Bike className="mr-2 h-4 w-4" /> E-Bike
                </Button>
                <Button
                  variant="outline"
                  className={`rounded-full ${vehicleFilter === "cable_car" ? "bg-primary text-white" : ""}`}
                  onClick={() => setVehicleFilter("cable_car")}
                >
                  <Car className="mr-2 h-4 w-4" /> Cable Car
                </Button>
                <Button
                  variant="outline"
                  className={`rounded-full ${vehicleFilter === "e_scooter" ? "bg-primary text-white" : ""}`}
                  onClick={() => setVehicleFilter("e_scooter")}
                >
                  <Car className="mr-2 h-4 w-4" /> E-Scooter
                </Button>
              </div>


              {locationError && <p className="text-sm text-red-500">{locationError}</p>}

              {isLoading ? (
                <p>Loading nearby vehicles...</p>
              ) : filteredVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVehicles.map((vehicle: { id: string; type: string; latitude: number; longitude: number; estimatedTime?: number }) => (
                    <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-md">{vehicle.vehicle.name + ' ('+vehicle.vehicle.type+')'}</h3>
                            <p className="text-xs text-gray-400">Driver: {vehicle.user.name}</p>
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {Math.ceil(
                                  getDistanceInKm(center.lat, center.lng, vehicle.latitude, vehicle.longitude) * 3
                                )}{" "}
                                min
                              </span>

                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <Badge variant="success">Available</Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {locations[vehicle.id] || "Fetching location..."}
                        </p>

                        {/* Mini Map */}
                        <div className="h-[150px] w-full rounded-md overflow-hidden border">
                          <GoogleMapReact
                            bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY }}
                            defaultCenter={{ lat: vehicle.latitude, lng: vehicle.longitude }}
                            defaultZoom={15}
                            options={{
                              fullscreenControl: false,
                              zoomControl: false,
                              streetViewControl: false,
                              mapTypeControl: false,
                            }}
                          >
                            <div
                              className="text-red-600 text-lg"
                            >
                              📍
                            </div>
                          </GoogleMapReact>
                        </div>
                        <Button className="w-full" onClick={() => setSelectedVehicle(vehicle)}>
                          Book Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>

                  ))}
                </div>
              ) : (
                <p>No nearby transport found.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {selectedVehicle && (
        <BookRideModal
            vehicle={{
              id: selectedVehicle.vehicleId,
              type: selectedVehicle.type
            }}
            onClose={() => setSelectedVehicle(null)}
            userId={userProfile?.id}
          />

      )}
    </Layout>
  );
};

export default FindTransport;


const BookRideModal = ({ vehicle, onClose, userId }: { vehicle: { id: string; type: string }; onClose: () => void; userId: string }) => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [fare, setFare] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  interface Ride {
    id: string;
    userId: string;
    vehicleId: string;
    rideType: string;
    startLocation: string;
    endLocation: string;
    fare: number;
  }

  const [ride, setRide] = useState<Ride | null>(null);

  const getCoordsFromAddress = async (address: string) => {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        format: "json",
        q: address,
      },
    });
    if (res.data.length === 0) throw new Error("Location not found");
    return {
      lat: parseFloat(res.data[0].lat),
      lng: parseFloat(res.data[0].lon),
    };
  };

  const toRad = (value) => (value * Math.PI) / 180;

  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  const calculateFare = async () => {
    setIsLoading(true)
    try {
      const from = await getCoordsFromAddress(startLocation);
      const to = await getCoordsFromAddress(endLocation);
      const distance = getDistanceInKm(from.lat, from.lng, to.lat, to.lng);
      setDistance(distance.toFixed(2)); // Update state to show distance
      const estimated = Math.ceil(distance * 3); // 3 min per km
      setEstimatedTime(estimated);

      const baseFares: Record<string, number> = {
        cable_car: 2.5,
        e_bike: 1.75,
        e_scooter: 1.5,
        bus: 1.25,
        shuttle: 3,
      };
      const base = baseFares[vehicle?.type?.toLowerCase()] || 2;
      const perMin = 0.2;
      const total = base + estimated * perMin;
      setFare(parseFloat(total.toFixed(2)));
    } catch (err) {
      toast.error("Failed to calculate fare. Check locations.");
    }
    setIsLoading(false)
  };

  const handleCreateRide = async () => {
    if (!startLocation || !endLocation || fare === null) {
      toast.error("Please fill in all fields and calculate fare.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/rides`,
        {
          userId,
          vehicleId: vehicle.id,
          rideType: vehicle.type,
          startLocation,
          endLocation,
          fare,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRide(res.data);
      toast.success("Ride created! Now confirm payment.");
    } catch (error) {
      console.log(       {
        userId,
        vehicleId: vehicle.id,
        startLocation,
        endLocation,
        fare,
      },)
      toast.error("Failed to create ride.");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book a {vehicle.type}</DialogTitle>
        </DialogHeader>

        {!ride ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Start Location</Label>
              <Input value={startLocation} onChange={(e) => setStartLocation(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>End Location</Label>
              <Input value={endLocation} onChange={(e) => setEndLocation(e.target.value)} required />
            </div>

            <Button variant="outline" onClick={calculateFare} className="w-full" disabled={isLoading}>
              {isLoading ? "Calculating..." : "Calculate Fare"}
            </Button>

            {fare !== null && (
                <p className="text-muted-foreground text-sm">
                Distance: {distance} km<br />
                Estimated Time: {estimatedTime && estimatedTime > 60 
                  ? `${Math.floor(estimatedTime / 60)} hr ${estimatedTime % 60} min` 
                  : `${estimatedTime} min`} <br />
                Fare: ${fare}
                </p>
            )}

            <DialogFooter>
              <Button onClick={handleCreateRide} className="w-full" disabled={fare === null}>
                Confirm Ride
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <PaymentForm ride={ride} userId={userId} onComplete={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
};


const PaymentForm = ({
  ride,
  userId,
  onComplete,
}: {
  ride: { id: string; fare: number };
  userId: string;
  onComplete: () => void;
}) => {
  const [method, setMethod] = useState("MOBILE_MONEY");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/payments`, {
        userId,
        rideId: ride.id,
        amount: ride.fare,
        method,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Payment successful! 🎉");
      queryClient.invalidateQueries({ queryKey: ["nearbyVehicles"] });
      onComplete();
    } catch (error) {
      toast.error("Payment failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">Ride Fare: ${ride.fare}</p>

      <div className="space-y-2">
        <Label htmlFor="method">Payment Method</Label>
        <select
          id="method"
          className="w-full border rounded-md px-3 py-2"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          required
        >
          <option value="MOBILE_MONEY">Mobile Money (MOMO)</option>
          <option value="BANK_CARD">Credit/Debit Card</option>
        </select>
      </div>

      <DialogFooter>
        <Button onClick={handlePayment} className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Complete Payment"}
        </Button>
      </DialogFooter>
    </div>
  );
};
