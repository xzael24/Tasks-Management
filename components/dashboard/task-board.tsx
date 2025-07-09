"use client"

import { useState, useMemo } from "react"
import { Plus, Settings, Filter, Search, MoreHorizontal } from "lucide-react"
import { useTask } from "@/lib/task-context"
import { TaskCard } from "./task-card"
import { TaskModal } from "./task-modal"
import { ListManager } from "./list-manager"
import type { Task } from "@/types"
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd"
import { motion, AnimatePresence } from "framer-motion"

type SortBy = "dueDate" | "priority" | "created" | "alphabetical"
type FilterBy = "all" | "pending" | "completed" | "overdue"

export function TaskBoard() {
  const { tasks, lists, defaultLists, loading, updateTask } = useTask()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isListManagerOpen, setIsListManagerOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedListId, setSelectedListId] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortBy>("created")
  const [filterBy, setFilterBy] = useState<FilterBy>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const allLists = [...defaultLists, ...lists]

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = tasks

    // Filter by list
    if (selectedListId !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.listId === selectedListId)
    }

    // Filter by status
    switch (filterBy) {
      case "pending":
        filteredTasks = filteredTasks.filter((task) => !task.completed)
        break
      case "completed":
        filteredTasks = filteredTasks.filter((task) => task.completed)
        break
      case "overdue":
        filteredTasks = filteredTasks.filter(
          (task) => !task.completed && task.dueDate && task.dueDate.toDate() < new Date(),
        )
        break
    }

    // Filter by search query
    if (searchQuery) {
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Sort tasks
    switch (sortBy) {
      case "dueDate":
        filteredTasks.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.toDate().getTime() - b.dueDate.toDate().getTime()
        })
        break
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
        break
      case "alphabetical":
        filteredTasks.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "created":
      default:
        filteredTasks.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
        break
    }

    return filteredTasks
  }, [tasks, selectedListId, filterBy, searchQuery, sortBy])

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const task = tasks.find((t) => t.id === draggableId)
    if (!task) return

    // If dropped on a list (horizontal list at top)
    if (destination.droppableId.startsWith("list-")) {
      const newListId = destination.droppableId.replace("list-", "")
      if (newListId !== task.listId) {
        await updateTask(task.id, { listId: newListId })
      }
      return
    }

    // If reordering within the main task area
    if (destination.droppableId === "main-tasks") {
      await updateTask(task.id, { order: destination.index })
    }
  }

  const getListTaskCount = (listId: string) => {
    return tasks.filter((task) => task.listId === listId && !task.completed).length
  }

  const getListColor = (listId: string) => {
    const list = allLists.find((l) => l.id === listId)
    return list?.color || "#6B7280"
  }

  const getListName = (listId: string) => {
    const list = allLists.find((l) => l.id === listId)
    return list?.name || "Unknown"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tugas Saya</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredAndSortedTasks.length} tugas {allLists.length} daftar
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsListManagerOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Kelola Daftar</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable List Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lists</h2>
            <button
              onClick={() => setIsListManagerOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {/* All Tasks Option */}
            <button
              onClick={() => setSelectedListId("all")}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedListId === "all"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="font-medium whitespace-nowrap">Semua Tugas</span>
              <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                {tasks.filter((t) => !t.completed).length}
              </span>
            </button>

            {/* Individual Lists */}
            {allLists.map((list) => (
              <Droppable key={list.id} droppableId={`list-${list.id}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-shrink-0 ${snapshot.isDraggingOver ? "scale-105" : ""} transition-transform`}
                  >
                    <button
                      onClick={() => setSelectedListId(list.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedListId === list.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : snapshot.isDraggingOver
                            ? "border-green-400 bg-green-50 dark:bg-green-900/20 scale-105"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: list.color }} />
                      <span className="font-medium whitespace-nowrap">{list.name}</span>
                      <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {getListTaskCount(list.id)}
                      </span>
                    </button>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari tugas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Tugas</option>
                <option value="pending">Belum Selesai</option>
                <option value="completed">Selesai</option>
                <option value="overdue">Terlambat</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created">Terbaru</option>
                <option value="dueDate">Jatuh Tempo</option>
                <option value="priority">Prioritas</option>
                <option value="alphabetical">Alfabet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedListId === "all" ? "Semua Tugas" : getListName(selectedListId)}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{filteredAndSortedTasks.length} tugas</span>
                {selectedListId !== "all" && (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getListColor(selectedListId) }} />
                )}
              </div>
            </div>
          </div>

          <Droppable droppableId="main-tasks">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-6 min-h-[400px] transition-colors ${
                  snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/10" : ""
                }`}
              >
                {filteredAndSortedTasks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-gray-400 mb-6">
                      <Filter className="h-16 w-16 mx-auto mb-4" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada tugas</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {searchQuery
                        ? `Tidak ada tugas yang cocok dengan \"${searchQuery}\"`
                        : selectedListId === "all"
                          ? "Mulai dengan membuat tugas pertamamu"
                          : `Tidak ada tugas di ${getListName(selectedListId)}`}
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Tambah Tugas
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {filteredAndSortedTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TaskCard
                            task={task}
                            index={index}
                            onEdit={() => handleEditTask(task)}
                            showListInfo={selectedListId === "all"}
                            listColor={getListColor(task.listId)}
                            listName={getListName(task.listId)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <TaskModal isOpen={isModalOpen} onClose={handleCloseModal} task={editingTask} lists={allLists} />
        <ListManager isOpen={isListManagerOpen} onClose={() => setIsListManagerOpen(false)} />
      </div>
    </DragDropContext>
  )
}
