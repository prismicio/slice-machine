import React from 'react'
import { PrismicLink, PrismicRichText } from '@prismicio/react'

const PromoSectionWithBackgroundImage = ({ slice }) => (
  <section>
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0">
          {
            slice.variation === "cameraInsurance"?
              <img
                src="https://images.prismic.io/demo-sm-next-ecom/0567d49b-d030-4f8b-8283-f3ad21b170ca_cam-17.jpg?auto=compress,format&fit=crop&h=482&w=1216&q=80"
                alt=""
                className="w-full h-full object-center object-cover"
              />
              :
              <img
                src={slice.primary.image.url}
                alt={slice.primary.image.alt}
                className="w-full h-full object-center object-cover"
              />
          }
          </div>
          <div className="relative bg-gray-900 bg-opacity-75 py-32 px-6 sm:py-40 sm:px-12 lg:px-16">
            <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {
                slice.variation === "cameraInsurance"?
                <span className="block sm:inline">Camera Insurance</span>
                :
                <span className="block sm:inline"><PrismicRichText field={slice.primary.title} /></span>
              }
              </h2>
              <div className="mt-3 text-xl text-white">
              {
                slice.variation === "cameraInsurance"?
                <p>Keep your favorite companion safe wherever you go</p>
                :
                <PrismicRichText field={slice.primary.description} />
              }
              </div>
              {
                slice.variation === "cameraInsurance"?
                <PrismicLink
                  document={slice.primary.link}
                  className="mt-8 w-full block bg-white border border-transparent rounded-md py-3 px-8 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
                >
                  <span >Get Started Right Here</span>
                </PrismicLink>
                :
                <PrismicLink
                  document={slice.primary.link}
                  className="mt-8 w-full block bg-white border border-transparent rounded-md py-3 px-8 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
                >
                  <span >{ slice.primary.linkLabel }</span>
                </PrismicLink>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default PromoSectionWithBackgroundImage