"use client"

import { Bot, History, Plus } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { TaskHistory } from "@/components/task-history"
import { OrgoStatus } from "@/components/orgo-status"
import { useAppStore } from "@/lib/store"

export function AppSidebar() {
  const { clearCurrentTask } = useAppStore()

  return (
    <Sidebar variant="inset" className="border-r transition-all duration-300">
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-left-5 duration-500">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              OrgoGPT
            </span>
            <span className="text-xs text-muted-foreground">AI Assistant</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className="space-y-4 py-4">
          <div className="px-2">
            <Button
              onClick={clearCurrentTask}
              className="w-full justify-start gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          <div className="px-2 space-y-2">
            <div className="flex items-center gap-2 px-2 py-1">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Recent Tasks</span>
            </div>
            <TaskHistory />
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <OrgoStatus />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
