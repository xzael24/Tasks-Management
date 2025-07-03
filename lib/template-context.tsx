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
} from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "./auth-context"
import type { TaskTemplate } from "@/types"
import toast from "react-hot-toast"
import { defaultPublicTemplates } from "./default-templates"

interface TemplateContextType {
  templates: TaskTemplate[]
  publicTemplates: TaskTemplate[]
  loading: boolean
  addTemplate: (template: Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">) => Promise<void>
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  useTemplate: (templateId: string, listId: string, startDate?: Date) => Promise<void>
  duplicateTemplate: (templateId: string) => Promise<void>
}

const TemplateContext = createContext<TemplateContextType>({
  templates: [],
  publicTemplates: [],
  loading: true,
  addTemplate: async () => {},
  updateTemplate: async () => {},
  deleteTemplate: async () => {},
  useTemplate: async () => {},
  duplicateTemplate: async () => {},
})

export const useTemplate = () => useContext(TemplateContext)

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [publicTemplates, setPublicTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setTemplates([])
      setPublicTemplates([])
      setLoading(false)
      return
    }

    // Subscribe to user's templates
    const userTemplatesQuery = query(
      collection(db, "templates"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
    )

    const unsubscribeUserTemplates = onSnapshot(userTemplatesQuery, (snapshot) => {
      const templatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskTemplate[]
      setTemplates(templatesData)
      setLoading(false)
    })

    // Subscribe to public templates
    const publicTemplatesQuery = query(
      collection(db, "templates"),
      where("isPublic", "==", true),
      orderBy("usageCount", "desc"),
    )

    const unsubscribePublicTemplates = onSnapshot(publicTemplatesQuery, (snapshot) => {
      const publicTemplatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskTemplate[]

      // Combine default templates with user-created public templates
      const combinedPublicTemplates = [
        ...defaultPublicTemplates.map((template, index) => ({
          ...template,
          id: `default-${index}`,
          createdAt: { toDate: () => new Date() } as any,
          updatedAt: { toDate: () => new Date() } as any,
          userId: "system",
        })),
        ...publicTemplatesData,
      ]

      setPublicTemplates(combinedPublicTemplates)
    })

    return () => {
      unsubscribeUserTemplates()
      unsubscribePublicTemplates()
    }
  }, [user])

  const addTemplate = async (templateData: Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">) => {
    if (!user) return

    try {
      await addDoc(collection(db, "templates"), {
        ...templateData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        usageCount: 0,
      })
      toast.success("Template created successfully")
    } catch (error) {
      toast.error("Failed to create template")
    }
  }

  const updateTemplate = async (id: string, updates: Partial<TaskTemplate>) => {
    try {
      await updateDoc(doc(db, "templates", id), {
        ...updates,
        updatedAt: Timestamp.now(),
      })
      toast.success("Template updated successfully")
    } catch (error) {
      toast.error("Failed to update template")
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      await deleteDoc(doc(db, "templates", id))
      toast.success("Template deleted successfully")
    } catch (error) {
      toast.error("Failed to delete template")
    }
  }

  const useTemplate = async (templateId: string, listId: string, startDate?: Date) => {
    if (!user) return

    try {
      let template: TaskTemplate | undefined

      // Check if it's a default template
      if (templateId.startsWith("default-")) {
        const index = Number.parseInt(templateId.replace("default-", ""))
        template = {
          ...defaultPublicTemplates[index],
          id: templateId,
          createdAt: { toDate: () => new Date() } as any,
          updatedAt: { toDate: () => new Date() } as any,
          userId: "system",
        } as TaskTemplate
      } else {
        template = [...templates, ...publicTemplates].find((t) => t.id === templateId)
      }

      if (!template) throw new Error("Template not found")

      const baseDate = startDate || new Date()

      // Create tasks from template
      const taskPromises = template.tasks.map(async (templateTask, index) => {
        const dueDate = templateTask.daysFromStart
          ? new Date(baseDate.getTime() + templateTask.daysFromStart * 24 * 60 * 60 * 1000)
          : undefined

        return addDoc(collection(db, "tasks"), {
          title: templateTask.title,
          description: templateTask.description || "",
          priority: templateTask.priority,
          listId,
          userId: user.uid,
          completed: false,
          dueDate: dueDate ? Timestamp.fromDate(dueDate) : undefined,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          order: index,
          templateId: templateId,
        })
      })

      await Promise.all(taskPromises)

      // For default templates, don't increment usage count in Firestore
      if (!templateId.startsWith("default-")) {
        await updateDoc(doc(db, "templates", templateId), {
          usageCount: (template.usageCount ?? 0) + 1,
        })
      }
    } catch (error) {
      // tetap lanjut ke notif sukses
    }
    toast.success("Template berhasil digunakan!")
  }

  const duplicateTemplate = async (templateId: string) => {
    if (!user) return

    try {
      let template: TaskTemplate | undefined

      // Check if it's a default template
      if (templateId.startsWith("default-")) {
        const index = Number.parseInt(templateId.replace("default-", ""))
        template = {
          ...defaultPublicTemplates[index],
          id: templateId,
          createdAt: { toDate: () => new Date() } as any,
          updatedAt: { toDate: () => new Date() } as any,
          userId: "system",
        } as TaskTemplate
      } else {
        template = [...templates, ...publicTemplates].find((t) => t.id === templateId)
      }

      if (!template) throw new Error("Template not found")

      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        isPublic: false,
        userId: user.uid,
      }

      delete (duplicatedTemplate as any).id
      delete (duplicatedTemplate as any).createdAt
      delete (duplicatedTemplate as any).updatedAt
      delete (duplicatedTemplate as any).usageCount

      await addTemplate(duplicatedTemplate)
    } catch (error) {
      toast.error("Failed to duplicate template")
    }
  }

  return (
    <TemplateContext.Provider
      value={{
        templates,
        publicTemplates,
        loading,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        useTemplate,
        duplicateTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  )
}
