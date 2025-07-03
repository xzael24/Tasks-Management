"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { TaskProvider } from "@/lib/task-context"
import { TemplateProvider } from "@/lib/template-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TaskProvider>
          <TemplateProvider>{children}</TemplateProvider>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
