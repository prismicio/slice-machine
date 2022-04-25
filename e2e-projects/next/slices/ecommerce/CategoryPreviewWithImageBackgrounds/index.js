import React from 'react'
import { PrismicRichText, PrismicLink } from '@prismicio/react'

const CategoryPreviewWithImageBackgrounds = ({ slice }) => (
  <section>
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-baseline sm:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900"><PrismicRichText field={slice.primary.title} /></h2>
          <PrismicLink document={slice.primary.link} className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
            <span >{ slice.primary.linkLabel }</span><span aria-hidden="true"> &rarr;</span>
          </PrismicLink>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
          <div className="group aspect-w-2 aspect-h-1 rounded-lg overflow-hidden sm:aspect-h-1 sm:aspect-w-1 sm:row-span-2">
            <picture>
              {slice.primary.imageLeft.mobile
                ? <source srcSet={slice.primary.imageLeft.mobile.url} media="(max-width: 640px)"/>
                : <div/>
              }
              <img
                src={slice.primary.imageLeft.url}
                alt={slice.primary.imageLeft.alt}
                className="object-center object-cover group-hover:opacity-75"
              />
            </picture>
            <div aria-hidden="true" className="bg-gradient-to-b from-transparent to-black opacity-50" />
            <div className="p-6 flex items-end">
              <div>
                <h3 className="font-semibold text-white">
                  <PrismicLink document={slice.primary.leftImageLink}>
                    <span className="absolute inset-0" />
                    { slice.primary.imageLeftTitle }
                  </PrismicLink>
                </h3>
                <p aria-hidden="true" className="mt-1 text-sm text-white">
                { slice.primary.imageLeftCta }
                </p>
              </div>
            </div>
          </div>
          <div className="group aspect-w-2 aspect-h-1 rounded-lg overflow-hidden sm:relative sm:aspect-none sm:h-full">
            <img
              src={slice.primary.imageTopRight.url} 
              alt={slice.primary.imageTopRight.alt}
              className="object-center object-cover group-hover:opacity-75 sm:absolute sm:inset-0 sm:w-full sm:h-full"
            />
            <div
              aria-hidden="true"
              className="bg-gradient-to-b from-transparent to-black opacity-50 sm:absolute sm:inset-0"
            />
            <div className="p-6 flex items-end sm:absolute sm:inset-0">
              <div>
                <h3 className="font-semibold text-white">
                  <PrismicLink document={slice.primary.topRightImageLink}>
                    <span className="absolute inset-0" />
                    { slice.primary.imageTopRightTitle }
                  </PrismicLink>
                </h3>
                <p aria-hidden="true" className="mt-1 text-sm text-white">
                  { slice.primary.imageTopRightCta }
                </p>
              </div>
            </div>
          </div>
          <div className="group aspect-w-2 aspect-h-1 rounded-lg overflow-hidden sm:relative sm:aspect-none sm:h-full">
            <img
              src={slice.primary.imageBottomRight.url}
              alt={slice.primary.imageBottomRight.alt}
              className="object-center object-cover group-hover:opacity-75 sm:absolute sm:inset-0 sm:w-full sm:h-full"
            />
            <div
              aria-hidden="true"
              className="bg-gradient-to-b from-transparent to-black opacity-50 sm:absolute sm:inset-0"
            />
            <div className="p-6 flex items-end sm:absolute sm:inset-0">
              <div>
                <h3 className="font-semibold text-white">
                  <PrismicLink document={slice.primary.bottomRightImageLink}>
                    <span className="absolute inset-0" />
                    { slice.primary.imageBottomRightTitle }
                  </PrismicLink>
                </h3>
                <p aria-hidden="true" className="mt-1 text-sm text-white">
                  { slice.primary.imageBottomRightCta }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:hidden">
          <a href="#" className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          { slice.primary.linkLabel }<span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  </section>
)

export default CategoryPreviewWithImageBackgrounds