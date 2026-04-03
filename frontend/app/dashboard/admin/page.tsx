"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Users, Sprout, ShoppingCart, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, crops: 0, orders: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then(res => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout role="ADMIN">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-foreground/60 mt-1">Real-time overview of the Farm2Market ecosystem performance.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="text-blue-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-foreground/60 font-medium">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.users}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Sprout className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-foreground/60 font-medium">Active Crops</p>
                <h3 className="text-2xl font-bold">{stats.crops}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="text-purple-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-foreground/60 font-medium">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.orders}</h3>
              </div>
            </div>

             <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-emerald-500/30 shadow-emerald-500/5">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <DollarSign className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-foreground/60 font-medium">Gross Merchandise Val</p>
                <h3 className="text-2xl font-bold text-emerald-500">${stats.total_revenue.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 border border-border flex items-center justify-center min-h-[300px]">
             <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Activity Monitor</h3>
                <p className="text-foreground/50 max-w-md mx-auto">Full administrative controls and detailed activity logs are rolling out in the next platform update.</p>
             </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
