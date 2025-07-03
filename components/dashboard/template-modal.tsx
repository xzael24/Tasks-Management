"use client"

import type React from "react"

import { Fragment, useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X, Plus, Trash2, Clock, Tag, GripVertical } from "lucide-react"
import type { TaskTemplate, TemplateTask } from "@/types"
import { useTemplate } from "@/lib/template-context"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template?: TaskTemplate | null
  categories: string[]
}

export function TemplateModal({ isOpen, onClose, template, categories }: TemplateModalProps) {
  const { addTemplate, updateTemplate } = useTemplate()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState(categories[0] || "")
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>()
  const [tasks, setTasks] = useState<TemplateTask[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description || "")
      setCategory(template.category)
      setIsPublic(template.isPublic)
      setTags(template.tags)
      setEstimatedDuration(template.estimatedDuration)
      setTasks(template.tasks)
    } else {
      resetForm()
    }
  }, [template])

  const resetForm = () => {
    setName("")
    setDescription("")
    setCategory(categories[0] || "")
    setIsPublic(false)
    setTags([])
    setTagInput("")
    setEstimatedDuration(undefined)
    setTasks([])
  }

  const addTask = () => {
    const newTask: TemplateTask = {
      id: Date.now().toString(),
      title: "",
      description: "",
      priority: "medium",
      order: tasks.length,
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (taskId: string, updates: Partial<TemplateTask>) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
  }

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order
    const updatedTasks = items.map((task, index) => ({ ...task, order: index }))
    setTasks(updatedTasks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || tasks.length === 0) return

    setLoading(true)

    try {
      const templateData = {
        name: name.trim(),
        description: description.trim(),
        category,
        isPublic,
        tags,
        estimatedDuration,
        tasks: tasks.filter((task) => task.title.trim()),
      }

      if (template) {
        await updateTemplate(template.id, templateData)
      } else {
        await addTemplate(templateData)
      }

      onClose()
      resetForm()
    } catch (error) {
      console.error("Error saving template:", error)
    } finally {
      setLoading(false)
    }
  }

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
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
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      {template ? "Edit Template" : "Create New Template"}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Template Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter template name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe what this template is for..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Clock className="inline h-4 w-4 mr-1" />
                            Estimated Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={estimatedDuration || ""}
                            onChange={(e) =>
                              setEstimatedDuration(e.target.value ? Number.parseInt(e.target.value) : undefined)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 120"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Visibility
                          </label>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={!isPublic}
                                onChange={() => setIsPublic(false)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={isPublic}
                                onChange={() => setIsPublic(true)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Tag className="inline h-4 w-4 mr-1" />
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add a tag..."
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Template Tasks
                          </label>
                          <button
                            type="button"
                            onClick={addTask}
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Task
                          </button>
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="tasks">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                {tasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                      >
                                        <div className="flex items-start space-x-3">
                                          <div {...provided.dragHandleProps} className="mt-2">
                                            <GripVertical className="h-4 w-4 text-gray-400" />
                                          </div>

                                          <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                              <div className="md:col-span-2">
                                                <input
                                                  type="text"
                                                  value={task.title}
                                                  onChange={(e) => updateTask(task.id, { title: e.target.value })}
                                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  placeholder="Task title"
                                                />
                                              </div>

                                              <div>
                                                <select
                                                  value={task.priority}
                                                  onChange={(e) =>
                                                    updateTask(task.id, {
                                                      priority: e.target.value as "low" | "medium" | "high",
                                                    })
                                                  }
                                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                  <option value="low">Low Priority</option>
                                                  <option value="medium">Medium Priority</option>
                                                  <option value="high">High Priority</option>
                                                </select>
                                              </div>
                                            </div>

                                            <textarea
                                              value={task.description || ""}
                                              onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                              rows={2}
                                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                              placeholder="Task description (optional)"
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              <div>
                                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                  Days from start (optional)
                                                </label>
                                                <input
                                                  type="number"
                                                  value={task.daysFromStart || ""}
                                                  onChange={(e) =>
                                                    updateTask(task.id, {
                                                      daysFromStart: e.target.value
                                                        ? Number.parseInt(e.target.value)
                                                        : undefined,
                                                    })
                                                  }
                                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  placeholder="e.g., 3"
                                                />
                                              </div>

                                              <div>
                                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                  Estimated time (minutes)
                                                </label>
                                                <input
                                                  type="number"
                                                  value={task.estimatedTime || ""}
                                                  onChange={(e) =>
                                                    updateTask(task.id, {
                                                      estimatedTime: e.target.value
                                                        ? Number.parseInt(e.target.value)
                                                        : undefined,
                                                    })
                                                  }
                                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  placeholder="e.g., 30"
                                                />
                                              </div>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => removeTask(task.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>

                        {tasks.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks added yet</p>
                            <button
                              type="button"
                              onClick={addTask}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Task
                            </button>
                          </div>
                        )}
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
                          disabled={loading || !name.trim() || tasks.length === 0}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Saving..." : template ? "Update Template" : "Create Template"}
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
