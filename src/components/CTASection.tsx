"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export default function CTASection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[#020617]">
      {/* Dynamic Animated Mesh Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-emerald-500 via-teal-500/20 to-transparent rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 md:p-20 text-center shadow-[0_0_80px_rgba(16,185,129,0.1)] relative overflow-hidden"
        >
          {/* Inner card subtle glow */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/30 blur-[80px] rounded-full" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 blur-[80px] rounded-full" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 font-outfit tracking-tighter leading-[1.1]">
              Ready to <span className="text-emerald-400">Dominate</span> <br className="hidden md:block" />
              the Court?
            </h2>
            <p className="text-slate-400 mb-12 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Join the elite community of players booking the city&apos;s finest arenas.
              Your next champion moment starts with a single click.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/user"
                className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 text-lg font-black text-slate-950 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-all duration-300 active:scale-95 shadow-[0_0_40px_rgba(52,211,153,0.4)] hover:shadow-[0_0_60px_rgba(52,211,153,0.6)] overflow-hidden"
              >
                <span className="relative z-10">Secure Your Slot Now</span>
                <ArrowRightIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </Link>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-8">
              Instant Confirmation • No Hidden Fees
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
