"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { EventBranding } from "@/components/shared/EventBranding";

export default function Home() {
  return (
    <main className="stage-spotlight curtain-edges min-h-screen flex flex-col justify-between p-10 md:p-16 relative overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-spotlight-amber font-montserrat text-xs tracking-[0.4em] uppercase"
      >
        RVCE Coding Club &times; RVITM Python Bootcamp
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10 items-center">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-bodoni font-bold foil-text text-6xl md:text-8xl leading-none"
        >
          Ignite
          <br />
          Quest
        </motion.h1>

        <div className="hidden md:block h-40 w-px bg-gradient-to-b from-transparent via-foil-gold to-transparent" />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-4 md:justify-self-end w-full max-w-xs"
        >
          <p className="font-montserrat text-champagne/60 text-sm tracking-widest uppercase mb-2">The Python Arena</p>
          <Link href="/register">
            <Button size="lg" className="w-full">Register Your Team</Button>
          </Link>
          <Link href="/host/login">
            <Button size="lg" variant="outline" className="w-full">Host Console</Button>
          </Link>
        </motion.div>
      </div>

      <EventBranding />
    </main>
  );
}
