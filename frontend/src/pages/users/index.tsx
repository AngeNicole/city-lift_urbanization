import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import Layout from "@/components/ui/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BASE_URL } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { ArrowDownUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AllUsers = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSortedByDate, setIsSortedByDate] = useState(false);

    const handleSortByDate = () => {
        setIsSortedByDate(!isSortedByDate);
        users.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return isSortedByDate ? dateA - dateB : dateB - dateA;
        });
    };

    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    const { data: users = [], isLoading } = useQuery({
        queryKey: ["allUsers"],
        queryFn: async () => {
            const res = await axios.get(`${BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
    });

    const promoteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axios.put(`${BASE_URL}/users/${userId}`, {
                role: "DRIVER"
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            toast.success("User promoted to DRIVER");
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
            setSelectedUser(null);
        },
        onError: () => toast.error("Failed to promote user"),
    });

    const revokeMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axios.put(`${BASE_URL}/users/${userId}`, {
                role: "USER"
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            toast.success("User demoted to USER");
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        },
        onError: () => toast.error("Failed to demote user"),
    });

    const filtered = users.filter(
        (u: any) =>
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-heading font-bold text-primary">All Users</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={handleSortByDate}>
                            <ArrowDownUp className="h-4 w-4" />
                            Sort by Date
                        </Button>
                        <Input
                            placeholder="Search by name or email"
                            className="w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <p>Loading users...</p>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map((user: any) => (
                            <div
                                key={user.id}
                                className="flex justify-between items-center border p-4 rounded-md"
                            >
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <Badge variant={user.role === "DRIVER" ? "default" : "outline"}>
                                        {user.role}
                                    </Badge>
                                </div>
                                {user.driveRequest && user.role !== "DRIVER" ? (
                                    <Button onClick={() => setSelectedUser(user)} variant="outline">
                                        Make Driver
                                    </Button>
                                ) : user.role === "DRIVER" ? (
                                    <Button
                                        onClick={() => revokeMutation.mutate(user.id)}
                                        variant="outline"
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                        Demote to User
                                    </Button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}

            {selectedUser && (
                <Dialog open onOpenChange={() => setSelectedUser(null)}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Promote {selectedUser.name} to DRIVER?</DialogTitle>
                        </DialogHeader>
                        <Button
                            onClick={() => promoteMutation.mutate(selectedUser.id)}
                            className="w-full mt-4"
                        >
                            Confirm
                        </Button>
                    </DialogContent>
                </Dialog>
            )}
        </Layout>
    );
};

export default AllUsers;
