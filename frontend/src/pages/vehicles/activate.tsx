import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "@/components/ui/layout";
import GoogleMapReact from "google-map-react";
import { BASE_URL } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ActivateVehicle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleId: "",
    latitude: -1.9501,
    longitude: 30.0588,
    locationQuery: "",
  });

  const queryClient = useQueryClient();
  const { data: myVehicle } = useQuery({
    queryKey: ["myVehicles"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
    const { id: userId } = queryClient.getQueryData<{ id: string }>(["userProfile"]) || {};
    if (!userId) {
    throw new Error("User ID not found in userProfile query.");
    }
    const res = await axios.get(`${BASE_URL}/vehicles/assigned-me/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
      return res.data
    },
  });

  const activateDriverMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/vehicles/driver/activate`,
        {
          vehicleId: myVehicle.id,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("You're now active with your vehicle!");
      navigate("/");
    },
    onError: () => {
      toast.error("Activation failed. Try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    activateDriverMutation.mutate();
  };

  const handleMapClick = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleLocationSearch = async () => {
    if (!formData.locationQuery) return;
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.locationQuery)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      } else {
        toast.error("Location not found.");
      }
    } catch (error) {
      toast.error("Error fetching location.");
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-heading font-bold text-primary">Activate Vehicle</h1>
          <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Set Your Active Location</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
              <div>
                    <Label htmlFor="vehicle">Assigned Vehicle</Label>
                    <Select disabled>
                        <SelectTrigger id="vehicle">
                        {myVehicle ? `${myVehicle.name} — ${myVehicle.plateNumber} (${myVehicle.user?.name})` : "No vehicle assigned"}
                        </SelectTrigger>
                    </Select>
                    </div>


                <div>
                  <Label>Location</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search location..."
                      value={formData.locationQuery}
                      onChange={(e) => setFormData({ ...formData, locationQuery: e.target.value })}
                    />
                    <Button onClick={handleLocationSearch} type="button">Search</Button>
                  </div>
                  <div className="h-64 w-full rounded-md overflow-hidden mt-2">
                    <GoogleMapReact
                      bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
                      center={{ lat: formData.latitude, lng: formData.longitude }}
                      zoom={14}
                      onClick={handleMapClick}
                    />
                  </div>
                  {formData.latitude && formData.longitude && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected Location: {formData.latitude}, {formData.longitude}
                    </p>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={activateDriverMutation.isPending}>
                {activateDriverMutation.isPending ? "Activating..." : "Activate Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ActivateVehicle;
