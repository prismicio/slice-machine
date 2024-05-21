<script setup lang="ts">
import { type Content, isFilled } from "@prismicio/client";

defineProps(
	getSliceComponentProps<Content.PascalNameToReplaceSlice>([
		"slice",
		"index",
		"slices",
		"context",
	]),
);
</script>

<template>
	<section
		:data-slice-type="slice.slice_type"
		:data-slice-variation="slice.variation"
		class="es-bounded es-alternate-grid"
	>
		<div
			:class="[
				'es-alternate-grid__content',
				isFilled.image(slice.primary.image)
					? 'es-alternate-grid__content--with-image'
					: '',
			]"
		>
			<PrismicImage
				v-if="isFilled.image(slice.primary.image)"
				:field="slice.primary.image"
				class="es-alternate-grid__image"
				:class="
					slice.variation === 'imageRight'
						? 'es-alternate-grid__image--right'
						: 'es-alternate-grid__image--left'
				"
			/>
			<div class="es-alternate-grid__primary-content">
				<div className="es-alternate-grid__primary-content__intro">
					<div
						v-if="isFilled.keyText(slice.primary.eyebrowHeadline)"
						class="es-alternate-grid__primary-content__intro__eyebrow"
					>
						{{ slice.primary.eyebrowHeadline }}
					</div>
					<PrismicRichText
						v-if="isFilled.richText(slice.primary.title)"
						:field="slice.primary.title"
						class="es-alternate-grid__primary-content__intro__headline"
					/>
					<PrismicRichText
						v-if="isFilled.richText(slice.primary.description)"
						:field="slice.primary.description"
						class="es-alternate-grid__primary-content__intro__description"
					/>
				</div>
				<div
					v-if="slice.primary.items && slice.primary.items.length"
					class="es-alternate-grid__primary-content__items"
				>
					<div
						v-for="(item, i) in slice.primary.items"
						:key="i"
						class="es-alternate-grid__item"
					>
						<PrismicRichText
							v-if="isFilled.richText(item.title)"
							:field="item.title"
							class="es-alternate-grid__item__heading"
						/>
						<PrismicRichText
							v-if="isFilled.richText(item.description)"
							:field="item.description"
							class="es-alternate-grid__item__description"
						/>
					</div>
				</div>
			</div>
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

.es-alternate-grid {
	font-family: system-ui, sans-serif;
	background-color: #fff;
	color: #333;
}

.es-alternate-grid__content {
	display: grid;
	gap: 1.5rem;
	grid-auto-flow: dense;
}

@media (min-width: 640px) {
	.es-alternate-grid__content--with-image {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (min-width: 1200px) {
	.es-alternate-grid__content--with-image {
		grid-template-columns: repeat(2, 1fr);
	}
}

.es-alternate-grid__image {
	width: auto;
	height: auto;
	max-width: 100%;
	align-self: center;
}

.es-alternate-grid__image--left {
	order: 1;
}

.es-alternate-grid__image--left + div {
	order: 2;
}

.es-alternate-grid__image--right {
	order: 2;
}

.es-alternate-grid__image--right + div {
	order: 1;
}

.es-alternate-grid__primary-content {
	display: grid;
	gap: 2rem;
}

.es-alternate-grid__primary-content__intro {
	display: grid;
	gap: 0.5rem;
}

.es-alternate-grid__primary-content__intro__eyebrow {
	color: #8592e0;
	font-size: 1.15rem;
	font-weight: 500;
	margin: 0;
}

.es-alternate-grid__primary-content__intro__headline {
	font-size: 1.625rem;
	font-weight: 700;
}

.es-alternate-grid__primary-content__intro__headline * {
	margin: 0;
}

@media (min-width: 640px) {
	.es-alternate-grid__primary-content__intro__headline {
		font-size: 2rem;
	}
}

@media (min-width: 1024px) {
	.es-alternate-grid__primary-content__intro__headline {
		font-size: 2.5rem;
	}
}

@media (min-width: 1200px) {
	.es-alternate-grid__primary-content__intro__headline {
		font-size: 2.75rem;
	}
}

.es-alternate-grid__primary-content__intro__description {
	font-size: 1.15rem;
	max-width: 38rem;
}

.es-alternate-grid__primary-content__intro__description > p {
	margin: 0;
}

@media (min-width: 1200px) {
	.es-alternate-grid__primary-content__intro__description {
		font-size: 1.4rem;
	}
}

.es-alternate-grid__primary-content__items {
	display: grid;
	gap: 2rem;
}

@media (min-width: 640px) {
	.es-alternate-grid__primary-content__items {
		grid-template-columns: repeat(2, 1fr);
	}
}

.es-alternate-grid__item {
	display: grid;
	align-content: start;
}

.es-alternate-grid__item__heading {
	font-weight: 700;
	font-size: 1.17rem;
	margin-top: 0;
	margin-bottom: 0.5rem;
}

.es-alternate-grid__item__heading * {
	margin: 0;
}

.es-alternate-grid__item__description {
	font-size: 0.9rem;
}

.es-alternate-grid__item__description * {
	margin: 0;
}
</style>
