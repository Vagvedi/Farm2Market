"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Leaf } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        email,
        password,
        role,
      });

      // Auto login after reg
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      
      const res = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      if (role === "ADMIN") router.push("/dashboard/admin");
      else if (role === "FARMER") router.push("/dashboard/farmer");
      else router.push("/dashboard/buyer");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl">
        <div className="flex flex-col items-center mb-8">
          <Leaf className="w-12 h-12 text-primary mb-2" />
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="text-foreground/60 mt-1">Join the Farm2Market ecosystem</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 ml-1 text-foreground/80">I want to</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("BUYER")}
                className={`w-full py-2 rounded-lg border text-sm font-semibold transition-all ${role === "BUYER" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5"}`}
              >
                Buy Crops
              </button>
              <button
                type="button"
                onClick={() => setRole("FARMER")}
                className={`w-full py-2 rounded-lg border text-sm font-semibold transition-all ${role === "FARMER" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5"}`}
              >
                Sell Crops
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 ml-1 mt-2 text-foreground/80">Email</label>
            <input 
              type="email" 
              required 
              className="input-field" 
              placeholder="name@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 ml-1 text-foreground/80">Password</label>
            <input 
              type="password" 
              required 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3 mt-6 text-center flex justify-center items-center h-12"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Join Now"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-foreground/60">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
