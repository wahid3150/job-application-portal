import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Building2,
} from "lucide-react";

const Analytics = () => {
  const stats = [
    {
      icon: Users,
      label: "Active Job Seekers",
      value: "2.4M+",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Building2,
      label: "Registered Companies",
      value: "50K+",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Briefcase,
      label: "Active Job Postings",
      value: "150K+",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: TrendingUp,
      label: "Successful Placements",
      value: "500K+",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Impact by Numbers
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Trusted by millions of job seekers and thousands of companies
            worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
              <div className="relative bg-white border border-gray-200 rounded-xl p-8 hover:border-transparent transition-all duration-300">
                <div
                  className={`w-12 h-12 bg-linear-to-r ${stat.color} rounded-lg flex items-center justify-center mb-4 text-white`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">
                  {stat.label}
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Join a Community of Success
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Every day, hundreds of professionals find their dream jobs and
                companies find their perfect team members through JobPortal. Be
                part of this growing community and accelerate your career
                journey.
              </p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="shrink-0"
            >
              <BarChart3 className="w-24 h-24 text-blue-600 opacity-20" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Analytics;
