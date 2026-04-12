'use client'

import { useEffect, useRef, useState } from 'react'
import { Property } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

interface CabinMapProps {
  cabins: Property[]
  selectedCabinId: string | null
}

declare global {
  interface Window {
    google: any
  }
}

export default function CabinMap({ cabins, selectedCabinId }: CabinMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map()) // Map cabin ID to marker
  const infoWindowsRef = useRef<Map<string, any>>(new Map()) // Map cabin ID to info window
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [visibleCabins, setVisibleCabins] = useState<Property[]>([])
  const [highlightedCabinId, setHighlightedCabinId] = useState<string | null>(selectedCabinId)

  // Google Maps API key - use environment variable or fallback to hardcoded key
  const GOOGLE_MAPS_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyD0ozy1aDQV-n8bQBm3gMaaiyw499-zsug'

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap()
      return
    }

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
      initializeMap()
    }
    script.onerror = () => {
      setMapError(
        'Failed to load Google Maps. Please check your API key configuration and ensure localhost:3000 is authorized in Google Cloud Console.'
      )
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
    }
  }, [])

  useEffect(() => {
    // Re-initialize map when cabins or selectedCabinId changes
    if (isLoaded && window.google && window.google.maps && mapRef.current) {
      initializeMap()
    }
  }, [cabins, selectedCabinId, isLoaded])

  const updateVisibleCabins = (map: any) => {
    if (!map || !window.google || !window.google.maps) {
      setVisibleCabins(cabins)
      return
    }

    try {
      const bounds = map.getBounds()
      if (!bounds) {
        setVisibleCabins(cabins)
        return
      }

      const visible = cabins.filter((cabin) => {
        if (!cabin || !cabin.latitude || !cabin.longitude) return false
        try {
          const latLng = new window.google.maps.LatLng(cabin.latitude, cabin.longitude)
          return bounds.contains(latLng)
        } catch (e) {
          return false
        }
      })

      // Sort by distance from center if we have a selected cabin
      if (selectedCabinId && visible.length > 0) {
        const selectedCabin = cabins.find((c) => c && c.id === selectedCabinId)
        if (selectedCabin && selectedCabin.latitude && selectedCabin.longitude) {
          try {
            const center = new window.google.maps.LatLng(
              selectedCabin.latitude,
              selectedCabin.longitude
            )
            visible.sort((a, b) => {
              if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0
              try {
                const distA = window.google.maps.geometry?.spherical?.computeDistanceBetween(
                  center,
                  new window.google.maps.LatLng(a.latitude, a.longitude)
                ) || 0
                const distB = window.google.maps.geometry?.spherical?.computeDistanceBetween(
                  center,
                  new window.google.maps.LatLng(b.latitude, b.longitude)
                ) || 0
                return distA - distB
              } catch (e) {
                return 0
              }
            })
          } catch (e) {
            // If sorting fails, just use the filtered list
          }
        }
      }

      setVisibleCabins(visible)
    } catch (error) {
      console.error('Error updating visible cabins:', error)
      setVisibleCabins(cabins)
    }
  }

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      return
    }

    // Clear existing markers and info windows
    markersRef.current.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
    infoWindowsRef.current.forEach((infoWindow) => {
      if (infoWindow && infoWindow.close) {
        infoWindow.close()
      }
    })
    markersRef.current.clear()
    infoWindowsRef.current.clear()

    // Find selected cabin
    const selectedCabin = selectedCabinId
      ? cabins.find((c) => c.id === selectedCabinId)
      : null

    // Calculate bounds from all cabins
    const bounds = new window.google.maps.LatLngBounds()
    let hasValidCoords = false

    cabins.forEach((cabin) => {
      if (cabin.latitude && cabin.longitude) {
        const latLng = new window.google.maps.LatLng(cabin.latitude, cabin.longitude)
        bounds.extend(latLng)
        hasValidCoords = true
      }
    })

    // Set initial center and zoom
    let center: { lat: number; lng: number }
    let zoom: number

    if (selectedCabin && selectedCabin.latitude && selectedCabin.longitude) {
      // Center on selected cabin with zoom level 13
      center = {
        lat: selectedCabin.latitude,
        lng: selectedCabin.longitude,
      }
      zoom = 13
    } else if (hasValidCoords) {
      // Center on bounds
      center = bounds.getCenter().toJSON()
      zoom = 10
    } else {
      // Default fallback
      center = { lat: 34.8658, lng: -84.3197 } // Blue Ridge, GA approximate
      zoom = 10
    }

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      scrollwheel: false, // Match old site behavior
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    })

    mapInstanceRef.current = map

    // Fit bounds if we have multiple cabins and no specific cabin selected
    if (!selectedCabin && hasValidCoords && cabins.length > 1) {
      map.fitBounds(bounds, { padding: 50 })
    }

    // Update visible cabins when map bounds change
    window.google.maps.event.addListener(
      map,
      'bounds_changed',
      () => {
        updateVisibleCabins(map)
      }
    )

    // Initial update
    updateVisibleCabins(map)

    // Create markers for all cabins
    cabins.forEach((cabin) => {
      if (!cabin.latitude || !cabin.longitude) {
        return
      }

      const isSelected = selectedCabinId === cabin.id

      // Create marker
      const marker = new window.google.maps.Marker({
        position: {
          lat: cabin.latitude,
          lng: cabin.longitude,
        },
        map,
        title: cabin.title,
        icon: isSelected
          ? {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }
          : {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            },
        animation: isSelected ? window.google.maps.Animation.DROP : undefined,
      })

      // Store marker by cabin ID
      markersRef.current.set(cabin.id, marker)

      // Create info window content
      const imageUrl = cabin.featured_image_url
        ? cabin.featured_image_url.replace(
            '/sites/default/files/',
            '/images/styles/cabin_map_listing/public/'
          )
        : '/images/default-cabin.jpg'

      // Escape HTML to prevent XSS
      const escapeHtml = (text: string) => {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
      }

      const bedrooms = escapeHtml(String(cabin.bedrooms || 'N/A'))
      const sleeps = cabin.sleeps ? `Sleeps ${cabin.sleeps}` : ''
      const cabinTitle = escapeHtml(cabin.title ?? '')
      const cabinSlug = cabin.cabin_slug || cabin.id

      const infoContent = `
        <div style="width: 250px; padding: 10px; font-family: Arial, sans-serif;">
          <div style="margin-bottom: 10px;">
            <img 
              src="${imageUrl}" 
              alt="${cabinTitle}"
              style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;"
              onerror="this.src='/images/default-cabin.jpg'"
            />
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #7c2c00;">
            ${cabinTitle}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #533e27;">
            ${bedrooms}${sleeps ? ` ~ ${sleeps}` : ''}
          </p>
          <a 
            href="/cabin/${cabinSlug}" 
            style="display: inline-block; padding: 6px 12px; background: #7c2c00; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;"
            onmouseover="this.style.background='#b7714b'"
            onmouseout="this.style.background='#7c2c00'"
          >
            View this cabin
          </a>
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      })

      // Store info window by cabin ID
      infoWindowsRef.current.set(cabin.id, infoWindow)

      // Open info window for selected cabin
      if (isSelected) {
        infoWindow.open(map, marker)
      }

      // Add click listener to marker
      marker.addListener('click', () => {
        // Close all other info windows
        infoWindowsRef.current.forEach((iw) => {
          if (iw && iw.close) {
            iw.close()
          }
        })
        // Open this info window
        infoWindow.open(map, marker)
        // Highlight in sidebar
        setHighlightedCabinId(cabin.id)
      })
    })
  }

  const handleCabinClick = (cabin: Property) => {
    if (!mapInstanceRef.current || !cabin || !cabin.latitude || !cabin.longitude || !cabin.id) {
      return
    }

    // Get the marker for this cabin by ID
    const marker = markersRef.current.get(cabin.id)
    const infoWindow = infoWindowsRef.current.get(cabin.id)

    if (marker && infoWindow) {
      // Close all other info windows
      infoWindowsRef.current.forEach((iw) => {
        if (iw && iw.close && iw !== infoWindow) {
          iw.close()
        }
      })

      // Open this cabin's info window
      infoWindow.open(mapInstanceRef.current, marker)

      // Center map on this cabin
      mapInstanceRef.current.setCenter({
        lat: cabin.latitude,
        lng: cabin.longitude,
      })
      mapInstanceRef.current.setZoom(13)

      // Highlight in sidebar
      setHighlightedCabinId(cabin.id)
    }
  }

  if (mapError) {
    return (
      <div className="mb-8">
        <div className="text-center py-10">
          <p className="text-[#533e27] text-lg">{mapError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 max-[767px]:flex-col">
      {/* Map Container */}
      <div className="flex-1 mb-8">
        <div
          ref={mapRef}
          id="cabin-locator"
          className="w-full"
          style={{
            height: '600px',
            borderRadius: '4px',
            boxShadow: '0 0 10px #333',
            minHeight: '600px',
          }}
        />
        {!isLoaded && !mapError && (
          <div className="text-center py-10">
            <p className="text-[#533e27] text-lg">Loading map...</p>
          </div>
        )}
      </div>

      {/* Sidebar Panel */}
      <div className="w-[300px] max-[767px]:w-full">
        <h2 className="text-[20px] text-[#533e27] font-normal mb-4">Nearby Cabins</h2>
        <div id="map-data-listing" className="storelocator-panel">
          <ul className="store-list space-y-4">
            {visibleCabins.length === 0 && isLoaded ? (
              <li className="text-[#533e27]">No cabins visible in current map view.</li>
            ) : (
              visibleCabins.map((cabin) => {
                const imageUrl = cabin.featured_image_url
                  ? cabin.featured_image_url.replace(
                      '/sites/default/files/',
                      '/images/styles/cabin_map_listing/public/'
                    )
                  : '/images/default-cabin.jpg'

                const isHighlighted = highlightedCabinId === cabin.id
                const cabinSlug = cabin.cabin_slug || cabin.id

                return (
                  <li
                    key={cabin.id}
                    id={`store-cabin-${cabin.id}`}
                    className={`store ${isHighlighted ? 'visible highlighted' : 'visible'} cursor-pointer p-3 rounded ${
                      isHighlighted ? 'bg-[#f5f0e6] border-2 border-[#7c2c00]' : 'border border-[#d4c4a8] hover:bg-[#f5f0e6]'
                    }`}
                    onClick={() => handleCabinClick(cabin)}
                  >
                    <div className="store">
                      <div className="title mb-2">
                        <h3 className="text-[16px] font-bold text-[#7c2c00]">{cabin.title}</h3>
                      </div>
                      <div className="address">
                        <div className="map-image mb-2">
                          <Image
                            src={imageUrl}
                            alt={cabin.title ?? ''}
                            width={230}
                            height={105}
                            className="w-full h-auto rounded"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = '/images/default-cabin.jpg'
                            }}
                          />
                        </div>
                        <div className="map-bedrooms text-[14px] text-[#533e27] mb-2">
                          {cabin.bedrooms || 'N/A'}
                          {cabin.sleeps ? ` ~ Sleeps ${cabin.sleeps}` : ''}
                        </div>
                        <div className="map-link">
                          <Link
                            href={`/cabin/${cabinSlug}`}
                            className="text-[14px] text-[#7c2c00] hover:text-[#b7714b] underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View this cabin
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
