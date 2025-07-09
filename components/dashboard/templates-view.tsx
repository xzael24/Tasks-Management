"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, BookOpen, Users, Star, Copy, Trash2, Edit, Play } from "lucide-react"
import { useTemplate } from "@/lib/template-context"
import { useTask } from "@/lib/task-context"
import { TemplateModal } from "./template-modal"
import { UseTemplateModal } from "./use-template-modal"
import type { TaskTemplate } from "@/types"

const templateCategories = [
  "Semua",
  "Manajemen Proyek",
  "Pemasaran",
  "Pengembangan",
  "Desain",
  "Pembuatan Konten",
  "Perencanaan Acara",
  "Pribadi",
  "Bisnis",
  "Edukasi",
]

export function TemplatesView() {
  const { templates, publicTemplates, loading, deleteTemplate, duplicateTemplate } = useTemplate()
  const { lists } = useTask()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"my-templates" | "public-templates">("my-templates")
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isUseTemplateModalOpen, setIsUseTemplateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)

  // Ambil defaultLists dari context agar konsisten dengan semua list yang tersedia
  const { defaultLists } = useTask();
  const allLists = [...defaultLists, ...lists]

  const currentTemplates = activeTab === "my-templates" ? templates : publicTemplates

  const filteredTemplates = currentTemplates.filter((template) => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template)
    setIsTemplateModalOpen(true)
  }

  const handleUseTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template)
    setIsUseTemplateModalOpen(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate(templateId)
    }
  }

  const handleDuplicateTemplate = async (templateId: string) => {
    await duplicateTemplate(templateId)
  }

  const handleCloseTemplateModal = () => {
    setIsTemplateModalOpen(false)
    setEditingTemplate(null)
  }

  const handleCloseUseTemplateModal = () => {
    setIsUseTemplateModalOpen(false)
    setSelectedTemplate(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50 dark:bg-red-900/20"
      case "medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      case "low":
        return "text-green-500 bg-green-50 dark:bg-green-900/20"
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-800"
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Not specified"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Template Tugas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buat dan gunakan template tugas untuk alur kerja yang sering digunakan
          </p>
        </div>

        <button
          onClick={() => setIsTemplateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat Template
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("my-templates")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "my-templates"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <BookOpen className="inline h-4 w-4 mr-2" />
            Template Saya ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("public-templates")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "public-templates"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Users className="inline h-4 w-4 mr-2" />
            Template Publik ({publicTemplates.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {templateCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{template.description}</p>
              </div>

              {activeTab === "my-templates" && (
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Kategori:</span>
          <span className="font-medium text-gray-900 dark:text-white">{template.category}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Tugas:</span>
          <span className="font-medium text-gray-900 dark:text-white">{template.tasks.length}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Durasi:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatDuration(template.estimatedDuration)}
          </span>
              </div>

              {activeTab === "public-templates" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Used:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{template.usageCount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Task Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks Preview:</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {template.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).split(" ")[1]}`} />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{task.title}</span>
                  </div>
                ))}
                {template.tasks.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{template.tasks.length - 3} tugas lagi
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {template.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleUseTemplate(template)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="h-4 w-4 mr-1" />
                Gunakan Template
              </button>

              {activeTab === "public-templates" && (
                <button
                  onClick={() => handleDuplicateTemplate(template.id)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada template</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {activeTab === "my-templates"
              ? "Buat template pertamamu untuk memulai"
              : "Coba ubah pencarian atau filter kategori"}
          </p>
          {activeTab === "my-templates" && (
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Template
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={handleCloseTemplateModal}
        template={editingTemplate}
        categories={templateCategories.slice(1)} // Remove "All"
      />

      <UseTemplateModal
        isOpen={isUseTemplateModalOpen}
        onClose={handleCloseUseTemplateModal}
        template={selectedTemplate}
        lists={allLists}
      />
    </div>
  )
}
