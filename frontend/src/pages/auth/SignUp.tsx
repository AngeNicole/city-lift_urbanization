import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Loader2, Eye, EyeOff, User, Phone } from "lucide-react";
import axios from "axios";
import { Link, useNavigate} from "react-router-dom";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SignUp = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [driveRequest, setDriveRequest] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name,
        email,
        phone: phone || undefined,
        driveRequest,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast.success("Account created successfully!");
      navigate("/")
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading">Create Account</CardTitle>
          <CardDescription>Fill in your details to create an account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-">
            <div className="space-y-4">
              <div className="flex items-center border pr-2 rounded-md">
                <Input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required 
                  className="flex-1 border-none focus:ring-0"
                />
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center border pr-2 rounded-md">
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="flex-1 border-none focus:ring-0"
                />
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center border pr-2 rounded-md">
                <Input 
                  type="number" 
                  minLength={10}
                  maxLength={10}
                  onInput={(e) => {
                    if (e.currentTarget.value.length > 10) {
                      e.currentTarget.value = e.currentTarget.value.slice(0, 10);
                    }
                  }}
                  placeholder="Phone Number (Optional)" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 border-none focus:ring-0"
                />
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center border pr-2 rounded-md">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="flex-1 border-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center border pr-2 rounded-md">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  className="flex-1 border-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id="driveRequest"
                  checked={driveRequest}
                  onChange={(e) => setDriveRequest(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="driveRequest" className="text-sm text-muted-foreground">
                  Request to be a driver
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
            </div>
          </form>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/sign-in">Already have an account? Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;