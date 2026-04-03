"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Plus, Tag, TrendingUp, Package, Leaf } from "lucide-react";

export default function FarmerDashboard() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/crops/my-crops").then(res => {
      setCrops(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout role="FARMER">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Farm Overview</h1>
          <p className="text-foreground/60 mt-1">Manage your active listings and track revenue.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Crop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
             <Package className="text-primary w-6 h-6" />
           </div>
           <div>
             <p className="text-sm text-foreground/60 font-medium">Active Listings</p>
             <h3 className="text-2xl font-bold">{crops.length}</h3>
           </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
             <Tag className="text-blue-500 w-6 h-6" />
           </div>
           <div>
             <p className="text-sm text-foreground/60 font-medium">Active Bids</p>
             <h3 className="text-2xl font-bold">--</h3>
           </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
             <TrendingUp className="text-emerald-500 w-6 h-6" />
           </div>
           <div>
             <p className="text-sm text-foreground/60 font-medium">Monthly Revenue</p>
             <h3 className="text-2xl font-bold">$0.00</h3>
           </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-border">
        <div className="px-6 py-4 border-b border-border/50 bg-background/50">
          <h2 className="text-lg font-bold">Your Crop Inventory</h2>
        </div>
        <div className="p-0">
          {loading ? (
             <div className="p-8 flex justify-center">
               <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
             </div>
          ) : crops.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
               <Leaf className="w-12 h-12 text-foreground/20 mb-4" />
               <h3 className="text-lg font-semibold text-foreground/60 mb-2">No crops listed yet</h3>
               <p className="text-sm text-foreground/50 max-w-sm mb-6">Start building your farm's inventory to attract buyers from across the region.</p>
               <button className="btn-secondary">Add Your First Crop</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/20 text-foreground/70 text-sm">
                  <th className="px-6 py-3 font-semibold pb-4 pt-4 border-b border-border/30">CROP NAME</th>
                  <th className="px-6 py-3 font-semibold pb-4 pt-4 border-b border-border/30">PRICE</th>
                  <th className="px-6 py-3 font-semibold pb-4 pt-4 border-b border-border/30">STOCK</th>
                  <th className="px-6 py-3 font-semibold pb-4 pt-4 border-b border-border/30 shrink-0 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {crops.map((crop: any) => (
                  <tr key={crop.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{crop.name}</td>
                    <td className="px-6 py-4 text-emerald-500 font-bold">${crop.price}</td>
                    <td className="px-6 py-4">{crop.quantity} {crop.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
