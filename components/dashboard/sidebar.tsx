"use client"

import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import {
  CheckSquare,
  Home,
  Calendar,
  Users,
  Settings,
  Plus,
  X,
  BookTemplate,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useTask } from "@/lib/task-context"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const { user } = useAuth()
  const { lists, defaultLists, tasks } = useTask()
  const pathname = usePathname()
  const [showAllLists, setShowAllLists] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home, current: pathname === "/dashboard" },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar, current: pathname === "/dashboard/calendar" },
    {
      name: "Templates",
      href: "/dashboard/templates",
      icon: BookTemplate,
      current: pathname === "/dashboard/templates",
    },
    { name: "Team", href: "/dashboard/team", icon: Users, current: pathname === "/dashboard/team" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, current: pathname === "/dashboard/settings" },
  ]

  const allLists = [...defaultLists, ...lists]

  // Get task count for each list
  const getTaskCount = (listId: string) => {
    return tasks.filter((task) => task.listId === listId && !task.completed).length
  }

  // Get total task statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const overdueTasks = tasks.filter(
    (task) => !task.completed && task.dueDate && task.dueDate.toDate() < new Date(),
  ).length

  // Show top 6 lists by default, then show all if expanded
  const listsToShow = showAllLists ? allLists : allLists.slice(0, 6)
  const hasMoreLists = allLists.length > 6

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Task Statistics */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Overview</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
              <span className="font-medium text-gray-900 dark:text-white">{totalTasks}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-medium text-green-600 dark:text-green-400">{completedTasks}</span>
            </div>
            {overdueTasks > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Overdue</span>
                <span className="font-medium text-red-600 dark:text-red-400">{overdueTasks}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lists Section */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">My Lists</h3>
            <div className="flex items-center space-x-1">
              {hasMoreLists && (
                <button
                  onClick={() => setShowAllLists(!showAllLists)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                >
                  {showAllLists ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {listsToShow.map((list) => {
              const taskCount = getTaskCount(list.id)
              return (
                <div
                  key={list.id}
                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
                    <span className="truncate">{list.name}</span>
                  </div>
                  {taskCount > 0 && (
                    <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                      {taskCount}
                    </span>
                  )}
                </div>
              )
            })}

            {hasMoreLists && !showAllLists && (
              <button
                onClick={() => setShowAllLists(true)}
                className="w-full text-left px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
              >
                +{allLists.length - 6} more lists...
              </button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user?.displayName || "User"} />
              ) : null}
              <AvatarFallback name={user?.displayName || user?.email || "User"} />
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.displayName || "User"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={() => setOpen(false)}>
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}
