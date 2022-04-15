import React from 'react'
import { PrismicLink } from '@prismicio/react'
import * as prismicH from '@prismicio/helpers'

const PromoSectionFadingBackgroundTestimonials = ({ slice }) => (
  <section>
    <div className="bg-white relative overflow-hidden">
      {/* Decorative background image and gradient */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 max-w-7xl mx-auto overflow-hidden xl:px-8">
          <img
            src={slice.primary.image.url}
            alt={slice.primary.image.alt}
            className="w-full h-full object-center object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-white bg-opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white" />
      </div>

      {/* Callout */}
      <section
        aria-labelledby="sale-heading"
        className="relative max-w-7xl mx-auto pt-32 px-4 flex flex-col items-center text-center sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <h2
            id="sale-heading"
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
          >
            {prismicH.asText(slice.primary.title)}
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-xl text-gray-600">
            {prismicH.asText(slice.primary.description)}
          </p>
          <PrismicLink
            document={slice.primary.link}
            className="mt-6 inline-block w-full bg-gray-900 border border-transparent rounded-md py-3 px-8 font-medium text-white hover:bg-gray-800 sm:w-auto"
          >
            {slice.primary.cta}
          </PrismicLink>
        </div>
      </section>

      {/* Testimonials */}
      <section
        aria-labelledby="testimonial-heading"
        className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:py-32 lg:px-8"
      >
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <h2 id="testimonial-heading" className="text-2xl font-extrabold tracking-tight text-gray-900">
            {slice.primary.quotesTitle}
          </h2>

          <div className="mt-16 space-y-16 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
            {slice.items.map((testimonial,index) => (
              <blockquote key={index} className="sm:flex lg:block">
                <svg
                  width={24}
                  height={18}
                  viewBox="0 0 24 18"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="flex-shrink-0 text-gray-300"
                >
                  <path
                    d="M0 18h8.7v-5.555c-.024-3.906 1.113-6.841 2.892-9.68L6.452 0C3.188 2.644-.026 7.86 0 12.469V18zm12.408 0h8.7v-5.555C21.083 8.539 22.22 5.604 24 2.765L18.859 0c-3.263 2.644-6.476 7.86-6.451 12.469V18z"
                    fill="currentColor"
                  />
                </svg>
                <div className="mt-8 sm:mt-0 sm:ml-6 lg:mt-10 lg:ml-0">
                  <p className="text-lg text-gray-600">{testimonial.quote}</p>
                  <cite className="mt-4 block font-semibold not-italic text-gray-900">{testimonial.attribution}</cite>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  </section>
)

export default PromoSectionFadingBackgroundTestimonials