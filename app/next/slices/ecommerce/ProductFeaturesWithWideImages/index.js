import React from 'react'
import { PrismicRichText } from '@prismicio/react'
import * as prismicH from '@prismicio/helpers'

const ProductFeaturesWithWideImages = ({ slice }) => (
  <section>
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-24 sm:py-32 sm:px-2 lg:px-4">
        <div className="max-w-2xl mx-auto px-4 lg:max-w-none">
          <div className="max-w-3xl">
            <h2 className="font-semibold text-gray-500">{prismicH.asText(slice.primary.title)}</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{prismicH.asText(slice.primary.description)}</p>
            <p className="mt-4 text-gray-500">{prismicH.asText(slice.primary.subtitle)}</p>
          </div>

          <div className="space-y-16 pt-10 mt-10 border-t border-gray-200 sm:pt-16 sm:mt-16">
            {slice.items.map((item) => (
              <div
                key={item.title}
                className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-x-8 lg:items-center"
              >
                <div className="mt-6 lg:mt-0 lg:col-span-5 xl:col-span-4">
                  <h3 className="text-lg font-medium text-gray-900"><PrismicRichText field={item.title} /></h3>
                  <p className="mt-2 text-sm text-gray-500"><PrismicRichText field={item.description} /></p>
                </div>
                <div className="flex-auto lg:col-span-7 xl:col-span-8">
                  <div className="aspect-w-5 aspect-h-2 rounded-lg bg-gray-100 overflow-hidden">
                  <picture>
                    {item.image.mobile
                      ? <source srcSet={item.image.mobile.url} media="(max-width: 640px)"/>
                      : <div/>
                    }
                    <img
                      src={item.image.url}
                      alt={item.image.alt}
                      className="object-center object-cover"
                    />
                  </picture>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default ProductFeaturesWithWideImages