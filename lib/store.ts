"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { isStaleProjectId } from "./project-id-debug"
import { saveProjectId, clearStoredProjectId } from "./orgo-client-utils"

export interface Task {
  id: string
  input: string
  output?: string | object
  error?: string | null
  status: "processing" | "completed" | "error"
  timestamp: Date
  screenshots?: string[]
  projectId?: string
}

interface AppState {
  tasks: Task[]
  currentTask: Task | null
  loading: boolean
  orgoConnected: boolean
  orgoProjectId?: string
  addTask: (task: Task) => void
  setCurrentTask: (task: Task | null) => void
  setLoading: (loading: boolean) => void
  clearCurrentTask: () => void
  setOrgoConnected: (connected: boolean, projectId?: string) => void
  clearStaleProjectId: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTask: null,
      loading: false,
      orgoConnected: false,
      orgoProjectId: undefined,

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
      
      setOrgoConnected: (connected, projectId) => {
        // If connecting to a new project (undefined projectId), clear any existing project ID
        if (connected && !projectId) {
          set({ 
            orgoConnected: connected, 
            orgoProjectId: undefined 
          })
          // Clear from localStorage too
          clearStoredProjectId()
          return
        }
        
        // Validate project ID before saving
        if (projectId && isStaleProjectId(projectId)) {
          set({ 
            orgoConnected: connected, 
            orgoProjectId: undefined 
          })
          clearStoredProjectId()
        } else if (projectId) {
          set({ 
            orgoConnected: connected, 
            orgoProjectId: projectId 
          })
          // Save to localStorage for persistence using the new utility
          saveProjectId(projectId)
        } else {
          set({ 
            orgoConnected: connected, 
            orgoProjectId: undefined 
          })
        }
      },
      
      clearStaleProjectId: () => {
        const state = get()
        if (state.orgoProjectId && isStaleProjectId(state.orgoProjectId)) {
          set({ orgoProjectId: undefined })
        }
      },
    }),
    {
      name: "orgogpt-storage",
      partialize: (state) => ({ 
        tasks: state.tasks,
        orgoProjectId: state.orgoProjectId 
      }),
      // Clean up stale project IDs on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.clearStaleProjectId()
        }
      },
    },
  ),
)
