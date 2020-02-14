<template>
	<section class="ps ps-slider ps-slider--images">
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
					<ps-slider hide-arrows type="slider" item-type="slide" :items="slice.items">
						<template v-slot:content>
							<div
								:data-slide-label="$prismic.asText(item.description)"
								class="c-slider__slide"
								data-hidden="false"
								role="tabpanel"
								v-for="(item, i) in slice.items"
								:key="`c-slider__slide-${i + 1}`"
								tabindex="-1"
							>
								<figure
									class="c-slider__slide__figure"
									role="figure"
									:aria-label="$prismic.asText(item.description)"
								>
									<prismic-image class="c-slider__slide__img" :field="item.image" />
									<figcaption>{{ $prismic.asText(item.description) }}</figcaption>
								</figure>
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
	name: 'ImagesSlider',
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
.ps-slider--images .c-slider__slide__figure {
	margin: 0;
	padding: 0;
	width: 100%;

	img {
		width: 100%;
		max-width: 840px;
	}

	figcaption {
		padding: var(--c-padding);
		max-width: 80ch;
		margin: 0 auto;
	}
}
</style>
