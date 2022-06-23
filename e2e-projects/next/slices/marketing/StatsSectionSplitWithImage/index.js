import React from 'react'
import { PrismicRichText } from '@prismicio/react'

const StatsSectionSplitWithImage = ({ slice }) => (
  <section>
    <div className="relative bg-white">
      <div className="h-56 bg-indigo-600 sm:h-72 lg:absolute lg:left-0 lg:h-full lg:w-1/2">
        <img
          className="w-full h-full object-cover"
          src={slice.primary.icon.url}
          alt={slice.primary.icon.alt}
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:py-16">
        <div className="max-w-2xl mx-auto lg:max-w-none lg:mr-0 lg:ml-auto lg:w-1/2 lg:pl-10">
          <div>
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <img
                      className="h-6 w-6" aria-hidden="true"
                      src={slice.primary.icon.url}
                      alt={slice.primary.icon.alt}
                    />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            <PrismicRichText field={slice.primary.title} />
          </h2>
          <p className="mt-6 text-lg text-gray-500">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore nihil ea rerum ipsa. Nostrum consectetur
            sequi culpa doloribus omnis, molestiae esse placeat, exercitationem magnam quod molestias quia aspernatur
            deserunt voluptatibus.
          </p>
          <div className="mt-8 overflow-hidden">
            <dl className="-mx-8 -mt-8 flex flex-wrap">
              {slice.items?.map((feature,index) => (
              <div key={index} className="flex flex-col px-8 pt-8">
                <dt className="order-2 text-base font-medium text-gray-500"><PrismicRichText field={feature.unit}/></dt>
                <dd className="order-1 text-2xl font-extrabold text-indigo-600 sm:text-3xl"><PrismicRichText field={feature.stats}/></dd>
              </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default StatsSectionSplitWithImage