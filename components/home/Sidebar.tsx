'use client'

import { usePathname } from 'next/navigation'
import SidebarContent from './SidebarContent'

export default function ConditionalSidebar() {
  const pathname = usePathname()
  
  // Hide sidebar if URL contains "blue-ridge-property-management"
  if (pathname?.includes('blue-ridge-property-management') || pathname?.includes('availability') || pathname?.includes('compare')) {
    return null
  }
  
  return (
    <div className="w-[33%] max-[767px]:w-full flex-shrink-0 bg-[url('/images/bg_sidebar2.png')] bg-[50%_0%]  min-h-[200px] mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top">
      <SidebarContent />
    </div>
  )
}

