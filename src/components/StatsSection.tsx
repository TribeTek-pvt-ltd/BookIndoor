"use client";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const stats = [
  { label: "Active Users", value: 12000 },
  { label: "Grounds Listed", value: 250 },
  { label: "Bookings Completed", value: 30000 },
];

export default function StatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section
      ref={ref}
      className="py-20 px-8 bg-green-800/40 text-center"
    >
      <h2 className="text-3xl font-bold mb-10 text-green-100">Our Community</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="p-6 bg-white/10 rounded-2xl border border-green-700/40 shadow-lg"
          >
            <h3 className="text-4xl font-extrabold text-white mb-2">
              {inView ? (
                <CountUp
                  start={0}
                  end={stat.value}
                  duration={2.5}
                  separator=","
                  suffix={stat.label.includes("Users") || stat.label.includes("Bookings") ? "+" : ""}
                />
              ) : (
                0
              )}
            </h3>
            <p className="text-green-200 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
