<script lang="ts">
	import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
	import { type Content, isFilled } from "@prismicio/client";

	export let slice: Content.PascalNameToReplaceSlice;
</script>

<section
	data-slice-type={slice.slice_type}
	data-slice-variation={slice.variation}
	class="es-bounded es-alternate-grid"
>
	<div
		class={`
			es-alternate-grid__content
			${
				isFilled.image(slice.primary.image)
					? "es-alternate-grid__content--with-image"
					: ""
			}
		`}
	>
		{#if isFilled.image(slice.primary.image)}
			<PrismicImage
				field={slice.primary.image}
				class={`
					es-alternate-grid__image
					${
						slice.variation === "imageRight"
							? "es-alternate-grid__image--right"
							: "es-alternate-grid__image--left"
					}
				`}
			/>
		{/if}
		<div class="es-alternate-grid__primary-content">
			<div class="es-alternate-grid__primary-content__intro">
				{#if isFilled.keyText(slice.primary.eyebrowHeadline)}
					<p class="es-alternate-grid__primary-content__intro__eyebrow">
						{slice.primary.eyebrowHeadline}
					</p>
				{/if}
				{#if isFilled.richText(slice.primary.title)}
					<div class="es-alternate-grid__primary-content__intro__headline">
						<PrismicRichText field={slice.primary.title} />
					</div>
				{/if}
				{#if isFilled.richText(slice.primary.description)}
					<div class="es-alternate-grid__primary-content__intro__description">
						<PrismicRichText field={slice.primary.description} />
					</div>
				{/if}
			</div>
			{#if slice.primary.items && slice.primary.items.length}
				<div class="es-alternate-grid__primary-content__items">
					{#each slice.primary.items as item, i}
						<div class="es-alternate-grid__item">
							{#if isFilled.richText(item.title)}
								<div class="es-alternate-grid__item__heading">
									<PrismicRichText field={item.title} />
								</div>
							{/if}
							{#if isFilled.richText(item.description)}
								<div class="es-alternate-grid__item__description">
									<PrismicRichText field={item.description} />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

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
</section>
