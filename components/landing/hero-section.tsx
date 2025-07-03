"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Users, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative z-10 px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Organize Your Life with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">TaskFlow</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The modern todo app that helps you stay productive, collaborate with your team, and achieve your goals with
            beautiful design and powerful features.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-900 dark:text-white rounded-xl hover:bg-white/20 transition-all"
          >
            Learn More
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Smart Organization</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Team Collaboration</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <Zap className="h-5 w-5 text-purple-500" />
            <span>Real-time Sync</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
