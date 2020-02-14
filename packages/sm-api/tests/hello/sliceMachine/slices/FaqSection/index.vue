<template>
	<section class="ps ps-accordion ps-accordion--faq">
		<div class="ps__wrap">
			<div class="ps__head">
				<header class="ps__header">
					<span v-if="slice.primary.eyebrow_headline" class="ps__kicker">
						{{ $prismic.asText(slice.primary.eyebrow_headline) }}
					</span>
					<h2 v-if="slice.primary.title" class="ps__title" aria-level="2">
						{{ $prismic.asText(slice.primary.title) }}
					</h2>
				</header>
				<div v-if="slice.primary.description" class="ps__desc">
					<p>
						{{ $prismic.asText(slice.primary.description) }}
					</p>
				</div>
			</div>
			<div class="ps__main grid grid--12">
				<div v-if="hasImage" class="span-1-6">
					<div class="ps__img">
						<prismic-image :field="slice.primary.optional_image" />
					</div>
				</div>
				<div :class="`${hasImage ? 'span-7-12' : 'span-1-12'}`">
					<ps-accordion :items="slice.items" />
				</div>
			</div>
		</div>
	</section>
</template>
<script>
import Vue from 'vue'

const components = {}
if (!Vue.options.components['ps-accordion']) {
	components['ps-accordion'] = () => import('../../components/PsAccordion')
}
export default {
	name: 'FaqSection',
	components,
	props: {
		slice: {
			validator: function({ slice_type: sliceType, primary, items }) {
				return sliceType && primary && items
			},
			default: function() {
				return {
					items: [],
					primary: {}
				}
			}
		}
	},
	computed: {
		hasImage() {
			return (
				this.slice &&
				this.slice.primary &&
				this.slice.primary.optional_image &&
				Object.keys(this.slice.primary.optional_image).length !== 0
			)
		}
	}
}
</script>
<style lang="scss" scoped>
.ps-accordion__img {
	display: block;
	margin: 0 auto calc(var(--c-padding) * 2);
	background: var(--color--secondary);
}
</style>
