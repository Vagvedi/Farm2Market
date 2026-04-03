"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingCart, User as UserIcon, LogOut, Package, Leaf } from "lucide-react";
import api from "@/lib/axios";

export default function DashboardLayout({ children, role }: { children: React.ReactNode; role: "ADMIN" | "FARMER" | "BUYER" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Auth Check
    api.get("/users/me")
      .then(res => {
        if (res.data.role !== role && role !== "ADMIN") {
          router.push(`/dashboard/${res.data.role.toLowerCase()}`);
        }
        setUser(res.data);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router, role]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/");
  };

  const getNavItems = () => {
    if (role === "FARMER") {
      return [
        { name: "My Farm", href: "/dashboard/farmer", icon: <LayoutDashboard size={20} /> },
        { name: "My Crops", href: "/dashboard/farmer/crops", icon: <Leaf size={20} /> },
        { name: "Orders", href: "/dashboard/farmer/orders", icon: <Package size={20} /> },
      ];
    } else if (role === "BUYER") {
      return [
        { name: "Marketplace", href: "/dashboard/buyer", icon: <LayoutDashboard size={20} /> },
        { name: "My Orders", href: "/dashboard/buyer/orders", icon: <Package size={20} /> },
      ];
    } else {
      return [
        { name: "Overview", href: "/dashboard/admin", icon: <LayoutDashboard size={20} /> },
        { name: "Users", href: "/dashboard/admin/users", icon: <UserIcon size={20} /> },
      ];
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 glass-panel border-r border-border h-screen sticky top-0 flex flex-col pt-6 pb-4">
        <div className="px-6 pb-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
           <Leaf className="text-primary w-6 h-6" />
           <span className="text-xl font-bold tracking-tight text-foreground">Farm<span className="text-primary">2</span>Market</span>
          </Link>
          <div className="mt-4 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full w-fit">
            {role} PORTAL
          </div>
        </div>
        
        <nav className="flex-1 px-4 pt-6 space-y-2">
          {getNavItems().map(item => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-primary text-white shadow-primary/20 shadow-md' : 'text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 border-t border-border/50 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.email}</p>
              <p className="text-xs text-foreground/50 truncate">Premium Account</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 w-full p-3 rounded-xl font-medium transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full p-8 lg:p-12 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
