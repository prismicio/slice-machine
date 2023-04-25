import React from 'react'
import { PrismicLink } from '@prismicio/react'
import * as prismicH from '@prismicio/helpers'


const PromoSectionFullWidthWithOverlappingImageTiles = ({ slice }) => (
  <section>
    <div className="bg-white">
      <div className="pt-32 overflow-hidden sm:pt-14">
        <div className="bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative pt-48 pb-16 sm:pb-24">
              <div>
                <h2 id="sale-heading" className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  {prismicH.asText(slice.primary.title1)}
                  <br />
                  {prismicH.asText(slice.primary.title2)}
                </h2>
                <div className="mt-6 text-base">
                  <PrismicLink document={slice.primary.ctaLink} className="font-semibold text-white">
                  {slice.primary.linkLabel}<span aria-hidden="true"> &rarr;</span>
                  </PrismicLink>
                </div>
              </div>

              <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 sm:top-6 sm:translate-x-0">
                <div className="ml-24 flex space-x-6 min-w-max sm:ml-3 lg:space-x-8">
                  <div className="flex space-x-6 sm:flex-col sm:space-x-0 sm:space-y-6 lg:space-y-8">
                    <div className="flex-shrink-0">
                      <img
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        src={slice.primary.image1.url}
                        alt={slice.primary.image1.alt}
                      />
                    </div>

                    <div className="mt-6 flex-shrink-0 sm:mt-0">
                      <img
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        src={slice.primary.image2.url}
                        alt={slice.primary.image2.alt}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-6 sm:-mt-20 sm:flex-col sm:space-x-0 sm:space-y-6 lg:space-y-8">
                    <div className="flex-shrink-0">
                      <img
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        src={slice.primary.image3.url}
                        alt={slice.primary.image3.alt}
                      />
                    </div>

                    <div className="mt-6 flex-shrink-0 sm:mt-0">
                      <img
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        src={slice.primary.image4.url}
                        alt={slice.primary.image4.alt}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-6 sm:flex-col sm:space-x-0 sm:space-y-6 lg:space-y-8">
                    <div className="flex-shrink-0">
                      <img
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        src={slice.primary.image5.url}
                        alt={slice.primary.image5.alt}
                      />
                    </div>

                    <div className="mt-6 flex-shrink-0 sm:mt-0">
                      <img
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        src={slice.primary.image6.url}
                        alt={slice.primary.image6.alt}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default PromoSectionFullWidthWithOverlappingImageTiles