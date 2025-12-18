"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isLoginRoute = pathname === '/login' || pathname === '/registre' || pathname === '/setup'

  if (isDashboardRoute || isLoginRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

