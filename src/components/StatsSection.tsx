"use client";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const stats = [
  { label: "Active Athletes", value: 12000, suffix: "+" },
  { label: "Elite Arenas", value: 250, suffix: "+" },
  { label: "Matches Played", value: 30000, suffix: "+" },
];

export default function StatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="relative py-20 px-6 bg-[#020617] border-t border-white/5 overflow-hidden"
    >
      {/* Subtle Background Lines for Premium Tech Vibe */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-48 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-[100%]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15, type: "spring" }}
              className="flex flex-col items-center justify-center text-center py-8 md:py-4 group"
            >
              <h3 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 font-outfit tracking-tighter flex items-center justify-center">
                {inView ? (
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={3.5}
                    separator=","
                    useEasing={true}
                  />
                ) : (
                  0
                )}
                <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">{stat.suffix}</span>
              </h3>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs sm:text-sm mt-2 group-hover:text-slate-300 transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
