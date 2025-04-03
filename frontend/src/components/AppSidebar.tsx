
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Home, MapPin, Calendar, CreditCard, Settings, User, CarFront } from "lucide-react";
import { Link } from "react-router-dom";


const navigationItems = [
  { title: "Dashboard", icon: Home, url: "/", roles: ["admin", "driver", "user"] },
  { title: "Find Ride", icon: MapPin, url: "/find", roles: ["user"] },
  { title: "My rides", icon: Calendar, url: "/rides", roles: ["driver", "user"] },
  { title: "Activate Vehicle", icon: CarFront, url: "/activate-vehicle", roles: ["driver"] },
  { title: "Payments", icon: CreditCard, url: "/payments", roles: ["user"] },
  { title: "Users", icon: User, url: "/users", roles: ["admin"] },
  { title: "Settings", icon: Settings, url: "/settings", roles: ["admin", "driver", "user"] },
];


export function AppSidebar() {

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
  const userRole = (userProfile as {role:string} )?.role

const filteredNavigationItems = navigationItems.filter((item) => item.roles.includes(userRole?.toLowerCase()));

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="text-lg font-heading">CityLift Connect</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <br />
              {filteredNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={window.location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-4 py-2 cursor-pointer">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
