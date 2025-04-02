import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { BASE_URL } from "@/lib/utils";

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["userProfile"], // Must be an array
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });
  
  useEffect(() => {
    if (data) {
      setUser(data); // Set user state after data is fetched
    }
  }, [data]);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* TODO: apply z-index here in mobile view */}
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar loading = {isLoading} user={user}/>
          <main className="flex-1 p-6 space-y-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;