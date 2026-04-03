"use client";

import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full glass-panel py-4 px-8 flex justify-between items-center fixed top-0 z-50">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight text-foreground">Farm<span className="text-primary">2</span>Market</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
          <Link href="/register" className="btn-primary flex items-center gap-2">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center pt-32 pb-16 px-4 md:px-0">
        <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            The Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Agricultural Trading</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
            A premium marketplace connecting farmers directly with buyers. Transparent pricing, real-time bidding, and secure transactions.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-primary/30 shadow-2xl">
              Start Trading <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 px-4 md:px-0">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform duration-300">
            <div className="bg-primary/10 p-4 rounded-full">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Direct from Farmers</h3>
            <p className="text-foreground/60">Source premium produce directly from the source. No middlemen, better margins.</p>
          </div>
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform duration-300">
            <div className="bg-primary/10 p-4 rounded-full">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Real-time Bidding</h3>
            <p className="text-foreground/60">Dynamic market pricing ensures fair value for everyone involved.</p>
          </div>
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform duration-300">
            <div className="bg-primary/10 p-4 rounded-full">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Transactions</h3>
            <p className="text-foreground/60">End-to-end encryption and verified profiles guarantee a safe trading space.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
