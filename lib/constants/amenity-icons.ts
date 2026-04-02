/**
 * Maps humanised amenity names → PNG icon paths for the cabin hero icon strip.
 * Keys MUST match the output of `humanise_amenity()` on the backend.
 */
export const amenityIcons: Record<string, string> = {
  // Connectivity
  "Wi-Fi":               '/images/icons/icon_internet_0.png',
  "High Speed Internet": '/images/icons/icon_internet_0.png',

  // Relaxation / Spa
  "Hot Tub":             '/images/icons/icon_hot_tub_0.png',

  // Kitchen
  "Coffee Pot":          '/images/icons/icon_keurig2.png',
  "Coffee Maker":        '/images/icons/icon_keurig2.png',

  // Grills
  "Gas Grill":           '/images/icons/icon_gas_grill.png',
  "BBQ Grill":           '/images/icons/icon_gas_grill.png',
  "Charcoal Grill":      '/images/icons/icon_gas_grill.png',

  // Fireplaces
  "Outdoor Fireplace":   '/images/icons/icon_outdoor_fireplace_0.png',
  "Outdoor Fireplaces":  '/images/icons/icon_outdoor_fireplace_0.png',
  "Indoor Fireplace":    '/images/icons/icon_indoor_fireplace_0.png',
  "Indoor Fireplaces":   '/images/icons/icon_indoor_fireplace_0.png',
  "Fireplace":           '/images/icons/icon_indoor_fireplace_0.png',

  // Policy
  "Non-Smoking":         '/images/icons/icon_no_smoking_0.png',

  // Pets
  "Pet-Friendly":        '/images/icons/icon_pets.png',

  // Games & Entertainment
  "Game Room":           '/images/icons/icon_video_games_0.png',
  "Games":               '/images/icons/icon_video_games_0.png',
  "Foosball Table":      '/images/icons/icon_video_games_0.png',
  "Shuffleboard":        '/images/icons/icon_video_games_0.png',
  "Pool Table":          '/images/icons/icon_billiards_0.png',
  "Billiard Table":      '/images/icons/icon_billiards_0.png',

  // Water / Outdoor access
  "River Access":        '/images/icons/icon_boat_dock.png',
  "Lake Access":         '/images/icons/icon_boat_dock.png',
  "Fish & Tube from Property": '/images/icons/icon_boat_dock.png',

  // Activities (map to closest available icon)
  "Fly Fishing":         '/images/icons/icon_boat_dock.png',
  "Hiking Trails":       '/images/icons/icon_internet_0.png',
  "Waterfall Hike":      '/images/icons/icon_internet_0.png',

  // Motorcycle
  "Motorcycle Friendly": '/images/icons/motorcycle_icon_4.25KB_matched.png',
}
