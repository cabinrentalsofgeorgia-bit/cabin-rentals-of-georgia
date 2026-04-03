'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

// Icon components (using simple SVG icons)
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Cabin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Content: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Blog: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Link: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Quote: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Image: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Question: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Sync: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
}

interface MenuItem {
  name: string
  href?: string
  icon: keyof typeof Icons
  children?: { name: string; href: string }[]
  badge?: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const menuSections: MenuSection[] = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: 'Dashboard',
      },
      {
        name: 'Tax Vault',
        href: '/admin/dashboard/tax-reports',
        icon: 'Shield',
        badge: 'NEW',
      },
    ],
  },
  {
    title: 'Properties',
    items: [
      {
        name: 'Cabins',
        icon: 'Cabin',
        children: [
          { name: 'All Cabins', href: '/admin/cabins' },
          { name: 'Add New Cabin', href: '/admin/cabins/new' },
          { name: 'Featured Cabins', href: '/admin/cabins/featured' },
        ],
      },
      {
        name: 'Availability',
        icon: 'Calendar',
        children: [
          { name: 'Calendar Overview', href: '/admin/availability' },
          { name: 'Rates & Pricing', href: '/admin/availability/rates' },
          { name: 'Blocked Dates', href: '/admin/availability/blocked' },
        ],
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        name: 'Activities',
        icon: 'Activity',
        children: [
          { name: 'All Activities', href: '/admin/activities' },
          { name: 'Add New Activity', href: '/admin/activities/new' },
          { name: 'Activity Categories', href: '/admin/activities/categories' },
        ],
      },
      {
        name: 'Blog',
        icon: 'Blog',
        children: [
          { name: 'All Posts', href: '/admin/blog' },
          { name: 'Add New Post', href: '/admin/blog/new' },
          { name: 'Categories', href: '/admin/blog/categories' },
        ],
      },
      {
        name: 'Testimonials',
        icon: 'Quote',
        children: [
          { name: 'All Testimonials', href: '/admin/testimonials' },
          { name: 'Add New Testimonial', href: '/admin/testimonials/new' },
        ],
      },
      {
        name: 'Homepage',
        icon: 'Home',
        children: [
          { name: 'Hero Slider', href: '/admin/content/hero-slider' },
          { name: 'Featured Content', href: '/admin/content/featured' },
          { name: 'Quick Links', href: '/admin/content/quick-links' },
        ],
      },
      {
        name: 'Pages',
        icon: 'Content',
        children: [
          { name: 'All Pages', href: '/admin/pages' },
          { name: 'About Blue Ridge', href: '/admin/pages/about-blue-ridge' },
          { name: 'Blue Ridge Experience', href: '/admin/pages/experience' },
          { name: 'Property Management', href: '/admin/pages/property-management' },
        ],
      },
      {
        name: 'Media Library',
        href: '/admin/media',
        icon: 'Image',
      },
    ],
  },
  {
    title: 'Customer Engagement',
    items: [
      {
        name: 'FAQs',
        icon: 'Question',
        children: [
          { name: 'All FAQs', href: '/admin/faqs' },
          { name: 'Add New FAQ', href: '/admin/faqs/new' },
        ],
      },
    ],
  },
  {
    title: 'Categories & Taxonomy',
    items: [
      {
        name: 'Taxonomy',
        icon: 'Tag',
        children: [
          { name: 'Property Types', href: '/admin/taxonomy/property-types' },
          { name: 'Amenities', href: '/admin/taxonomy/amenities' },
          { name: 'Locations', href: '/admin/taxonomy/locations' },
          { name: 'Bedroom Options', href: '/admin/taxonomy/bedrooms' },
        ],
      },
    ],
  },
  {
    title: 'Policies & Legal',
    items: [
      {
        name: 'Policies',
        icon: 'Shield',
        children: [
          { name: 'Rental Policies', href: '/admin/policies/rental' },
          { name: 'About Us', href: '/admin/policies/about-us' },
          { name: 'Terms & Conditions', href: '/admin/policies/terms' },
        ],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        name: 'Integrations',
        icon: 'Sync',
        children: [
          { name: 'Streamline PMS', href: '/admin/integrations/streamline' },
          { name: 'Sync Status', href: '/admin/integrations/sync-status' },
          { name: 'API Settings', href: '/admin/integrations/api' },
        ],
      },
      {
        name: 'Settings',
        icon: 'Settings',
        children: [
          { name: 'General Settings', href: '/admin/settings' },
          { name: 'Users & Roles', href: '/admin/settings/users' },
          { name: 'System Logs', href: '/admin/settings/logs' },
        ],
      },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Cabins', 'Homepage'])

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => pathname === href
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href)

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CR</span>
          </div>
          <div>
            <span className="text-white font-semibold text-lg">Cabin Rentals</span>
            <span className="text-xs text-slate-500 block -mt-1">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation - scrollbar only visible on hover */}
      <nav className="admin-sidebar-nav flex-1 overflow-y-auto py-4 px-3">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = Icons[item.icon]
                const hasChildren = item.children && item.children.length > 0
                const isExpanded = expandedItems.includes(item.name)
                const isItemActive = item.href ? isActive(item.href) : isChildActive(item.children)

                return (
                  <li key={item.name}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isItemActive
                            ? 'bg-slate-800 text-white'
                            : 'hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon />
                            {item.name}
                          </span>
                          <span
                            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''
                              }`}
                          >
                            <Icons.ChevronDown />
                          </span>
                        </button>
                        {isExpanded && (
                          <ul className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                            {item.children?.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive(child.href)
                                    ? 'bg-amber-600/20 text-amber-500'
                                    : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(item.href || '')
                          ? 'bg-amber-600/20 text-amber-500'
                          : 'hover:bg-slate-800 hover:text-white'
                          }`}
                      >
                        <Icon />
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Icons.Link />
          View Live Site
        </Link>
      </div>
    </aside>
  )
}

