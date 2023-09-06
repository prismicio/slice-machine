/**
 * @typedef {import("@prismicio/client").Content.CallToActionSlice} CallToActionSlice
 *
 * @typedef {import("@prismicio/react").SliceComponentProps<CallToActionSlice>} CallToActionProps
 * @param {CallToActionProps}
 */

import { PrismicRichText } from "@prismicio/react";
import { isFilled, asText } from "@prismicio/client";

const CallToAction = ({ slice }) => {
  const alignement = slice.variation === "alignLeft" ? "left" : "center";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="es-bounded es-call-to-action"
    >
      <div className="es-bounded__content es-call-to-action__content">
        {slice.primary.image?.url && (
          <img
            height={600}
            width={800}
            src={slice.primary.image.url}
            alt={slice.primary.image.alt ?? undefined}
            className="es-call-to-action__image"
          />
        )}
        <div className="es-call-to-action__content">
          {isFilled.richText(slice.primary.title) && (
            <h2 className="es-call-to-action__content__heading">
              {asText(slice.primary.title)}
            </h2>
          )}
          {isFilled.richText(slice.primary.paragraph) && (
            <div className="es-call-to-action__content__paragraph">
              <PrismicRichText field={slice.primary.paragraph} />
            </div>
          )}
        </div>
        <button
          field={slice.primary.buttonLink}
          className="es-call-to-action__button"
        >
          {slice.primary.buttonLabel || "Learn more…"}
        </button>
      </div>
      <style>
        {`
			  .es-call-to-action {
				background-color: #fff;
				color: #333;
				padding: 8vw 2rem;
			  }
			  
			  .es-call-to-action__content {
				display: grid;
				gap: 2rem;
			  }
			
			  .es-call-to-action__image {
				max-width: 14rem;
				justify-self: ${alignement};
			  }
			  
			  .es-call-to-action__content {
				display: grid;
				gap: 1rem;
				justify-items: ${alignement};
			  }
			  
			  .es-call-to-action__content__heading {
				font-size: 2rem;
				font-weight: 700;
				text-align: ${alignement};
			  }
			  
			  .es-call-to-action__content__paragraph {
				font-size: 1.15rem;
				max-width: 38rem;
				text-align: ${alignement};
			  }
			  
			  .es-call-to-action__button {
				justify-self: ${alignement};
				border-radius: 0.25rem;
				display: inline-block;
				font-size: 0.875rem;
				line-height: 1.3;
				padding: 1rem 2.625rem;
				text-align: ${alignement};
				transition: background-color 100ms linear;
				background-color: #16745f;
				color: #fff;
			  }

			  .es-call-to-action__button:hover {
				background-color: #0d5e4c;
			  }
			  `}
      </style>
    </section>
  );
};

export default CallToAction;
