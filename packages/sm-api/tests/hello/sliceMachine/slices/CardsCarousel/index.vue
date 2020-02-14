<template>
	<section class="ps ps-slider ps-slider--carousel ps-carousel">
		<div class="ps__wrap">
			<div class="ps__head">
				<header class="ps__header">
					<span
						v-if="slice.primary.eyebrow_headline"
						class="ps__kicker"
					>{{ $prismic.asText(slice.primary.eyebrow_headline) }}</span>
					<h2
						v-if="slice.primary.title"
						class="ps__title"
						aria-level="2"
					>{{ $prismic.asText(slice.primary.title) }}</h2>
				</header>
				<div v-if="slice.primary.description" class="ps__desc">
					<p>{{ $prismic.asText(slice.primary.description) }}</p>
				</div>
			</div>
			<div v-if="slice.items.length" class="ps__main grid grid--12">
				<div class="span-1-12">
					<ps-slider hide-dots type="carousel" item-type="card" :items="slice.items">
						<template v-slot:content ref="t">
							<div
								ref="items"
								data-carousel-card
								class="c-carousel__card"
								v-for="(item, i) in slice.items"
								:key="`data-carousel-card-${item}-${i + 1}`"
							>
								<prismic-image class="c-carousel__card__img" :field="item.image" />
								<div>
									<prismic-rich-text class="c-carousel__card__title" :field="item.title" />
									<prismic-rich-text class="c-carousel__card__content" :field="item.content" />
								</div>
							</div>
						</template>
					</ps-slider>
				</div>
			</div>
		</div>
	</section>
</template>
<script>
import PsSlider from '../../components/PsSlider'
export default {
	name: 'CardsCarousel',
	components: {
		PsSlider
	},
	props: {
		slice: {
			validator({ slice_type: sliceType, primary, items }) {
				return sliceType && primary && items
			},
			default() {
				return {
					items: [],
					primary: {}
				}
			}
		}
	}
}
</script>

<style lang="scss">
.c-carousel {
	position: relative;
}

.c-carousel__cards-container {
	overflow-x: auto;
	overflow-y: hidden;
	-webkit-overflow-scrolling: touch;

	.js-carousel & {
		overflow: hidden;
	}
}

.c-carousel__cards-wrapper {
	white-space: nowrap;
	transition: transform 0.4s cubic-bezier(0.39, 0.03, 0.56, 0.57);
}

.c-carousel__card {
	width: 100%;
	text-align: center;
	margin-bottom: 1rem;
	margin-right: 1.6rem;
	white-space: normal;
	display: inline-block;

	@media all and (min-width: 640px) {
		width: 50%;
	}

	@media all and (min-width: 900px) {
		width: 33.3333%;
	}

	@media all and (min-width: 1200px) {
		width: 25%;
	}

	padding: 2.5rem 1.6rem;
	position: relative;

	&::after {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		height: 100%;
		left: 0.8rem;
		width: calc(100% - 1.6rem);
		z-index: -1;
		background-color: var(--color--secondary);
		border-radius: 8px;
	}
}

.js-carousel {
	.c-carousel__container {
		overflow: hidden;
	}

	.c-carousel__cards-wrapper {
		width: 100%;
		display: flex;
		align-items: center;
		transition: transform 0.3s linear;
		align-items: stretch;
	}

	.c-carousel__card {
		margin: 0;
		justify-content: space-between;
		display: flex;
		flex-direction: column;
		flex-shrink: 0; // to make sure slides inside the flex container take up 100% of the container and don't shrink to their content size.
	}
}

.c-carousel__card__img {
	margin-bottom: var(--v-margin);
}

.c-carousel__card__title > h1,
h2,
h3 {
	font-size: 1rem;
	margin-bottom: 1em;
}

.c-carousel__paddleNav {
	margin-top: 1.5rem;
	text-align: center;

	.js-carousel & {
		display: flex; // only override hidden attribute when JS is enabled, otherwise next/prev buttons are useless
		align-items: center;
		justify-content: center;

		@media all and (min-width: 50em) {
			margin-top: 0;
		}
	}

	.c-carousel__paddleNav__prev,
	.c-carousel__paddleNav__next {
		width: 2.75rem;
		height: 2.75rem;
		padding: 0.5rem;
		z-index: 2;
		top: 50%;

		border: 2px dotted transparent;
		border-radius: 50%;

		line-height: 0;

		@media all and (min-width: 64em) {
			position: absolute;
			margin-top: -1.375rem;
		}

		svg {
			width: 50%;
			height: auto;
			color: #000;
			transition: color 0.1s linear;
		}

		&[aria-disabled='true'] {
			svg {
				color: #ccc;
			}
		}

		svg {
			display: inline;
		}

		&:hover {
			svg {
				color: var(--color--primary);
			}
		}

		&[aria-disabled='true']:hover {
			svg {
				color: #ccc;
			}
		}

		&:focus,
		&:active {
			outline: none;
			border-color: currentColor;
		}

		&[aria-disabled='true']:focus {
			border-color: #ccc;
		}

		&:focus:not(:focus-visible) {
			border-color: transparent;
		}

		.js-focus-visible &:focus:not(.focus-visible) {
			border-color: transparent;
		}
	}

	.c-carousel__paddleNav__prev {
		left: -3.5rem;
	}

	.c-carousel__paddleNav__next {
		right: -3.5rem;
	}
}
</style>
