"use client"

import type React from "react"

import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X, Play, Calendar, List, Clock, Flag } from "lucide-react"
import type { TaskTemplate } from "@/types"
import { useTemplate } from "@/lib/template-context"

interface UseTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: TaskTemplate | null
  lists: Array<{ id: string; name: string; color: string }>
}

export function UseTemplateModal({ isOpen, onClose, template, lists }: UseTemplateModalProps) {
  const { useTemplate: applyTemplate } = useTemplate()
  const [selectedListId, setSelectedListId] = useState("personal")
  const [startDate, setStartDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!template) return

    setLoading(true)

    try {
      const start = startDate ? new Date(startDate) : new Date()
      await applyTemplate(template.id, selectedListId, start)
      onClose()
    } catch (error) {
      console.error("Error using template:", error)
    } finally {
      setLoading(false)
    }
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

  if (!template) return null

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Use Template: {template.name}
                    </Dialog.Title>

                    {/* Template Info */}
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{template.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Tasks:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {template.tasks.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {formatDuration(template.estimatedDuration)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Used:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {template.usageCount} times
                          </span>
                        </div>
                      </div>

                      {template.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Tasks Preview */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tasks to be created:
                      </h4>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {template.tasks.map((task, index) => (
                          <div
                            key={task.id}
                            className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}
                              >
                                <Flag className="h-3 w-3 mr-1" />
                                {task.priority}
                              </span>
                              {task.daysFromStart !== undefined && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Day {task.daysFromStart}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <List className="inline h-4 w-4 mr-1" />
                            Target List
                          </label>
                          <select
                            value={selectedListId}
                            onChange={(e) => setSelectedListId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {lists.map((list) => (
                              <option key={list.id} value={list.id}>
                                {list.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Start Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty to start today</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">What happens next?</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              {template.tasks.length} tasks will be created in the "
                              {lists.find((l) => l.id === selectedListId)?.name}" list.
                              {template.tasks.some((t) => t.daysFromStart !== undefined) &&
                                " Tasks with relative due dates will be scheduled automatically."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {loading ? "Creating Tasks..." : "Use Template"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
