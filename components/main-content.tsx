"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { TaskInput } from "@/components/task-input"
import { OutputDisplay } from "@/components/output-display"
import { useAppStore } from "@/lib/store"

export function MainContent() {
  const { currentTask } = useAppStore()

  return (
    <SidebarInset className="flex flex-col">
      <TopNavbar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6 space-y-6">
          {/* Welcome Section */}
          {!currentTask && (
            <div className="text-center space-y-6 py-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">What can I help you with?</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Just describe what you need in plain English and I'll take care of it
                </p>
              </div>
            </div>
          )}

          {/* Output Display */}
          {currentTask && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <OutputDisplay />
            </div>
          )}

          {/* Task Input - Always at bottom */}
          <div className="mt-auto">
            <TaskInput />
          </div>
        </div>
      </main>
    </SidebarInset>
  )
}
