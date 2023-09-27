import { Content, isFilled, asText } from "@prismicio/client";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";

export type PascalNameToReplaceProps =
	SliceComponentProps<Content.PascalNameToReplaceSlice>;

const PascalNameToReplace = ({
	slice,
}: PascalNameToReplaceProps): JSX.Element => {
	return (
		<section
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			className="es-bounded es-customer-logos"
		>
			<div className="es-bounded__content es-customer-logos__content">
				{isFilled.richText(slice.primary.eyebrowHeadline) && (
					<h2 className="es-customer-logos__heading">
						{asText(slice.primary.eyebrowHeadline)}
					</h2>
				)}
				{slice.items.length > 0 && (
					<ul className="es-customer-logos__logos">
						{slice.items.map(
							(item) =>
								isFilled.image(item.image) && (
									<li key={item.image.url} className="es-customer-logos__logo">
										<PrismicNextLink
											field={item.link}
											className="es-customer-logos__link"
										>
											<PrismicNextImage
												field={item.image}
												height={26}
												width={160}
												className="es-customer-logos__logo__link__image"
											/>
										</PrismicNextLink>
									</li>
								),
						)}
					</ul>
				)}
				<PrismicNextLink
					field={slice.primary.callToActionLink}
					className="es-customer-logos__button"
				>
					{slice.primary.callToActionLabel || "Learn more..."}
				</PrismicNextLink>
			</div>
			<style>
				{`
						.es-bounded {
							margin: 0px;
							min-width: 0px;
							position: relative;
							padding: 8vw 1.25rem;
						}

						.es-bounded__content {
							min-width: 0px;
							max-width: 90%;
							margin: 0px auto;
							font-family: system-ui, sans-serif;
						}

						.es-customer-logos {
							background-color: #f4f0ec;
							color: #333;
						}
						
						.es-customer-logos__content {
							display: grid;
							gap: 2rem;
							justify-items: center;
						}
						
						.es-customer-logos__heading {
							color: #8592e0;
							font-size: 1.5rem;
							font-weight: 500;
							text-align: center;
						}
						
						.es-customer-logos__logos {
							display: grid;
							grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
							grid-column-gap: 1.25rem;
							grid-row-gap: 2rem;
							align-items: center;
							list-style-type: none;
							width: 100%;
						}
						
						@media (min-width: 1200px) {
							.es-customer-logos__logos {
								margin-left: -3rem;
							}
						}
						
						.es-customer-logos__logo {
							margin: 0;
							display: flex;
							justify-content: center;
						}
						
						@media (min-width: 1200px) {
							.es-customer-logos__logo {
								margin-left: 3rem;
							}
						}
						
						.es-customer-logos__logo__link__image {
							max-width: 10rem;
						}
						
						.es-customer-logos__button {
							justify-self: center;
							text-decoration: underline;
						}
					`}
			</style>
		</section>
	);
};

export default PascalNameToReplace;
