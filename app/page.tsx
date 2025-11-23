"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-royal-black p-4 text-center overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-royal-black to-royal-black opacity-80"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-prestige-gold/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="z-10 flex flex-col items-center space-y-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-playfair font-bold text-prestige-gold tracking-tight drop-shadow-lg">
            IgniteQuest
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-ivory-white/80 font-montserrat tracking-widest uppercase">
            The Ultimate Quiz Arena
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-prestige-gold to-transparent mx-auto mb-8"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link href="/quiz">
            <Button
              size="lg"
              className="text-lg px-12 py-8 rounded-full bg-prestige-gold text-royal-black hover:bg-electric-yellow hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(245,197,66,0.3)] font-bold tracking-wide"
            >
              ENTER THE ARENA
            </Button>
          </Link>
        </motion.div>
      </div>

      <footer className="absolute bottom-8 text-sm text-gray-500 font-source-sans">
        Powered by RVCE Coding Club
      </footer>
    </main>
  );
}
