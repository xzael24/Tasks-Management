"use client"

import { motion } from "framer-motion"
import { CheckSquare, Users, Palette, Smartphone, Zap, Shield, Calendar, Bell } from "lucide-react"

const features = [
  {
    icon: CheckSquare,
    title: "Smart Task Management",
    description: "Organize tasks with priorities, categories, and due dates. Drag and drop to reorder effortlessly.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members to lists, assign tasks, and work together in real-time.",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description: "Clean, modern interface with dark/light mode and customizable themes.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Works perfectly on all devices - desktop, tablet, and mobile.",
  },
  {
    icon: Zap,
    title: "Real-time Sync",
    description: "Changes sync instantly across all your devices and team members.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and secure with Firebase authentication.",
  },
  {
    icon: Calendar,
    title: "Due Date Tracking",
    description: "Never miss a deadline with smart due date reminders and calendar integration.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get notified about important updates, deadlines, and team activities.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 px-4 py-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need to Stay Productive
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            TaskFlow combines powerful features with beautiful design to help you and your team accomplish more every
            day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all"
            >
              <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
