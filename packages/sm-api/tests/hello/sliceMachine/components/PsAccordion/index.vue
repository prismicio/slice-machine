<template>
	<div data-accordion class="c-accordion accordion-js">
		<div
			v-for="(item, index) in dataItems"
			:key="`c-accordion__item-wrap-${index + 1}`"
			class="c-accordion__item-wrap"
		>
			<h3 data-accordion-heading class="c-accordion__heading" aria-level="h3">
				<button
					:id="`${accId}__heading-${index}`"
					:aria-expanded="(!ariaHide(item)).toString()"
					data-accordion-toggle
					:aria-controls="`${accId}__panel-${index}`"
					@click="togglePanel($event, index)"
				>
					{{ $prismic.asText(item.title) }}
					<svg
						class="accordion-icon"
						width="12"
						height="8"
						aria-hidden="true"
						focusable="false"
						viewBox="0 0 12 8"
					>
						<g fill="none">
							<path
								fill="#000"
								d="M1.41.59l4.59 4.58 4.59-4.58 1.41 1.41-6 6-6-6z"
							/>
							<path d="M-6-8h24v24h-24z" />
						</g>
					</svg>
				</button>
			</h3>
			<div
				:id="`${accId}__panel-${index}`"
				data-accordion-panel
				:aria-labelledby="`${accId}__heading-${index}`"
				:aria-hidden="ariaHide(item).toString()"
				class="c-accordion__panel"
			>
				{{ $prismic.asText(item.text) }}
			</div>
		</div>
	</div>
</template>
<script>
export default {
	name: 'PsAccordion',
	props: {
		ariaAccOptions: {
			type: Object,
			required: false,
			default() {
				return {
					showOneAnswerAtATime: true,
					allCollapsed: true,
					withControls: true
				}
			}
		},
		items: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			dataItems: [...(this.items || [])]
		}
	},
	computed: {
		accId() {
			return `c-accordion-${Math.floor(Math.random() * 999)}`
		}
	},
	methods: {
		ariaHide(item) {
			return item.display !== undefined ? !item.display : true
		},
		togglePanel(event, elemIndex) {
			this.dataItems = this.dataItems.map((item, i) => ({
				...item,
				display:
					i === elemIndex
						? Boolean(!item.display)
						: !this.ariaAccOptions.showOneAnswerAtATime
			}))
		}
	}
}
</script>
<style lang="scss" scoped>
@import '../../styles/_typography.scss';

.c-accordion__heading {
	@extend .text--l !optional;

	.accordion-js & {
		margin: 0;
	}

	> button {
		display: block;
		font: inherit;
		font-size: inherit;
		font-weight: 500;
		width: 100%;
		height: 100%;
		background-color: var(--color--secondary);
		text-align: left;
		line-height: 1.2;
		padding: var(--c-padding);
		padding-right: 80px;
		position: relative;
		border: 1px solid transparent;
		transition: outline 0.1s linear;
		border-radius: 8px;
		margin-bottom: var(--c-padding);

		&:focus {
			outline: var(--focus-outline);
			z-index: 1; // to ensure the outline isn't cut off where it overlaps with the next item below
		}

		&:focus:not(:focus-visible) {
			outline: none;
		}
		&.focus:not(.focus-visible) {
			outline: none;
		}
		&[aria-expanded='true'] {
			margin-bottom: 0;
			border-radius: 8px 8px 0 0;
		}
	}
}

.c-accordion__panel {
	.accordion-js & {
		padding: calc(var(--c-padding) / 3) var(--c-padding) var(--c-padding);
		padding-right: 4rem;
		background-color: var(--color--secondary);

		&[aria-hidden='true'] {
			margin-bottom: 0;
		}

		&[aria-hidden='false'] {
			border-radius: 0 0 8px 8px;
			margin-bottom: var(--c-padding);
		}
	}
}

/* Styles for the accordion icon */
.c-accordion .accordion-icon {
	display: block !important; // to override aria-hidden
	position: absolute;
	width: 0.75rem;
	height: 0.5rem;
	top: 50%;
	right: 1em;
	transform: translateY(-50%);
	transform-origin: 50% 50%;
	transition: all 0.1s linear;
}

.c-accordion [aria-expanded='true'] .accordion-icon {
	-ms-transform: translateY(-50%) rotate(180deg);
	transform: translateY(-50%) rotate(180deg);
}

.c-accordion [aria-hidden='true'] {
	display: none;
}
.c-accordion [aria-hidden='false'] {
	display: block !important;
}
</style>
