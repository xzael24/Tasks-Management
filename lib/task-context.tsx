"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "./auth-context"
import type { Task, TaskList } from "@/types"
import toast from "react-hot-toast"

interface TaskContextType {
  tasks: Task[]
  lists: TaskList[]
  defaultLists: TaskList[]
  loading: boolean
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addList: (list: Omit<TaskList, "id" | "createdAt">) => Promise<void>
  updateList: (id: string, updates: Partial<TaskList>) => Promise<void>
  deleteList: (id: string) => Promise<void>
  bulkUpdateTasks: (updates: Array<{ id: string; updates: Partial<Task> }>) => Promise<void>
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  lists: [],
  defaultLists: [],
  loading: true,
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  addList: async () => {},
  updateList: async () => {},
  deleteList: async () => {},
  bulkUpdateTasks: async () => {},
})

export const useTask = () => useContext(TaskContext)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<TaskList[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Enhanced default lists with more categories
  const defaultLists: TaskList[] = [
    {
      id: "personal",
      name: "Personal",
      color: "#3B82F6",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Personal tasks and reminders",
    },
    {
      id: "work",
      name: "Work",
      color: "#10B981",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Work-related tasks and projects",
    },
    {
      id: "shopping",
      name: "Shopping",
      color: "#F59E0B",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Shopping lists and purchases",
    },
    {
      id: "health",
      name: "Health & Fitness",
      color: "#EF4444",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Health appointments and fitness goals",
    },
    {
      id: "learning",
      name: "Learning",
      color: "#8B5CF6",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Educational goals and courses",
    },
    {
      id: "finance",
      name: "Finance",
      color: "#06B6D4",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Financial planning and budgeting",
    },
    {
      id: "home",
      name: "Home & Garden",
      color: "#84CC16",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Home maintenance and gardening",
    },
    {
      id: "travel",
      name: "Travel",
      color: "#F97316",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Travel planning and itineraries",
    },
    {
      id: "hobbies",
      name: "Hobbies",
      color: "#EC4899",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Hobby projects and creative pursuits",
    },
    {
      id: "family",
      name: "Family",
      color: "#F59E0B",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Family events and responsibilities",
    },
    {
      id: "projects",
      name: "Projects",
      color: "#6366F1",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Long-term projects and goals",
    },
    {
      id: "ideas",
      name: "Ideas",
      color: "#A855F7",
      userId: "system",
      createdAt: { toDate: () => new Date() } as any,
      isDefault: true,
      description: "Creative ideas and inspiration",
    },
  ]

  useEffect(() => {
    if (!user) {
      setTasks([])
      setLists([])
      setLoading(false)
      return
    }

    // Subscribe to tasks
    const tasksQuery = query(collection(db, "tasks"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribeTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[]
        setTasks(tasksData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching tasks:", error)
        toast.error("Failed to load tasks")
        setLoading(false)
      },
    )

    // Subscribe to custom lists
    const listsQuery = query(collection(db, "lists"), where("userId", "==", user.uid))

    const unsubscribeLists = onSnapshot(
      listsQuery,
      (snapshot) => {
        const listsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TaskList[]
        setLists(listsData)
      },
      (error) => {
        console.error("Error fetching lists:", error)
        toast.error("Failed to load lists")
      },
    )

    return () => {
      unsubscribeTasks()
      unsubscribeLists()
    }
  }, [user])

  const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!user) {
      toast.error("You must be logged in to add tasks")
      return
    }

    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        ...taskData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        order: tasks.length,
      })

      console.log("Task added successfully with ID:", docRef.id)
      // Don't show toast here as it will be shown by the component
    } catch (error) {
      console.error("Error adding task:", error)
      toast.error("Failed to add task. Please try again.")
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) {
      toast.error("You must be logged in to update tasks")
      return
    }

    try {
      await updateDoc(doc(db, "tasks", id), {
        ...updates,
        updatedAt: Timestamp.now(),
      })

      console.log("Task updated successfully:", id)
      // Don't show toast here as it will be shown by the component
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task. Please try again.")
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete tasks")
      return
    }

    try {
      await deleteDoc(doc(db, "tasks", id))
      console.log("Task deleted successfully:", id)
      // Don't show toast here as it will be shown by the component
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task. Please try again.")
      throw error
    }
  }

  const addList = async (listData: Omit<TaskList, "id" | "createdAt">) => {
    if (!user) {
      toast.error("You must be logged in to create lists")
      return
    }

    try {
      const docRef = await addDoc(collection(db, "lists"), {
        ...listData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        isDefault: false,
      })

      console.log("List created successfully with ID:", docRef.id)
      // Don't show toast here as it will be shown by the component
    } catch (error) {
      console.error("Error creating list:", error)
      toast.error("Failed to create list. Please try again.")
      throw error
    }
  }

  const updateList = async (id: string, updates: Partial<TaskList>) => {
    if (!user) {
      toast.error("You must be logged in to update lists")
      return
    }

    try {
      await updateDoc(doc(db, "lists", id), updates)
      console.log("List updated successfully:", id)
      // Don't show toast here as it will be shown by the component
    } catch (error) {
      console.error("Error updating list:", error)
      toast.error("Failed to update list. Please try again.")
      throw error
    }
  }

  const deleteList = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete lists")
      return
    }

    try {
      // First, move all tasks from this list to "personal"
      const tasksInList = tasks.filter((task) => task.listId === id)

      if (tasksInList.length > 0) {
        const batch = writeBatch(db)
        tasksInList.forEach((task) => {
          const taskRef = doc(db, "tasks", task.id)
          batch.update(taskRef, {
            listId: "personal",
            updatedAt: Timestamp.now(),
          })
        })
        await batch.commit()
        console.log(`Moved ${tasksInList.length} tasks to Personal list`)
      }

      // Then delete the list
      await deleteDoc(doc(db, "lists", id))
      console.log("List deleted successfully:", id)
      // Don't show toast here as it will be shown by the component
    } catch (error) {
      console.error("Error deleting list:", error)
      toast.error("Failed to delete list. Please try again.")
      throw error
    }
  }

  const bulkUpdateTasks = async (updates: Array<{ id: string; updates: Partial<Task> }>) => {
    if (!user) {
      toast.error("You must be logged in to update tasks")
      return
    }

    try {
      const batch = writeBatch(db)

      updates.forEach(({ id, updates: taskUpdates }) => {
        const taskRef = doc(db, "tasks", id)
        batch.update(taskRef, {
          ...taskUpdates,
          updatedAt: Timestamp.now(),
        })
      })

      await batch.commit()
      console.log(`Bulk updated ${updates.length} tasks`)
      toast.success(`Updated ${updates.length} tasks`)
    } catch (error) {
      console.error("Error bulk updating tasks:", error)
      toast.error("Failed to update tasks. Please try again.")
      throw error
    }
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        lists,
        defaultLists,
        loading,
        addTask,
        updateTask,
        deleteTask,
        addList,
        updateList,
        deleteList,
        bulkUpdateTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}
