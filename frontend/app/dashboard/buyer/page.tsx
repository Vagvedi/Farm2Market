"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ShoppingBag, Search, Gavel } from "lucide-react";

export default function BuyerDashboard() {
  const [marketplace, setMarketplace] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/crops").then(res => {
      setMarketplace(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout role="BUYER">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Marketplace</h1>
          <p className="text-foreground/60 mt-1">Discover premium agricultural products directly from verified farmers.</p>
        </div>
        <div className="relative w-full md:w-64 glass-panel rounded-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input 
            type="text" 
            placeholder="Search crops..." 
            className="w-full bg-transparent border-none outline-none py-2 pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
        </div>
      ) : marketplace.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-foreground/20 mb-4" />
            <h3 className="text-xl font-bold mb-2">Marketplace is empty</h3>
            <p className="text-foreground/60">No farmers have listed any crops yet. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplace.map((crop: any) => (
            <div key={crop.id} className="glass-panel rounded-2xl overflow-hidden group hover:-translate-y-2 transition-all duration-300">
              <div className="h-48 bg-black/5 dark:bg-white/5 w-full flex items-center justify-center relative overflow-hidden">
                {crop.image_url ? (
                  <img src={crop.image_url} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <ShoppingBag className="w-12 h-12 text-primary/30" />
                )}
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-500 shadow-sm">
                  ${crop.price} / {crop.unit}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-1 truncate">{crop.name}</h3>
                <p className="text-sm text-foreground/60 mb-4 line-clamp-2 min-h-[40px]">
                  {crop.description || "Fresh produce straight from the farm to your business."}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-border/50">
                  <span className="text-sm font-semibold text-foreground/70">
                    Avail: {crop.quantity}{crop.unit}
                  </span>
                  <button className="text-sm bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Gavel size={14} /> Place Bid
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
