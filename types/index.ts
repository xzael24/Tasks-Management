import type { Timestamp } from "firebase/firestore"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Timestamp
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: Timestamp
  listId: string
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  order: number
  tags?: string[]
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  subtasks?: SubTask[]
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
  order: number
}

export interface TaskList {
  id: string
  name: string
  color: string
  description?: string
  userId: string
  createdAt: Timestamp
  isDefault?: boolean
  order?: number
}

export interface TaskTemplate {
  id: string
  name: string
  description?: string
  category: string
  isPublic: boolean
  tags: string[]
  estimatedDuration?: number // in minutes
  tasks: TemplateTask[]
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  usageCount?: number
}

export interface TemplateTask {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  order: number
  daysFromStart?: number
  estimatedTime?: number // in minutes
  tags?: string[]
}

export interface Team {
  id: string
  name: string
  description?: string
  color: string
  ownerId: string
  members: TeamMember[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface TeamMember {
  userId: string
  email: string
  name: string
  role: "owner" | "admin" | "member"
  joinedAt: Timestamp
  avatar?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: Timestamp
  actionUrl?: string
}

export interface UserSettings {
  userId: string
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    push: boolean
    taskReminders: boolean
    teamUpdates: boolean
  }
  privacy: {
    profileVisible: boolean
    activityVisible: boolean
  }
  preferences: {
    defaultView: "board" | "list" | "calendar"
    taskSort: "dueDate" | "priority" | "created" | "alphabetical"
    autoArchive: boolean
    weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
  }
}
