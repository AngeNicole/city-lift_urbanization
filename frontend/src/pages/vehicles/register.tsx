// src/pages/CreateVehicle.tsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "@/components/ui/layout";
import { BASE_URL } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const CreateVehicle = () => {
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState({
    name: "",
    plateNumber: "",
    type: "",
    status: "AVAILABLE",
  });

  const createVehicleMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/vehicles`, vehicleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Vehicle created successfully!");
      navigate("/vehicles");
    },
    onError: () => {
      toast.error("Failed to create vehicle.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVehicleMutation.mutate();
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-heading font-bold text-primary">Create Vehicle</h1>
          <Button onClick={() => navigate("/vehicles")}>List Vehicles</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Vehicle Name</Label>
                  <Input id="name" value={vehicleData.name} onChange={(e) => setVehicleData({ ...vehicleData, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input id="plateNumber" value={vehicleData.plateNumber} onChange={(e) => setVehicleData({ ...vehicleData, plateNumber: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select onValueChange={(value) => setVehicleData({ ...vehicleData, type: value })} required>
                    <SelectTrigger id="type">{vehicleData.type || "Select Vehicle Type"}</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CABLE_CAR">Cable Car</SelectItem>
                      <SelectItem value="E_BIKE">E-Bike</SelectItem>
                      <SelectItem value="E_SCOOTER">E-Scooter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setVehicleData({ ...vehicleData, status: value })}>
                    <SelectTrigger id="status">{vehicleData.status}</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="IN_USE">In Use</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={createVehicleMutation.isPending}>
                {createVehicleMutation.isPending ? "Creating..." : "Create Vehicle"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateVehicle;
