"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Task {
  id: string
  input: string
  output?: any
  error?: string
  status: "processing" | "completed" | "error"
  timestamp: Date
}

interface AppState {
  tasks: Task[]
  currentTask: Task | null
  loading: boolean
  addTask: (task: Task) => void
  setCurrentTask: (task: Task | null) => void
  setLoading: (loading: boolean) => void
  clearCurrentTask: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTask: null,
      loading: false,

      addTask: (task) => {
        set((state) => {
          const existingIndex = state.tasks.findIndex((t) => t.id === task.id)
          if (existingIndex >= 0) {
            const updatedTasks = [...state.tasks]
            updatedTasks[existingIndex] = task
            return { tasks: updatedTasks }
          } else {
            return { tasks: [task, ...state.tasks.slice(0, 19)] } // Keep only last 20 tasks
          }
        })
      },

      setCurrentTask: (task) => set({ currentTask: task }),
      setLoading: (loading) => set({ loading }),
      clearCurrentTask: () => set({ currentTask: null }),
    }),
    {
      name: "orgogpt-storage",
      partialize: (state) => ({ tasks: state.tasks }),
      reviver: (key, value) => {
        if (key === "tasks" && Array.isArray(value)) {
          return value.map((task) => ({
            ...task,
            timestamp: new Date(task.timestamp), // Convert timestamp string back to Date object
          }))
        }
        return value
      },
    },
  ),
)
