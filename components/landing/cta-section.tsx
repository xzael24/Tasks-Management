"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="relative z-10 px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Organized?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have transformed their productivity with TaskFlow. Start your journey today -
            it's completely free!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg font-semibold"
            >
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm opacity-90">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Free forever plan
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Setup in 2 minutes
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
