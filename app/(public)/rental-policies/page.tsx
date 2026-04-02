import { Suspense } from 'react'
import { Policy, getRentalPolicies } from '@/lib/api/policies'
import { cleanHtmlContent } from '@/lib/utils/html-utils'
import PageLoading from '@/components/ui/PageLoading'
import ProcessedHTML from '@/components/content/ProcessedHTML'

export const metadata = {
  title: 'Rental Policies - Cabin Rentals of Georgia',
  description: 'Review our rental policies, terms and conditions',
}

async function fetchRentalPolicies(): Promise<Policy | null> {
  try {
    const data = await getRentalPolicies()
    return data
  } catch (error) {
    console.error('Error fetching Rental Policies:', error)
    return null
  }
}

async function RentalPoliciesContent() {
  const policy = await fetchRentalPolicies()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {policy ? (
          <>
            <h1 className="text-4xl font-bold mb-8">{policy.title}</h1>
            
            {policy.body ? (
              <ProcessedHTML
                html={cleanHtmlContent(policy.body)}
                className="prose prose-legacy mx-auto mb-8 block"
              />
            ) : (
              <div className="space-y-6">
                <p>
                  No policy content available at the moment. Please check back later.
                </p>
              </div>
            )}
          </>
        ) : (
          <p>No policy content available at the moment. Please check back later.</p>
        )}
      </div>
    </div>
  )
}

export default async function RentalPoliciesPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading rental policies..." variant="container" />}>
      <RentalPoliciesContent />
    </Suspense>
  )
}

