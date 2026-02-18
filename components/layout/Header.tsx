'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuDisplay, setMenuDisplay] = useState<'none' | 'block'>('none')
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [mainMenuHover, setMainMenuHover] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const mainMenuItems = [
    {
      title: 'Blue Ridge Cabins',
      href: '/blue-ridge-cabins?all=1',
      submenu: [
        { title: 'Blue Ridge Luxury Cabins', href: '/cabins/all/blue-ridge-luxury' },
        { title: 'Family Reunion Cabins', href: '/cabins/all/family-reunion' },
        { title: 'Corporate Retreat Cabins', href: '/cabins/all/corporate-retreats' },
        { title: 'Cabins With Hot Tubs', href: '/cabins/amenities/hot-tub' },
        { title: 'Cabins With Game Rooms', href: '/cabins/amenities/game-room' },
        { title: 'Motorcycle Friendly Cabins', href: '/cabins/amenities/motorcycle-friendly' },
        { title: 'Pet Friendly Cabins', href: '/cabins/all/pet-friendly' },
        { title: 'Mountain View Cabins', href: '/cabins/all/mountain-view' },
        { title: 'Creek & Riverfront Cabins', href: '/cabins/all/river-front' },
        { title: 'River View Cabins', href: '/cabins/all/river-view' },
        { title: 'Lake View Cabins', href: '/cabins/all/lake-view' },
        { title: 'Cabins in the Woods', href: '/cabins/all/cabin-in-the-woods' },
        { title: 'All Cabin Rentals', href: '/blue-ridge-cabins?all=1' },
      ],
    },
    {
      title: 'Blue Ridge Experience',
      href: '/blue-ridge-experience?all=1',
      submenu: [
        { title: 'About Blue Ridge, GA', href: '/about-blue-ridge-ga' },
        { title: 'Blue Ridge, GA Activities', href: '/blue-ridge-georgia-activities' },
      ],
    },
    {
      title: 'Blue Ridge Memories',
      href: '/blue-ridge-memories?all=1',
    },
  ]

  const secondaryMenuItems = [
    { title: 'FAQ', href: '/faq' },
    { title: 'Blog', href: '/blogs' },
    { title: 'Policies', href: '/rental-policies' },
    { title: 'About Us', href: '/about-us' },
    { title: 'Property Management', href: '/blue-ridge-property-management' },
  ]

  const handleMouseEnter = (title: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setMainMenuHover(title)
    }, 100) // 200ms delay to show
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setMainMenuHover(null)
    }, 100) // 300ms delay to hide
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Handle menu display and page content transform
  useEffect(() => {
    if (mobileMenuOpen) {
      // Opening: First set display:block, then move page content
      setMenuDisplay('block')
      // Small delay to ensure display is set before transform
      requestAnimationFrame(() => {
        document.body.style.transition = 'transform 300ms linear'
        document.body.style.overflow = 'hidden'
        document.body.style.overflowX = 'hidden'
        document.body.style.overflowY = 'hidden'
        document.body.style.transform = 'translate(250px, 0px)'
      })
    } else {
      // Closing: First move page content to left, then hide menu after 300ms
      document.body.style.transition = 'transform 300ms linear'
      document.body.style.overflowX = 'hidden'
      document.body.style.transform = 'translate(0px, 0px)'
      
      // Set display:none after 300ms (when transform animation completes)
      const timer = setTimeout(() => {
        setMenuDisplay('none')
        document.body.style.overflow = ''
        document.body.style.overflowX = ''
        document.body.style.overflowY = ''
      }, 300)
      
      return () => {
        clearTimeout(timer)
      }
    }
    
    return () => {
      document.body.style.transform = ''
      document.body.style.transition = ''
      document.body.style.overflow = ''
      document.body.style.overflowX = ''
      document.body.style.overflowY = ''
    }
  }, [mobileMenuOpen])

  // Close menu when clicking on the shifted content area
  useEffect(() => {
    const handleContentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Close if clicking outside the menu (on the shifted content)
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
        // Don't close if clicking the hamburger button
        if (!target.closest('button[aria-label="Toggle menu"]')) {
          setMobileMenuOpen(false)
          setActiveSubmenu(null)
        }
      }
    }

    if (mobileMenuOpen) {
      // Small delay to prevent immediate close when opening
      setTimeout(() => {
        document.addEventListener('click', handleContentClick)
      }, 100)
    }

    return () => {
      document.removeEventListener('click', handleContentClick)
    }
  }, [mobileMenuOpen])

  const handleSubmenuToggle = (title: string) => {
    setActiveSubmenu(activeSubmenu === title ? null : title)
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
    setActiveSubmenu(null)
  }

  const handleSubmenuLinkClick = () => {
    // Close menu and navigate when clicking submenu links
    setMobileMenuOpen(false)
    setActiveSubmenu(null)
  }

  return (
    <>
      {/* Nav Bar */}
      <div id="nav-bar" className="h-[45px] md:h-[57px] bg-[#122225] shadow-[0px_0px_20px_0px_#000] relative z-[100] inline-block w-full">
        <div className="region-nav-bar w-full m-auto h-full flex items-center justify-between relative z-[100] p-[6px_12px]">
          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <Image
              src="/images/mobilemenu_hamburger.png"
              alt="menu"
              width={24}
              height={24}
            />
          </button>

          {/* Main Menu - Left Side */}
          <div className="hidden md:flex h-full pb-[6px]">
            <ul className="flex items-end h-full -ml-[10px]  max-[1010px]:-mt-[16px] max-[1010px]:-ml-[5px]">
              {mainMenuItems.map((item, index) => (
                <li
                  key={index}
                  className="flex relative"
                  onMouseEnter={() => item.submenu && handleMouseEnter(item.title)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center text-[#91b000] no-underline px-[10px] leading-none hover:text-[#c0e901] text-base max-[1010px]:px-[5px]  max-[1010px]:text-[95%] ${index !== mainMenuItems.length - 1 ? 'border-r border-[#91b000]' : ''}`}
                  >
                    {item.title}
                  </Link>
                  {item.submenu && mainMenuHover === item.title && (
                    <ul
                      className="absolute top-full left-[10px] w-[190px] bg-[#122225] border border-[#343f00] z-50 mt-[10px] opacity-[0.9]"
                      onMouseEnter={() => item.submenu && handleMouseEnter(item.title)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.submenu.map((sub, subIndex) => (
                        <li
                          key={subIndex}
                          className="bg-[#122225] text-[#91b000] border-b border-[#343f00] hover:bg-[#122225] hover:text-[#c0e901]  p-[2px_0px_2px_10px]"
                        >
                          <Link
                            href={sub.href}
                            className="block w-full hover:text-[#c0e901] p-[4px_20px_4px_0px]"
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side - Secondary Menu, Phone, Facebook Button */}
          <div className="flex flex-col items-end justify-center h-full">
            {/* Secondary Menu - Top */}
            <ul className="hidden md:flex items-center">
              {secondaryMenuItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex items-center text-[#7f979a] no-underline px-1.5 my-[1.5] mt-[9px] leading-none hover:text-[#c1d5d7] max-[1010px]:px-[6px] max-[1010px]:mt-[8px] max-[1010px]:mb-[4px] max-[1010px]:text-[90%] ${index !== secondaryMenuItems.length - 1 ? 'border-r border-[#7f979a]' : ''
                      }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Phone Number and Facebook Button - Bottom */}
            <div className="flex items-center gap-[46px] max-[1010px]:gap-[46px] max-[1010px]:mt-[0px] ">
              <div className="max-[450px]:flex max-[450px]:flex-col max-[450px]:text-center text-[#91b000] text-[17px] text-[17.6px] max-[1010px]:text-[105%] max-[1010px]:pt-[2px] max-[767px]:text-[17.28px] max-[767px]:-mr-[2px]">
                <span>Contact Us:{' '}</span>
                <Link
                  href="tel:7064322140"
                  className="no-underline max-[767px]:text-[#c0e901]"
                >
                  706-432-2140
                </Link>
              </div>
              <div
                className="hidden md:inline-flex  rounded-[3px] items-center cursor-pointer rounded-sm text-white bg-[#4167b2] text-[12px] tracking-[0.5px] font-sans leading-[100%] p-[4px_7px_4px_11px] -mt-[1px] mr-[8px] max-[1010px]:mt-[2px]"
                style={{ fontFamily: 'Arial' }}
              >
                <i className="fa-solid fa-thumbs-up text-[13px] pr-[7px]"></i>
                Like
              </div>
            </div>
          </div>
        </div>
        {/* Logo */}
        <div id="logo" className="relative m-auto z-[100] w-[180px] md:w-[276px] -top-[47px] max-[1010px]:-top-[37px] max-[767px]:-top-[45px] ">
          <Link href="/" className="h-auto absolute top-0">
            <Image
              src="/images/logo.png"
              alt="Cabin Rentals of Georgia"
              width={276}
              height={115}
              className="h-auto"
              priority
            />
          </Link>
        </div>
      </div>

      {/* Mobile Menu - Fixed at 0,0, behind page content */}
      <div 
        ref={menuRef}
        className="fixed left-0 top-0 h-full w-[252px] bg-[#f6f1cd] shadow-2xl z-[50] md:hidden overflow-y-auto"
        style={{
          display: menuDisplay,
          position: 'fixed',
          left: 0,
          top: 0,
          marginLeft: '-251px',
          boxShadow: mobileMenuOpen ? 'inset -7px 0px 15px rgba(0, 0, 0, 0.3)' : 'none'
        }}
      >
        {/* Menu Content */}
        <div className="py-0 relative overflow-hidden h-full bg-[#f6f1cd]">
          {/* Main Menu Items */}
          <div 
            className={`absolute top-0 left-0 w-full h-full bg-[#f6f1cd] transition-transform duration-300 ease-out ${
              activeSubmenu ? '-translate-x-full' : 'translate-x-0'
            }`}
            style={{ willChange: 'transform' }}
          >
            {/* Main Menu Header */}
            <div className="bg-[#122225] h-[44px] flex items-center px-4 relative">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setActiveSubmenu(null)
                }}
                className="flex items-center text-white font-bold text-base cursor-pointer whitespace-nowrap"
                aria-label="Close menu"
              >
                <Image
                  src="/images/bg_close.png"
                  alt="Close"
                  width={22}
                  height={22}
                  className="mr-2"
                />
                Close
              </button>
            </div>

            {/* Main Menu Content */}
            <div className="overflow-y-auto h-[calc(100%-44px)]">
            <ul className="list-none m-0 p-0">
              {mainMenuItems.map((item, index) => (
                <li key={index} className="border-b border-[#533e27]">
                  {item.submenu ? (
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className="flex-1 px-3 py-3 text-[#533e27] font-bold text-[17px] whitespace-nowrap transition-colors"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSubmenuToggle(item.title)
                        }}
                        className="px-3 py-3 text-[#533e27] text-xl flex items-center justify-center transition-colors"
                        aria-label="Open submenu"
                      >
                        &gt;
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className="block px-3 py-3 text-[#533e27] font-bold text-[17px] whitespace-nowrap transition-colors"
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Secondary Menu Items */}
            <div className="border-[#533e27]">
              <ul className="list-none m-0 p-0">
                {secondaryMenuItems.map((item, index) => (
                  <li key={index} className="border-b border-[#533e27]">
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className="block px-3 py-3 text-[#533e27] font-bold text-[17px] whitespace-nowrap transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>

          {/* Submenu Panels - Slide in from right */}
          {mainMenuItems.map((item, index) => (
            item.submenu && (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full h-full bg-[#f6f1cd] transition-transform duration-300 ease-out ${
                  activeSubmenu === item.title ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{
                  boxShadow: activeSubmenu === item.title ? 'inset -7px 0px 15px rgba(0, 0, 0, 0.3)' : 'none',
                  willChange: 'transform'
                }}
              >
                {/* Submenu Header */}
                <div className="bg-[#122225] h-[44px] flex items-center px-4 relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Only go back to main menu, don't close the mobile menu
                      setActiveSubmenu(null)
                    }}
                    className="flex items-center text-white font-bold text-base cursor-pointer whitespace-nowrap"
                    aria-label="Back"
                  >
                    <span className="text-white text-xl mr-2">&lt;</span>
                    {item.title}
                  </button>
                </div>

                {/* Submenu Items */}
                <div className="overflow-y-auto h-[calc(100%-44px)]">
                <ul className="list-none m-0 p-0">
                  <li className="border-b border-[#533e27]">
                    <Link
                      href={item.href}
                      onClick={handleSubmenuLinkClick}
                      className="block px-3 py-3 text-[#533e27] font-bold text-[17px] whitespace-nowrap transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                  {item.submenu.map((sub, subIndex) => (
                    <li key={subIndex} className="border-b border-[#533e27]">
                      <Link
                        href={sub.href}
                        onClick={handleSubmenuLinkClick}
                        className="block px-3 py-3 text-[#533e27] font-bold text-[17px] whitespace-nowrap transition-colors"
                      >
                        {sub.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </>
  )
}
