<script setup>
import { isFilled } from "@prismicio/client";

const props = defineProps(
	getSliceComponentProps(["slice", "index", "slices", "context"]),
);

const alignment = computed(() => {
	return props.slice.variation === "alignLeft" ? "left" : "center";
});
</script>

<template>
	<section
		:data-slice-type="slice.slice_type"
		:data-slice-variation="slice.variation"
		class="es-bounded es-call-to-action"
	>
		<div class="es-bounded__content es-call-to-action__content">
			<PrismicImage
				v-if="isFilled.image(slice.primary.image)"
				:field="slice.primary.image"
				class="es-call-to-action__image"
			/>
			<div class="es-call-to-action__content">
				<div
					v-if="isFilled.richText(slice.primary.title)"
					class="es-call-to-action__content__heading"
				>
					<PrismicRichText :field="slice.primary.title" />
				</div>
				<div
					v-if="isFilled.richText(slice.primary.paragraph)"
					class="es-call-to-action__content__paragraph"
				>
					<PrismicRichText :field="slice.primary.paragraph" />
				</div>
			</div>
			<PrismicLink
				v-if="isFilled.link(slice.primary.buttonLink)"
				:field="slice.primary.buttonLink"
				class="es-call-to-action__button"
			>
				{{ slice.primary.buttonLabel || "Learn more…" }}
			</PrismicLink>
		</div>
	</section>
</template>

<style>
.es-bounded {
	padding: 8vw 2rem;
}

.es-bounded__content {
	margin-left: auto;
	margin-right: auto;
}

@media screen and (min-width: 640px) {
	.es-bounded__content {
		max-width: 90%;
	}
}

@media screen and (min-width: 896px) {
	.es-bounded__content {
		max-width: 80%;
	}
}

@media screen and (min-width: 1280px) {
	.es-bounded__content {
		max-width: 75%;
	}
}

.es-call-to-action {
	font-family: system-ui, sans-serif;
	background-color: #fff;
	color: #333;
}

.es-call-to-action__image {
	max-width: 14rem;
	height: auto;
	width: auto;
	justify-self: v-bind(alignment);
}

.es-call-to-action__content {
	display: grid;
	gap: 1rem;
	justify-items: v-bind(alignment);
}

.es-call-to-action__content__heading {
	font-size: 2rem;
	font-weight: 700;
	text-align: v-bind(alignment);
}

.es-call-to-action__content__heading * {
	margin: 0;
}

.es-call-to-action__content__paragraph {
	font-size: 1.15rem;
	max-width: 38rem;
	text-align: v-bind(alignment);
}

.es-call-to-action__button {
	justify-self: v-bind(alignment);
	border-radius: 0.25rem;
	display: inline-block;
	font-size: 0.875rem;
	line-height: 1.3;
	padding: 1rem 2.625rem;
	text-align: v-bind(alignment);
	transition: background-color 100ms linear;
	background-color: #16745f;
	color: #fff;
}

.es-call-to-action__button:hover {
	background-color: #0d5e4c;
}
</style>
