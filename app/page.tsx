"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { EventBranding } from "@/components/shared/EventBranding";

export default function Home() {
  return (
    <main className="stage-spotlight curtain-edges flex min-h-screen flex-col items-center justify-center p-4 text-center overflow-hidden relative">
      <div className="z-10 flex flex-col items-center space-y-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-spotlight-amber font-montserrat text-sm tracking-[0.4em] uppercase mb-4">
            RVCE Coding Club &times; RVITM Python Bootcamp
          </p>
          <h1 className="text-6xl md:text-8xl font-bodoni font-bold tracking-tight foil-text">
            IgniteQuest
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-champagne/80 font-montserrat tracking-widest uppercase">
            The Python Arena
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="h-px w-40 bg-gradient-to-r from-transparent via-foil-gold to-transparent mx-auto mb-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/register">
            <Button size="lg" className="tracking-[0.15em]">
              Register Your Team
            </Button>
          </Link>
          <Link href="/host/login">
            <Button size="lg" variant="outline" className="tracking-[0.15em]">
              Host Console
            </Button>
          </Link>
        </motion.div>
      </div>

      <footer className="absolute bottom-10">
        <EventBranding />
      </footer>
    </main>
  );
}
