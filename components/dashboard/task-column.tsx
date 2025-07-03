"use client"

import { motion } from "framer-motion"
import { TaskCard } from "./task-card"
import type { Task } from "@/types"
import { Droppable } from "@hello-pangea/dnd"
import { MoreHorizontal, Plus } from "lucide-react"

interface TaskColumnProps {
  list: {
    id: string
    name: string
    color: string
  }
  tasks: Task[]
  onEditTask: (task: Task) => void
  viewMode?: "auto" | "compact" | "comfortable" | "list"
}

export function TaskColumn({ list, tasks, onEditTask, viewMode = "auto" }: TaskColumnProps) {
  const completedTasks = tasks.filter((task) => task.completed)
  const pendingTasks = tasks.filter((task) => !task.completed)

  const getColumnClasses = () => {
    switch (viewMode) {
      case "compact":
        return "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
      case "comfortable":
        return "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      case "list":
        return "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4"
      default:
        return "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    }
  }

  const getMinHeight = () => {
    switch (viewMode) {
      case "compact":
        return "min-h-[150px]"
      case "list":
        return "min-h-[100px]"
      default:
        return "min-h-[200px]"
    }
  }

  const getSpacing = () => {
    switch (viewMode) {
      case "compact":
        return "space-y-2"
      case "list":
        return "space-y-2"
      default:
        return "space-y-3"
    }
  }

  if (viewMode === "list") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={getColumnClasses()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: list.color }} />
            <h3 className="font-semibold text-gray-900 dark:text-white">{list.name}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({tasks.length})</span>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <Droppable droppableId={list.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`${getMinHeight()} transition-colors ${
                snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2" : ""
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {pendingTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onEdit={() => onEditTask(task)}
                    viewMode={viewMode}
                  />
                ))}

                {completedTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={pendingTasks.length + index}
                    onEdit={() => onEditTask(task)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={getColumnClasses()}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: list.color }} />
          <h3 className="font-semibold text-gray-900 dark:text-white">{list.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{tasks.length}</span>
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${getSpacing()} ${getMinHeight()} transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2" : ""
            }`}
          >
            {pendingTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onEdit={() => onEditTask(task)} viewMode={viewMode} />
            ))}

            {completedTasks.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Completed ({completedTasks.length})</p>
                </div>
                {completedTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={pendingTasks.length + index}
                    onEdit={() => onEditTask(task)}
                    viewMode={viewMode}
                  />
                ))}
              </>
            )}
            {provided.placeholder}

            {/* Empty state for individual columns */}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks yet</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </motion.div>
  )
}
