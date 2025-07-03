"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Flag, MoreVertical, Edit, Trash2, Check, Clock, AlertCircle } from "lucide-react"
import { Draggable } from "@hello-pangea/dnd"
import type { Task } from "@/types"
import { useTask } from "@/lib/task-context"
import toast from "react-hot-toast"

interface TaskCardProps {
  task: Task
  index: number
  onEdit: () => void
  showListInfo?: boolean
  listColor?: string
  listName?: string
}

export function TaskCard({ task, index, onEdit, showListInfo = false, listColor, listName }: TaskCardProps) {
  const { updateTask, deleteTask } = useTask()
  const [showActions, setShowActions] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      case "low":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    }
  }

  const getPriorityIcon = (priority: string) => {
    const baseClasses = "h-4 w-4"
    switch (priority) {
      case "high":
        return <Flag className={`${baseClasses} text-red-600 dark:text-red-400`} />
      case "medium":
        return <Flag className={`${baseClasses} text-yellow-600 dark:text-yellow-400`} />
      case "low":
        return <Flag className={`${baseClasses} text-green-600 dark:text-green-400`} />
      default:
        return <Flag className={`${baseClasses} text-gray-400`} />
    }
  }

  const isOverdue = task.dueDate && !task.completed && task.dueDate.toDate() < new Date()

  const handleToggleComplete = async () => {
    setIsUpdating(true)
    try {
      await updateTask(task.id, { completed: !task.completed })
      toast.success(task.completed ? "Task marked as pending" : "Task completed!")
    } catch (error) {
      toast.error("Failed to update task")
      console.error("Error updating task:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(task.id)
        toast.success("Task deleted successfully")
      } catch (error) {
        toast.error("Failed to delete task")
        console.error("Error deleting task:", error)
      }
    }
  }

  const formatDate = (date: any) => {
    if (!date) return null
    const taskDate = date.toDate()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (taskDate.toDateString() === today.toDateString()) {
      return "Today"
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return taskDate.toLocaleDateString()
    }
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`relative group ${getPriorityColor(task.priority)} ${
            snapshot.isDragging ? "rotate-3 scale-105 shadow-xl z-50" : ""
          } ${isOverdue ? "ring-2 ring-red-400 dark:ring-red-600" : ""} ${
            task.completed ? "opacity-60" : ""
          } rounded-lg border p-4 transition-all duration-200 hover:shadow-md cursor-pointer`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
          whileHover={{ y: -2 }}
          layout
        >
          {/* Priority indicator */}
          <div className="absolute top-2 right-2 opacity-60">{getPriorityIcon(task.priority)}</div>

          {/* Overdue indicator */}
          {isOverdue && (
            <div className="absolute top-1 left-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}

          {/* List badge */}
          {showListInfo && listColor && listName && (
            <div className="flex items-center space-x-1 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: listColor }} />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{listName}</span>
            </div>
          )}

          {/* Task content */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3
                className={`font-medium text-gray-900 dark:text-white pr-6 ${
                  task.completed ? "line-through text-gray-500 dark:text-gray-400" : ""
                }`}
              >
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p
                className={`text-sm text-gray-600 dark:text-gray-300 line-clamp-2 ${
                  task.completed ? "line-through opacity-60" : ""
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center space-x-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span
                  className={`${
                    isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formatDate(task.dueDate)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleToggleComplete}
                disabled={isUpdating}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  task.completed
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                } disabled:opacity-50`}
              >
                {isUpdating ? <Clock className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                <span>{task.completed ? "Undo" : "Complete"}</span>
              </button>

              {/* More actions */}
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity ${
                    showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>

                {showActions && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10 min-w-[120px]">
                    <button
                      onClick={onEdit}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Draggable>
  )
}
