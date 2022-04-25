import React from 'react'
import { PrismicRichText } from '@prismicio/react'

const FeaturedSectionCentered22 = ({ slice }) => (
  <section>
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Transactions</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
           <PrismicRichText field={slice.primary.title} />
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            <PrismicRichText field={slice.primary.description} />
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {slice.items?.map((feature) => (
              <div key={feature.title} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <img
                      className="h-6 w-6" aria-hidden="true"
                      src={feature.icon.url}
                      alt={feature.icon.alt}
                      width={6}
                      height={6}
                    />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900"><PrismicRichText field={feature.title}/></p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500"><PrismicRichText field={feature.description}/></dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  </section>
)

export default FeaturedSectionCentered22