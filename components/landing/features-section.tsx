"use client"

import { motion } from "framer-motion"
import { CheckSquare, Users, Palette, Smartphone, Zap, Shield, Calendar, Bell } from "lucide-react"

const features = [
  {
    icon: CheckSquare,
    title: "Manajemen Tugas Pintar",
    description: "Atur tugas dengan prioritas, kategori, dan tenggat waktu. Drag and drop untuk mengurutkan dengan mudah.",
  },
  {
    icon: Users,
    title: "Kolaborasi Tim",
    description: "Undang anggota tim ke daftar, tetapkan tugas, dan bekerja sama secara real-time.",
  },
  {
    icon: Palette,
    title: "Desain Menarik",
    description: "Tampilan modern dan bersih dengan mode gelap/terang dan tema yang bisa disesuaikan.",
  },
  {
    icon: Smartphone,
    title: "Responsif di Semua Perangkat",
    description: "Berjalan sempurna di desktop, tablet, maupun ponsel.",
  },
  {
    icon: Zap,
    title: "Sinkronisasi Real-time",
    description: "Perubahan tersinkron otomatis di semua perangkat dan anggota tim Anda.",
  },
  {
    icon: Shield,
    title: "Aman & Privat",
    description: "Data Anda terenkripsi dan aman dengan autentikasi Firebase.",
  },
  {
    icon: Calendar,
    title: "Pantau Tenggat Waktu",
    description: "Tidak pernah ketinggalan deadline dengan pengingat cerdas dan integrasi kalender.",
  },
  {
    icon: Bell,
    title: "Notifikasi Cerdas",
    description: "Dapatkan notifikasi untuk update penting, deadline, dan aktivitas tim.",
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
            Semua yang Kamu Butuhkan untuk Tetap Produktif
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            TaskFlow menggabungkan fitur canggih dengan desain indah agar kamu dan tim bisa menyelesaikan lebih banyak setiap hari.
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
