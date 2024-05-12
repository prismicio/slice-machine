<script setup>
import { isFilled } from "@prismicio/client";

defineProps(getSliceComponentProps(["slice", "index", "slices", "context"]));
</script>

<template>
	<section
		:data-slice-type="slice.slice_type"
		:data-slice-variation="slice.variation"
		class="es-bounded es-customer-logos"
	>
		<div class="es-bounded__content es-customer-logos__content">
			<div
				v-if="isFilled.richText(slice.primary.eyebrowHeadline)"
				class="es-customer-logos__heading"
			>
				<PrismicRichText :field="slice.primary.eyebrowHeadline" />
			</div>
			<ul
				v-if="slice.primary.logos.length > 0"
				class="es-customer-logos__logos"
			>
				<li
					v-for="logo in slice.primary.logos"
					:key="logo.image.url"
					class="es-customer-logos__logo"
				>
					<PrismicLink :field="logo.link">
						<PrismicImage
							:field="logo.image"
							:height="26"
							:width="160"
							class="es-customer-logos__logo__link__image"
						/>
					</PrismicLink>
				</li>
			</ul>
			<PrismicLink
				:field="slice.primary.callToActionLink"
				class="es-customer-logos__button"
			>
				{{ slice.primary.callToActionLabel || "Learn more..." }}
			</PrismicLink>
		</div>
	</section>
</template>

<style>
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
}

.es-customer-logos {
	font-family: system-ui, sans-serif;
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

.es-customer-logos__heading * {
	margin: 0;
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
</style>
