"use client";
import { motion } from "framer-motion";
import { BoltIcon, ShieldCheckIcon, CursorArrowRaysIcon } from "@heroicons/react/24/outline";

const features = [
  {
    title: "Instant Booking",
    description: "Secure your arena in seconds with our lightning-fast booking engine.",
    icon: <BoltIcon className="w-8 h-8 text-amber-400" />,
    colSpan: "md:col-span-2",
    bgClass: "bg-slate-900/50 hover:bg-slate-800/80",
    borderClass: "border-amber-500/20 hover:border-amber-500/40",
  },
  {
    title: "Verified Venues",
    description: "Every arena is strictly vetted for quality and safety.",
    icon: <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />,
    colSpan: "md:col-span-1",
    bgClass: "bg-emerald-950/20 hover:bg-emerald-900/30",
    borderClass: "border-emerald-500/20 hover:border-emerald-500/40",
  },
  {
    title: "Frictionless UI",
    description: "A premium interface designed for athletes, by athletes.",
    icon: <CursorArrowRaysIcon className="w-8 h-8 text-blue-400" />,
    colSpan: "md:col-span-3",
    bgClass: "bg-gradient-to-br from-slate-900/80 to-slate-950",
    borderClass: "border-white/10 hover:border-white/20",
  }
];

export default function AboutSection() {
  return (
    <section id="about" className="relative py-24 px-6 overflow-hidden bg-[#020617]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              The Experience
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 font-outfit tracking-tight">
              Unmatched <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Performance</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed font-medium">
              We bridge the gap between passion and performance, offering seamless access to the city&apos;s most exclusive sports venues.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`group relative p-8 rounded-[2rem] border backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden ${feature.colSpan} ${feature.bgClass} ${feature.borderClass}`}
            >
              {/* Hover Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-8 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-outfit tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
