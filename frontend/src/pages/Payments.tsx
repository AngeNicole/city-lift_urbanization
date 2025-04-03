import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Calendar,
  DollarSign,
  ArrowDownUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/ui/layout";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";

const Payments = () => {
  const token = localStorage.getItem("token");
  const [sortedPayments, setSortedPayments] = useState<any[]>([]);

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ["userPayments", userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/payments/user/${userProfile.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  useEffect(() => {
    if (payments) {
      setSortedPayments(payments); // default state
    }
  }, [payments]);

  const [isDescending, setIsDescending] = useState(true);

  const handleSortByDate = () => {
    const sorted = [...sortedPayments].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return isDescending ? dateB - dateA : dateA - dateB;
    });
    setSortedPayments(sorted);
    setIsDescending(!isDescending);
  };

  return (
    <Layout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-heading font-bold text-primary">Payment History</h1>
          <Button variant="outline" className="gap-2" onClick={handleSortByDate}>
            <ArrowDownUp className="h-4 w-4" />
            Sort by Date
          </Button>
        </div>

        {isLoading ? (
          <p>Loading payments...</p>
        ) : sortedPayments.length > 0 ? (
          <div className="grid gap-6">
            {sortedPayments.map((payment) => (
              <Card key={payment.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">
                      {payment.ride?.rideType || "Transport"}
                    </CardTitle>
                    <CardDescription>Invoice {payment.id}</CardDescription>
                  </div>
                  <Badge variant={payment.status === "completed" ? "secondary" : "success"}>
                    {payment.status === "Pending" ? "Pending" : "Paid"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 opacity-70" />
                      <span className="text-sm text-muted-foreground">
                        {payment.method}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/50 px-6 py-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p>No payments found.</p>
        )}
    </Layout>
  );
};

export default Payments;
