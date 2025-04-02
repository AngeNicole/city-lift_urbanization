import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import Layout from "@/components/ui/layout";
import { BASE_URL } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const ListVehicles = () => {
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data: vehicles = [], isLoading, refetch } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.filter((u) => u.role === "DRIVER");
    },
  });

  const assignVehicleMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/vehicles/${selectedVehicle.id}/assign`,
        { userId: selectedDriver },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success("Vehicle assigned!");
      refetch();
      setIsDialogOpen(false);
      setSelectedDriver("");
      setSelectedVehicle(null);
    },
    onError: () => {
      toast.error("Assignment failed.");
    },
  });

  const filteredVehicles = vehicles?.filter((vehicle) =>
    vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusVariant = (status) => {
    switch (status) {
      case "AVAILABLE": return "success";
      case "IN_USE": return "pending";
      case "MAINTENANCE": return "danger";
      default: return "secondary";
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold text-primary">Vehicles</h1>
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/add-vehicle")}>Add Vehicle</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading vehicles...</p>
        ) : filteredVehicles?.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4">
              <CardHeader>
                <CardTitle className="text-xl">{vehicle.name} ({vehicle.type})</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Plate: <span className="font-mono">{vehicle.plateNumber}</span></p>
                <div className="flex items-center justify-between">
                    <Badge variant={vehicle.userId ? "pending" : "success"}>
                    {vehicle.userId ? "Assigned" : "Available"}
                    </Badge>
                  {!vehicle.userId && (
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setIsDialogOpen(true);
                      }}
                    >
                      Assign to Driver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No vehicles found.</p>
        )}
      </div>

      {/* Separate Dialog outside of card loop */}
      {selectedVehicle && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogTitle>Assign Vehicle</DialogTitle>
            <div className="space-y-4 mt-4">
              <Label>Select Driver</Label>
              <Select onValueChange={(val) => setSelectedDriver(val)}>
                <SelectTrigger>{drivers.find((driver) => driver.id === selectedDriver)?.name || "Select a driver"}</SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-4">
              <Button
                onClick={() => assignVehicleMutation.mutate()}
                disabled={!selectedDriver || assignVehicleMutation.isPending}
              >
                {assignVehicleMutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default ListVehicles;
