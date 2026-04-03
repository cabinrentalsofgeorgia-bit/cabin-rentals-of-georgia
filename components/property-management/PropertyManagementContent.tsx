'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const whatYouGetData = [
  {
    title: 'Free Onboarding',
    items: [
      'Professional photography',
      'Custom copywriting',
      'Search engine optimization',
      'Design/amenity recommendations',
    ],
  },
  {
    title: 'Managing Details',
    items: [
      'Unique pricing',
      'Taxes and licensing',
      'Professional cleaning',
      'Regular inspections',
    ],
  },
  {
    title: 'Guest Experience',
    items: [
      'Enthusiastic agents',
      'VIP guest app',
      '24/7 guest services',
      'Smart-home technology',
    ],
  },
]

const testimonials = [
  {
    id: 1,
    text: "Gary Knight has a keen attention to detail in how he runs his business. CRG pays a great deal of attention to detail in screening renters, conducting pre and post rental property checks, and communication to owners when needed. We are confident that CRG is looking out for us as if they owned the property.",
  },
  {
    id: 2,
    text: "I just wanted to say \"thank you\" for supporting Jan and I during these past seven years. Sometimes when we think of the large investment we have in Blue Ridge (550 miles away from our home) it is very comforting to know we have a partnership with Cabin Rentals of Georgia and the you are taking care of our cabin.",
  },
  {
    id: 3,
    text: "Cabin Rentals of Georgia and Gary Knight provided the access to the rental market I wanted, with the least amount of wear on the property. We have been using Cabin Rentals of Georgia since 2017, and I have been very pleased with the attention to detail and the care of our property. The amount of revenue generated has been beyond my expectations.",
  },
  {
    id: 4,
    text: "For six years, my family rented multiple properties from Cabin Rentals of Georgia. They have paid attention to the smallest of details. We purchased a cabin in Blue Ridge and immediately turned the house over to the CRG management team. When we visit the house, it is in impeccable shape, proving the property receives round-the-clock attention. We strongly endorse CRG.",
  },
  {
    id: 5,
    text: "Your focus on quality of customer and attention to detail managing your housekeepers on the proper process to clean our home has resulted in our cabin looking as good as it did when we finished building it three years ago.",
  },
  {
    id: 6,
    text: "You continue to get top dollar which has resulted in a renter who is more established and family-oriented. History has proven this type of renter takes better care of our cabin than renter who only look at price.",
  },
  {
    id: 7,
    text: "After much research and due diligence, we chose Cabin Rentals of Georgia. Gary and Lissa Knight are very passionate about their business and the care they take of our property reflects this. Revenue has exceeded our expectations as CRG obviously has the  formula for success.",
  },
  {
    id: 8,
    text: "The team at CRG is professional and cheerful. Our house is cleaned so thoroughly reflecting the quality of the cleaning staff. They have found that fine balance between providing first class service to their customers while ensuring the interest of the homeowners are protected.",
  },
]

export default function PropertyManagementContent() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-[-1px] min-h-full mt-0 relative h-auto  align-top">
      {/* Header Section - What is my revenue potential? */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-center">
        <div className="w-[45%] min-h-[350px] bg-[#372d1f]  pt-[80px] max-[1010px]:min-h-[280px] max-[767px]:w-full max-[767px]:py-[45px] max-[767px]:min-h-[0px]">
          <h3 className="text-[40px] font-bold text-white mt-0 leading-[40px] max-[1010px]:text-[32px] max-[1010px]:leading-[32px] max-[767px]:text-[30px] max-[767px]:leading-[30px]">
            What is my <br className="max-[767px]:hidden" />revenue potential?
          </h3>
          <p className="text-[28px] text-white font-normal max-[1010px]:text-[20px] max-[767px]:text-[19px]">Call (706) 432-2140</p>
        </div>
        <div className="w-[55%] min-h-[350px] bg-[url('/images/bg_top_fireplace.jpg')] bg-cover bg-bottom max-[1010px]:min-h-[280px] max-[767px]:hidden"></div>
      </div>

      {/* What You Get Section */}
      <div className="p-[35px_25px] bg-[#f9f9d7] text-[#372d1f]">
        <h4 className="text-[32px] text-center italic leading-[32px] m-0 pb-[32px]">What You Get With Cabin Rentals of Georgia</h4>
        <div className="flex flex-row justify-center gap-[40px] pb-[10px] max-[1010px]:gap-[15px] flex-wrap ">
          {whatYouGetData.map((section) => (
            <div key={section.title} className="text-[22px] min-w-[210px] font-normal">
              <div className="text-[22px] mb-[15px] leading-[22px] max-[1010px]:text-[20px] max-[1010px]:leading-[20px]">{section.title}</div>
              <ul className="text-[16px] space-y-[8px]">
                {section.items.map((item) => (
                  <li className='pl-[20px] bg-[url("/images/bullet_star.png")] bg-no-repeat bg-left-4' key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="bg-[url('/images/scroll_divider.png')] h-[20px] bg-no-repeat bg-center mx-auto mt-[20px] bg-[length:95%]"></div>
        <div className="rating-logos flex flex-wrap justify-center items-center gap-6 mt-8">
          <Image src="/images/vrbo_premier_host.png" alt="VRBO Premier Host" width={150} height={75} className="object-contain" />
          <Image src="/images/google_5star.png" alt="Google 5 Stars" width={150} height={75} className="object-contain" />
          <Image src="/images/fannin_county.png" alt="Fannin County Chamber of Commerce" width={150} height={75} className="object-contain" />
        </div>
      </div>

      {/* Maximize Income Section */}
      <div className="p-[35px_25px] bg-[#eae2af] text-[#372d1f]  text-center ">
        <h4 className="text-[32px] italic leading-[32px] m-0 pb-[32px]">Maximize Income with Peace of Mind</h4>
        <div className="grid grid-cols-4 gap-[40px] pb-[10px] max-[1010px]:gap-[15px] max-[1010px]:grid-cols-2 max-[767px]:grid-cols-1">
          <div className="basis-1/4 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/expert_revenue_management_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Expert Revenue <br />Management
            </div>
            <div className="text-[16px] space-y-[8px]">
              With over 20 years of hospitality experience in revenue management, we maximize the rental revenue of our homeowners year after year. We constantly analyze our rental rates to ensure that we are keeping up with supply and demand. In addition, our unique pricing models generate thousands more in rental income when compared to other pricing strategies.
            </div>
          </div>
          <div className="basis-1/4 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/powerful_property_marketing_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Powerful Property <br />Marketing
            </div>
            <div className="text-[16px] space-y-[8px]">
              Your home&apos;s exposure across all major marketing channels will be enhanced by our marketing and sales strategy. Third-party booking sites, professional photography, and engaging copywriting all contribute to our cabins&apos; competitive advantage in online searches, along with monthly email blasts, robust social media engagement, and PPC campaigns which increase bookings.
            </div>
          </div>
          <div className="basis-1/4 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/direct_booking_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Direct Booking <br />Strength
            </div>
            <div className="text-[16px] space-y-[8px]">
              Enjoying a strong SEO presence on Google and other top engines, over 70% of our reservations are from direct bookings. We have a very large repeat-guest ratio due to excellent stays, email blasts, and Loyalty Reward Points.
            </div>
          </div>
          <div className="basis-1/4 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/guest_screening_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Guest <br />Screening
            </div>
            <div className="text-[16px] space-y-[8px]">
              Our enhanced vetting services head off potential problems before they occur as well as realizing potential lost income. We keep an accurate guest count (as well as pet information) from the time of booking to the time of arrival and beyond. We continue this screening with a phone call on day of arrival as well as through our Guest Communications app.
            </div>
          </div>
        </div>
      </div>

      {/* Schedule a Call Section */}
      <div className='relative bg-[#f9f9d7] pt-[32px]'>
        <div className="absolute -top-[5px] left-0 w-[100%] bg-[url('/images/scroll_divider.png')] h-[20px] bg-no-repeat bg-center mx-auto bg-[length:95%]"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-[32px]">
            <div className="w-[45%] min-h-[350px] bg-[#372d1f] mx-auto flex justify-center items-center max-[767px]:w-[100%] max-[767px]:min-h-[280px]">
              <div className='max-w-[330px]'>
                <Image src="/images/gary.png" alt='' width={110} height={110} className='object-contain mx-auto mb-[10px]' />
                <h3 className="text-[30px] leading-[30px]  italic font-bold text-white text-center m-0 max-[767px]:text-[24px]">
                  Schedule a call with Gary to find out more that we can do for you.
                </h3>
                <p className="text-[28px] text-white font-normal text-center  max-[767px]:text-[19px]">Call (706) 432-2140</p>
              </div>
            </div>
            <div className="w-[55%] min-h-[350px] bg-[url('/images/bg_schedule_call.jpg')] bg-cover bg-bottom max-[767px]:hidden"></div>
          </div>
      </div>

      {/* Top Notch Property Maintenance Section */}
      <div className="p-[35px_25px] bg-[#f9f9d7] text-[#372d1f] text-center">
        <h4 className="text-[32px] italic leading-[32px] m-0 pb-[32px]">Top Notch Property Maintenance</h4>
        <div className="flex flex-col md:flex-row justify-center gap-[40px] pb-[10px]">
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/professional_house_cleaningB2_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Professional House <br />Keeping
            </div>
            <div className="text-[16px] space-y-[8px]">
              We personally train our Housekeepers on staff to do a thorough and detailed cleaning of your cabin before each arrival. Within our vacation rental software, we implement our own custom check systems and detailed checklists. The system allows for scheduling and communication with our cleaning staff. This ensures they do an exceptional job, resulting in high reviews for our cleanliness.
            </div>
          </div>
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/quality_inspection_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Quality <br />Inspections
            </div>
            <div className="text-[16px] space-y-[8px]">
              Our inspection process delivers a high standard of care. Your home is inspected after each departure to ensure everything is in order. We inspect it again after the Housekeeper cleans, and we inspect again upon guests&apos; arrival to make sure everything is perfect for their arrival.
            </div>
          </div>
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/maintenance_technician_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Maintenance <br />Technicians
            </div>
            <div className="text-[16px] space-y-[8px]">
              Within our vacation rental software we use an extensive checklist making sure our in-house maintenance team walks through your home periodically to ensure that everything is in working order.
            </div>
          </div>
        </div>
      </div>

      {/* VIP Experience Section */}
      <div className="relative p-[35px_25px] bg-[#eae2af] text-[#372d1f]  text-center ">
        <div className="absolute -top-[5px] left-0 w-[100%] bg-[url('/images/scroll_divider.png')] h-[20px] bg-no-repeat bg-center mx-auto bg-[length:95%]"></div>
        <h4 className="text-[32px] italic leading-[32px] m-0 pb-[32px]">VIP Experience for Guests</h4>
        <div className="flex flex-col md:flex-row justify-center gap-[40px] pb-[10px]">
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/vip_experience_app_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              VIP Experience <br />App
            </div>
            <div className="text-[16px] space-y-[8px]">
              All guests are given a direct line of communication with our staff during their stay. Guests can check in and out, use our concierge services, access our destination guide, and even watch instructional videos on the operation of the home&apos;s TVs, gas fireplaces, and more.
            </div>
          </div>
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/royal_treatment_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Exceeding <br />Expectations
            </div>
            <div className="text-[16px] space-y-[8px]">
              While providing excellent customer service through our VIP app along with an informative Destination Guide, we ensure that each guest&apos;s experience is elevated while staying in your home. They know to expect a flawlessly clean and well-maintained home along with luxury amenities. Our concierge services provide guests with day itineraries, fishing trips, grocery shopping and more.
            </div>
          </div>
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/smart_home_tech_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Smart-Home <br />Technology
            </div>
            <div className="text-[16px] space-y-[8px]">
              Our homes are equipped with a directory system that serves as a direct line of communication between our guests and our staff. Our guests can access the directory and watch instructional videos on how to operate the home&apos;s gas fireplaces, TV remotes, and more. Most homes are equipped with keyless door locks and thermostat sensors.
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative pt-[50px]  bg-[#f9f9d7]">
        <div className="absolute -top-[5px] left-0 w-[100%] bg-[url('/images/scroll_divider.png')] h-[20px] bg-no-repeat bg-center mx-auto bg-[length:95%]"></div>
        <div className=" py-[35px] bg-cover bg-[url(/images/bg_testimonials.jpg)]">
          <table className="w-[95%] max-w-[640px] min-h-[185px] mx-auto">
            <tbody>
              <tr>
                <td className="text-white leading-relaxed italic text-[22px]  max-[767px]:text-[19px]">
                  {testimonials[currentTestimonial].text}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Owner Services Section */}
      <div className="p-[35px_25px] bg-[#f9f9d7] text-[#372d1f] text-center">
        <h4 className="text-[32px] italic leading-[32px] m-0 pb-[32px]">Owner Services</h4>
        <div className="flex flex-col md:flex-row justify-center gap-[40px] pb-[10px]">
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/tax_reporting_brn.png" alt="" width={50} height={50} className="object-contain mx-auto " />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Tax <br />Reporting
            </div>
            <div className="text-[16px] space-y-[8px]">
              We facilitate the process of collecting and paying local lodging and occupancy taxes for the city, county, and state. Our accounting team prepares all sales tax payments and reports for you every month.
            </div>
          </div>
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/private_portal_access_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Private Client <br />Portal Access
            </div>
            <div className="text-[16px] space-y-[8px]">
              Enjoy transparent updates through your private portal access giving you a 360º view of your home&apos;s details.
            </div>
          </div>
          <div className="basis-1/3 text-[22px] font-normal">
            <div className="mb-4">
              <Image src="/images/pm_icons/brown/expert_revenue_management_brn.png" alt="" width={50} height={50} className="object-contain mx-auto" />
            </div>
            <div className="text-[22px] mb-[15px] leading-[22px]">
              Contracts and <br />Commission Rates
            </div>
            <div className="text-[16px] space-y-[8px]">
              Honest transparency is essential to a successful partnership, which is why we consider each contract and commission rates individually. It is not our policy to win your business with a low teaser rate and then try to recoup our expenses with hidden fees. Maintaining trust through communication is key.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

