"use client"

import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useTranslation } from "@/contexts/translation-context"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardNavbar() {
  const { language, setLanguage } = useTranslation()

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gold/20 z-50 lg:left-64 shadow-sm">
      <div className="h-full px-4 sm:px-6 flex items-center justify-end gap-3 sm:gap-4">
        {/* Notifications */}
        <NotificationsDropdown />
        
        {/* Language Switcher */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
          className="text-navy hover:text-gold hover:bg-gold/10"
        >
          <Languages className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">{language === 'fr' ? 'العربية' : 'Français'}</span>
          <span className="sm:hidden">{language === 'fr' ? 'AR' : 'FR'}</span>
        </Button>
      </div>
    </nav>
  )
}

