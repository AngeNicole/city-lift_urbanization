import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/ui/layout";
import { useQuery } from "@tanstack/react-query";
import { MapPin, CreditCard, User, Settings, Car, CarFront } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";

const navigationItems = [
  { title: "Find Ride", icon: MapPin, url: "/find", roles: ["user"] },
  { title: "My Rides", icon: CarFront, url: "/rides", roles: ["driver", "user"] },
  { title: "Activate Vehicle", icon: CarFront, url: "/activate-vehicle", roles: ["driver"] },
  { title: "Vehicles", icon: Car, url: "/vehicles", roles: ["admin"] },
  { title: "Payments", icon: CreditCard, url: "/payments", roles: ["user"] },
  { title: "Users", icon: User, url: "/users", roles: ["admin"] },
  { title: "Settings", icon: Settings, url: "/settings", roles: ["admin", "driver", "user"] },
];

const Index = () => {
  const { data:userProfile } = useQuery({
    queryKey: ["userProfile"], // Must be an array
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });
  const userRole = (userProfile as { role: string })?.role?.toLowerCase();

  const filteredNavigationItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );


  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-heading font-bold text-primary">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Manage and monitor CityLift Connect</p>

        {/* Admin Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNavigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.url} className="p-6 hover-card">
                <Icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-heading font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {`Access ${item.title.toLowerCase()}`}
                </p>
                <Button className="w-full" asChild>
                  <Link to={item.url}>Go</Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
