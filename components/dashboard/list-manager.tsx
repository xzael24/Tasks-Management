"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit, Trash2, X, Check, Search, Filter, Palette } from "lucide-react"
import { useTask } from "@/lib/task-context"
import type { TaskList } from "@/types"
import toast from "react-hot-toast"

const predefinedColors = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#A855F7", // Violet
  "#14B8A6", // Teal
  "#6B7280", // Gray
  "#1F2937", // Dark Gray
  "#DC2626", // Dark Red
]

interface ListManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function ListManager({ isOpen, onClose }: ListManagerProps) {
  const { lists, defaultLists, addList, updateList, deleteList, tasks } = useTask()
  const [editingList, setEditingList] = useState<TaskList | null>(null)
  const [newListName, setNewListName] = useState("")
  const [newListColor, setNewListColor] = useState(predefinedColors[0])
  const [newListDescription, setNewListDescription] = useState("")
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "default" | "custom">("all")
  const [isLoading, setIsLoading] = useState(false)

  const allLists = [...defaultLists, ...lists]

  // Filter lists based on search and filter
  const filteredLists = allLists.filter((list) => {
    const matchesSearch = list.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterBy === "all" || (filterBy === "default" && list.isDefault) || (filterBy === "custom" && !list.isDefault)
    return matchesSearch && matchesFilter
  })

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name")
      return
    }

    // Check for duplicate names
    const existingList = allLists.find((list) => list.name.toLowerCase() === newListName.trim().toLowerCase())
    if (existingList) {
      toast.error("A list with this name already exists")
      return
    }

    setIsLoading(true)
    try {
      // You may need to get the userId from context, props, or session
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : ""
      await addList({
        name: newListName.trim(),
        color: newListColor,
        description: newListDescription.trim(),
        userId,
      })

      setNewListName("")
      setNewListColor(predefinedColors[0])
      setNewListDescription("")
      setShowNewListForm(false)
      toast.success("List created successfully!")
    } catch (error) {
      toast.error("Failed to create list")
      console.error("Error creating list:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateList = async (list: TaskList, name: string, color: string, description?: string) => {
    if (list.isDefault) {
      toast.error("Cannot edit default lists")
      return
    }

    if (!name.trim()) {
      toast.error("Please enter a list name")
      return
    }

    // Check for duplicate names (excluding current list)
    const existingList = allLists.find((l) => l.id !== list.id && l.name.toLowerCase() === name.trim().toLowerCase())
    if (existingList) {
      toast.error("A list with this name already exists")
      return
    }

    setIsLoading(true)
    try {
      await updateList(list.id, {
        name: name.trim(),
        color,
        description: description?.trim() || undefined,
      })
      setEditingList(null)
      toast.success("List updated successfully!")
    } catch (error) {
      toast.error("Failed to update list")
      console.error("Error updating list:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    const list = allLists.find((l) => l.id === listId)
    if (!list || list.isDefault) {
      toast.error("Cannot delete default lists")
      return
    }

    const tasksCount = tasks.filter((task) => task.listId === listId).length

    const confirmMessage =
      tasksCount > 0
        ? `This list contains ${tasksCount} task(s). They will be moved to "Personal" list. Continue?`
        : "Are you sure you want to delete this list?"

    if (!window.confirm(confirmMessage)) return

    setIsLoading(true)
    try {
      await deleteList(listId)
      toast.success("List deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete list")
      console.error("Error deleting list:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTaskCount = (listId: string) => {
    return tasks.filter((task) => task.listId === listId).length
  }

  const getPendingTaskCount = (listId: string) => {
    return tasks.filter((task) => task.listId === listId && !task.completed).length
  }

  const resetNewListForm = () => {
    setNewListName("")
    setNewListColor(predefinedColors[0])
    setNewListDescription("")
    setShowNewListForm(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Lists</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create, edit, and organize your task lists</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as "all" | "default" | "custom")}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Lists</option>
              <option value="default">Default Lists</option>
              <option value="custom">Custom Lists</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create New List */}
          <div className="mb-6">
            {!showNewListForm ? (
              <button
                onClick={() => setShowNewListForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create New List</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New List</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      List Name *
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Enter list name..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Palette className="inline h-4 w-4 mr-1" />
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewListColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                            newListColor === color
                              ? "border-gray-400 dark:border-gray-300 scale-110 ring-2 ring-blue-500"
                              : "border-gray-200 dark:border-gray-600"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Describe what this list is for..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={200}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateList}
                    disabled={!newListName.trim() || isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{isLoading ? "Creating..." : "Create List"}</span>
                  </button>
                  <button
                    onClick={resetNewListForm}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Lists */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Lists ({filteredLists.length})</h3>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            <AnimatePresence>
              {filteredLists.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? `No lists match "${searchQuery}"` : "No lists found"}
                  </p>
                </motion.div>
              ) : (
                filteredLists.map((list, index) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />

                      {editingList?.id === list.id ? (
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              defaultValue={list.name}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="List name"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  const target = e.target as HTMLInputElement
                                  const descInput = target.parentElement?.parentElement?.querySelector(
                                    "textarea",
                                  ) as HTMLTextAreaElement
                                  handleUpdateList(list, target.value, editingList.color, descInput?.value)
                                }
                              }}
                            />
                            <div className="flex space-x-1">
                              {predefinedColors.slice(0, 8).map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setEditingList({ ...editingList, color })}
                                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                                    editingList.color === color
                                      ? "border-gray-400 scale-110 ring-2 ring-blue-500"
                                      : "border-gray-200 hover:scale-105"
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <textarea
                            defaultValue={list.description || ""}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{list.name}</h4>
                            {list.isDefault && (
                              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getTaskCount(list.id)} total • {getPendingTaskCount(list.id)} pending
                            </p>
                            {list.description && (
                              <p className="text-sm text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                {list.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingList?.id === list.id ? (
                        <>
                          <button
                            onClick={() => {
                              const nameInput = document.querySelector(
                                `input[defaultValue="${list.name}"]`,
                              ) as HTMLInputElement
                              const descInput = nameInput?.parentElement?.parentElement?.querySelector(
                                "textarea",
                              ) as HTMLTextAreaElement
                              if (nameInput) {
                                handleUpdateList(list, nameInput.value, editingList.color, descInput?.value)
                              }
                            }}
                            disabled={isLoading}
                            className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingList(null)}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {!list.isDefault && (
                            <>
                              <button
                                onClick={() => setEditingList(list)}
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Edit list"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteList(list.id)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete list"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {allLists.length} total lists • {lists.length} custom • {defaultLists.length} default
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
