import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Calendar, Clock } from "lucide-react";
import Layout from "@/components/ui/layout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const Rides = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRide, setSelectedRide] = useState(null);


  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const { data: rides, isLoading } = useQuery({
    queryKey: ["myRides", userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      try {
        const res = await axios.get(`${BASE_URL}/rides/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Only show current user's bookings
        return res.data
      } catch (error) {
        toast.error("Failed to fetch rides");
        return [];
      }
    },
  });

  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await axios.put(
        `${BASE_URL}/rides/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      toast.success("Ride status updated");
      queryClient.invalidateQueries({ queryKey: ["myRides"] });
      setSelectedRide(null);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  return (
    <Layout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-heading font-bold text-primary">My Rides</h1>
          {
             userProfile?.role === "USER" && (
              <Button onClick={()=> navigate("/find")}>Book New Ride</Button>
             )
          }
          
        </div>
        {isLoading ? (
          <p>Loading rides...</p>
        ) : rides && rides.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride: any) => {
              const rideDate = new Date(ride.startTime);
              return (
                <Card key={ride.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                       <div>
                       <CardTitle className="capitalize text-xl">
                        {ride?.vehicle?.type.replace("_", " ")} - {ride?.vehicle?.name}
                        </CardTitle>
                        <p>{ride?.vehicle?.plateNumber}</p>
                       </div>
                        <Badge variant={ride.status === "COMPLETED" ? "success" : ride.status === "CANCELLED" ? "danger" : "pending"}>
                        {ride.status}
                        </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 opacity-70" />
                        <span>{rideDate.toLocaleDateString()}</span>
                        <Clock className="ml-3 mr-2 h-4 w-4 opacity-70" />
                        <span>{rideDate.toLocaleTimeString()}</span>
                      </div>
                      <div className="grid grid-cols-[25px_1fr] items-start">
                        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">From</p>
                          <p className="text-sm text-muted-foreground">
                            {ride.startLocation}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-[25px_1fr] items-start">
                        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-rose-500" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">To</p>
                          <p className="text-sm text-muted-foreground">
                            {ride.endLocation}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Booked by: <span className="font-medium">{userProfile.name}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Badge variant="outline"><div className="font-medium">${ride.fare.toFixed(2)}</div></Badge>
                    {
                    userProfile?.role === "DRIVER" && (
                    <Button size="sm" onClick={() => setSelectedRide(ride)}>
                      Manage Ride
                    </Button>
                  )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <p>No rides found.</p>
        )}

{selectedRide && (
  <Dialog open onOpenChange={() => setSelectedRide(null)}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Update Ride Status</DialogTitle>
      </DialogHeader>

      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Change status of ride
        </p>
        {/* 1) Local state for status */}
        <Select
          onValueChange={(value) => setSelectedStatus(value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select new status" />
          </SelectTrigger>
          <SelectContent>
            {["ACTIVE", "COMPLETED", "CANCELLED"]
              .filter((status) => status !== selectedRide.status)
              .map((status) => (
          <SelectItem key={status} value={status.toUpperCase()}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2) Save button in the footer */}
      <DialogFooter>
        <Button
          onClick={() => {
            if (!selectedStatus) {
              toast.error("Please select a status first");
              return;
            }
            // Call the mutation
            updateStatus.mutate({ id: selectedRide.id, status: selectedStatus });
          }}
        >
          Save
        </Button>
        <Button variant="outline" onClick={() => setSelectedRide(null)}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
    </Layout>
  );
};

export default Rides;
