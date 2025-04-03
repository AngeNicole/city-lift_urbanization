import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, User, Shield, CreditCard } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Layout from "@/components/ui/layout";
import toast from "react-hot-toast";
import { BASE_URL } from "@/lib/utils";


const Settings = () => {
  const queryClient = useQueryClient();
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });

  // Fetch user profile data
  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);


  // Update user profile mutation
  const updateProfileMutation = useMutation<void, unknown, { name: string; email: string; phone: string }>({
    mutationFn: async (updatedData) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${BASE_URL}/users/${user.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      setUserData(variables);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update profile. Please try again.");
    },
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(userData);
  };

  return (
    <Layout>
        <h1 className="text-3xl font-heading font-bold text-primary mb-6">Settings</h1>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} />
                    </div>
                  </div>
                    {user.driveRequest && (
                      <div
                      className={`p-4 rounded-md ${
                        user.role === "USER"
                        ? "bg-yellow-100 border-l-4 border-yellow-500"
                        : "bg-green-100 border-l-4 border-green-500"
                      }`}
                      >
                      <p
                        className={`text-sm ${
                        user.role === "USER"
                          ? "text-yellow-700"
                          : "text-green-700"
                        }`}
                      >
                        {user.role === "USER"
                        ? "Your driver request is pending approval."
                        : "Your driver request has been confirmed."}
                      </p>
                      </div>
                    )}
                  
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </Layout>
  );
};

export default Settings;
