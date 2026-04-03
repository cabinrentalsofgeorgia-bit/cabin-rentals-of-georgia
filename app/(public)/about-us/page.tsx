import { Suspense } from 'react'
import { AboutUs, getAboutUs } from '@/lib/api/about-us'
import { cleanHtmlContent } from '@/lib/utils/html-utils'
import PageLoading from '@/components/ui/PageLoading'
import ProcessedHTML from '@/components/content/ProcessedHTML'

export const metadata = {
  title: 'About Us - Cabin Rentals of Georgia',
  description: 'Learn about Cabin Rentals of Georgia and our commitment to providing exceptional vacation experiences',
}

async function fetchAboutUs(): Promise<AboutUs | null> {
  try {
    const data = await getAboutUs()
    return data
  } catch (error) {
    console.error('Error fetching About Us:', error)
    return null
  }
}

async function AboutUsContent() {
  const aboutUs = await fetchAboutUs()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {aboutUs ? (
          <>
            <h1 className="text-4xl font-bold mb-8">{aboutUs.title}</h1>
            
            {aboutUs.body ? (
              <ProcessedHTML
                html={cleanHtmlContent(aboutUs.body)}
                className="prose prose-legacy mx-auto mb-8 block"
              />
            ) : (
              <div className="prose prose-legacy mx-auto mb-8">
                <p className="text-lg text-gray-700 mb-6">
                  Welcome to Cabin Rentals of Georgia, your premier destination for luxury cabin rentals 
                  in the beautiful North Georgia mountains. We specialize in providing exceptional vacation 
                  experiences in some of the most stunning locations in Georgia.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-8">About Cabin Rentals of Georgia</h1>
            
            <div className="prose prose-legacy mx-auto mb-8">
              <p className="text-lg text-gray-700 mb-6">
                Welcome to Cabin Rentals of Georgia, your premier destination for luxury cabin rentals 
                in the beautiful North Georgia mountains. We specialize in providing exceptional vacation 
                experiences in some of the most stunning locations in Georgia.
              </p>
              
              <p className="text-lg text-gray-700 mb-6">
                Our carefully curated collection of cabins offers something for everyone - from cozy 
                romantic retreats to spacious family lodges. Whether you&apos;re seeking a mountain view, 
                river frontage, or lake access, we have the perfect cabin for your getaway.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                Our mission is to provide our guests with unforgettable vacation experiences in 
                beautifully maintained, well-equipped cabins. We strive to exceed expectations and 
                create lasting memories for every guest.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us</h2>
              <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 mb-6">
                <li>Premium locations with stunning views</li>
                <li>Fully equipped cabins with modern amenities</li>
                <li>24/7 customer support</li>
                <li>Easy online booking system</li>
                <li>Local expertise and recommendations</li>
                <li>Commitment to cleanliness and maintenance</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-lg text-gray-700 mb-2">
                  <strong>Phone:</strong>{' '}
                  <a href="tel:8006095170" className="text-blue-600 hover:text-blue-800">
                    (800) 609-5170
                  </a>{' '}
                  or{' '}
                  <a href="tel:7066322246" className="text-blue-600 hover:text-blue-800">
                    706-632-2246
                  </a>
                </p>
                <p className="text-lg text-gray-700 mb-2">
                  <strong>Address:</strong> 801 E Main Street Ste B, Blue Ridge, GA 30513
                </p>
                <p className="text-lg text-gray-700">
                  <strong>Hours:</strong> Monday-Friday 8:30 AM - 5:30 PM, Saturday-Sunday 9:30 AM - 4:30 PM
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default async function AboutPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading about us information..." variant="container" />}>
      <AboutUsContent />
    </Suspense>
  )
}

