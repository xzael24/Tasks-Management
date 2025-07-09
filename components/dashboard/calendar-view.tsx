"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react"
import { useTask } from "@/lib/task-context"
import { TaskModal } from "./task-modal"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Timestamp } from "firebase/firestore"

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export function CalendarView() {
  const { tasks, lists, updateTask } = useTask()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterPriority, setFilterPriority] = useState<string>("all")

  const defaultLists = [
    { id: "personal", name: "Personal", color: "#3B82F6" },
    { id: "work", name: "Work", color: "#10B981" },
    { id: "shopping", name: "Shopping", color: "#F59E0B" },
  ]

  const allLists = [...defaultLists, ...lists]

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate])

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks
      .filter((task) => {
        if (!task.dueDate) return false
        const taskDate = task.dueDate.toDate()
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        )
      })
      .filter((task) => {
        if (filterPriority === "all") return true
        return task.priority === filterPriority
      })
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    // If dropped in the same position
    if (destination.droppableId === source.droppableId) return

    const task = tasks.find((t) => t.id === draggableId)
    if (!task) return

    // Parse the date from droppableId (format: "calendar-YYYY-MM-DD")
    const dateStr = destination.droppableId.replace("calendar-", "")
    const newDate = new Date(dateStr)

    // Update task due date
    await updateTask(task.id, {
      dueDate: Timestamp.fromDate(newDate),
    })
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-400"
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const formatDateForDroppable = (date: Date) => {
    return `calendar-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kalender</h1>
            <p className="text-gray-600 dark:text-gray-400">Lihat dan kelola tugas berdasarkan tanggal</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="all">Semua Prioritas</option>
                <option value="high">Prioritas Tinggi</option>
                <option value="medium">Prioritas Sedang</option>
                <option value="low">Prioritas Rendah</option>
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tugas
            </button>
          </div>
        </div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                Hari Ini
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {DAYS.map((day) => (
              <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dayTasks = getTasksForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)
              const droppableId = formatDateForDroppable(date)

              return (
                <Droppable key={index} droppableId={droppableId}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !isCurrentMonthDay ? "bg-gray-50 dark:bg-gray-800/50" : ""
                      } ${snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      onClick={() => handleDateClick(date)}
                    >
                      <div
                        className={`text-sm font-medium mb-2 ${
                          isTodayDate
                            ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                            : isCurrentMonthDay
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task, taskIndex) => (
                          <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`text-xs p-1 rounded truncate cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging ? "shadow-lg z-50" : ""
                                } ${
                                  task.completed
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-500 line-through"
                                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                }`}
                                title={task.title}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                  <span className="truncate">{task.title}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {dayTasks.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            +{dayTasks.length - 3} lagi
                          </div>
                        )}
                      </div>
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              )
            })}
          </div>
        </motion.div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedDate(null)
          }}
          lists={allLists}
          defaultDate={selectedDate}
        />
      </div>
    </DragDropContext>
  )
}
