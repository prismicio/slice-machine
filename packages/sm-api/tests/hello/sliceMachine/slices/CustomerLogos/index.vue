<template>
	<section class="ps ps--beige ps-customer-logos">
		<div class="ps__wrap">
			<div class="ps__head">
				<header class="ps__header">
					<span v-if="slice.primary.eyebrow_headline" class="ps__kicker">
						{{ $prismic.asText(slice.primary.eyebrow_headline) }}
					</span>
				</header>
			</div>
			<div class="ps__main">
				<ul
					v-if="slice.items.length"
					role="list"
					class="ps-customer-logos__list"
				>
					<li
						v-for="(item, index) in slice.items.filter(
							e => e.logo && e.logo.url && e.link
						)"
						:key="`ps-customer-logos__item-${index + 1}`"
						class="ps-customer-logos__item"
					>
						<prismic-link
							:field="item.link"
							class="ps-customer-logos__item__link"
						>
							<prismic-image :field="item.logo" />
						</prismic-link>
					</li>
				</ul>
				<prismic-link
					v-if="slice.primary.call_to_action_link"
					:field="slice.primary.call_to_action_link"
					class="ps-customer-logos__link"
				>
					{{ $prismic.asText(slice.primary.call_to_action) }}
				</prismic-link>
			</div>
		</div>
	</section>
</template>
<script>
export default {
	name: 'CustomerLogos',
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
	}
}
</script>
<style lang="scss" scoped>
.ps-customer-logos .ps__main {
	margin-top: 0;
}

.ps-customer-logos .ps__kicker {
	text-align: center;
}

.ps-customer-logos__list {
	list-style: none;
	padding: 0;
	margin: 0;
	text-align: center;
	margin: var(--v-margin) auto;
}

.ps-customer-logos__item {
	display: inline-block;
	margin: var(--v-margin);
	margin-right: calc(2 * var(--h-padding));
	a {
		display: block;
	}
}

.ps-customer-logos__link {
	color: inherit;
	text-decoration: underline;
	font-weight: normal;
	display: block;
	text-align: center;
}

@supports (display: grid) {
	.ps-customer-logos__list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		grid-column-gap: var(--h-padding);
		grid-row-gap: var(--v-margin);
		align-items: center;
	}

	.ps-customer-logos__item {
		margin: 0;
		display: flex;
		justify-content: center;
	}

	.ps-customer-logos__item__link {
		max-width: 140px;
	}
}
</style>
