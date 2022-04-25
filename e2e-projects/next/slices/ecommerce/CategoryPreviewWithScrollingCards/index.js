import React from 'react'
import { PrismicRichText, PrismicLink } from '@prismicio/react'

const CategoryPreviewWithScrollingCards = ({ slice }) => (
  <section>
    <div className="bg-white">
      <div className="py-16 sm:py-24 xl:max-w-7xl xl:mx-auto xl:px-8">
        <div className="px-4 sm:px-6 sm:flex sm:items-center sm:justify-between lg:px-8 xl:px-0">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900"><PrismicRichText field={slice.primary.title} /></h2>
          <PrismicLink document={slice.primary.CTALink} className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
            <span >{ slice.primary.CTA }</span><span aria-hidden="true"> &rarr;</span>
          </PrismicLink>
        </div>

        <div className="mt-4 flow-root">
          <div className="-my-2">
            <div className="box-content py-2 relative h-80 overflow-x-auto xl:overflow-visible">
              <div className="absolute min-w-screen-xl px-4 flex space-x-8 sm:px-6 lg:px-8 xl:relative xl:px-0 xl:space-x-0 xl:grid xl:grid-cols-5 xl:gap-x-8">
                {slice.items.map((item) => (
                  <PrismicLink
                    key={item.title}
                    document={item.link}
                    className="relative w-56 h-80 rounded-lg p-6 flex flex-col overflow-hidden hover:opacity-75 xl:w-auto"
                  >
                    <span aria-hidden="true" className="absolute inset-0">
                    <picture>
                      <img
                        src={item.image.url}
                        alt={item.image.alt}
                        className="w-full h-full object-center object-cover"
                      />
                    </picture>
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                    />
                    <span className="relative mt-auto text-center text-xl font-bold text-white">{ item.title }</span>
                  </PrismicLink>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 sm:hidden">
          <PrismicLink document={slice.primary.CTALink} className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          <span >{ slice.primary.CTA }</span><span aria-hidden="true"> &rarr;</span>
          </PrismicLink>
        </div>
      </div>
    </div>
  </section>
)

export default CategoryPreviewWithScrollingCards