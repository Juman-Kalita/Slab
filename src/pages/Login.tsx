import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HardHat } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Try admin / admin123");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <HardHat className="h-8 w-8 text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">SlabRent Pro</CardTitle>
          <CardDescription>Construction Material Rental Management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
