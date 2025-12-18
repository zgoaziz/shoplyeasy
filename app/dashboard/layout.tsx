"use client"

import { DashboardNavbar } from "@/components/dashboard-navbar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <DashboardSidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <DashboardNavbar />
        <main className="flex-1 pt-16 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

