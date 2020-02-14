<template>
	<div
		role="group"
		:class="`c-${type} js-${type}`"
		:aria-roledescription="type"
		:data-aria-label="`${type} with content`"
	>
		<span aria-live="polite" :class="`sr-only c-${type}__SRHelper`">
			Showing {{ type }} items
			{{
			Array(itemsInView)
			.fill(1)
			.map((_, i) => i + leftCounter + 1)
			.join(',')
			}}
			of {{ items.length }} {{ itemType.concat('s') }}
		</span>

		<div ref="container" :class="`c-${type}__${itemType}s-container`">
			<div
				ref="wrapper"
				:style="`transform: ${wrapperTransformStyle}`"
				:class="`c-${type}__${itemType}s-wrapper`"
			>
				<slot name="content" v-bind="items" />
			</div>
		</div>
		<div v-if="!hideDots" role="tablist" class="c-slider__dotNav">
			<button
				role="tab"
				ref="tabs"
				:aria-selected="i === leftCounter"
				class="c-slider__dotNav__dot"
				v-for="(item, i) in items"
				:key="`slider__dotNav__dot-${i + 1}`"
				:tabindex="(dotFocus || i !== leftCounter) ? '-1' : '0'"
				@click="onDotClick(i)"
				@focus="onAnyDotFocus()"
				@blur="onAnyDotBlur()"
				@keydown="paddleKeyboardRespond"
			>
				<span class="dot-label">{{ itemType.charAt(0).toUpperCase() + itemType.slice(1) }} {{ i + 1 }}</span>
			</button>
		</div>
		<div v-if="!hideArrows" :class="`c-${type}__paddleNav`">
			<button
				ref="prevButton"
				@click="slideBack"
				@keydown="paddleKeyboardRespond"
				:class="`c-${type}__paddleNav__prev`"
				aria-label="Previous"
				:aria-disabled="leftCounter === 0"
				:tabindex="leftCounter === 0 ? '-1' : '0'"
			>
				<svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true" focusable="false">
					<g fill="none" fill-rule="evenodd">
						<path d="M-8-6h24v24H-8z" />
						<path fill="currentColor" fill-rule="nonzero" d="M7.41 10.59L2.83 6l4.58-4.59L6 0 0 6l6 6z" />
					</g>
				</svg>
			</button>
			<button
				ref="nextButton"
				@click="slideForward"
				@keydown="paddleKeyboardRespond"
				:class="`c-${type}__paddleNav__next`"
				aria-label="Next"
				data-next
				:aria-disabled="leftCounter + itemsInView === items.length"
				:tabindex="
					leftCounter + itemsInView === items.length ? '-1' : '0'
				"
			>
				<svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true" focusable="false">
					<g fill="none" fill-rule="evenodd">
						<path d="M-8-6h24v24H-8z" />
						<path fill="currentColor" fill-rule="nonzero" d="M.59 10.59L5.17 6 .59 1.41 2 0l6 6-6 6z" />
					</g>
				</svg>
			</button>
		</div>
	</div>
</template>
<script>
const keyCodes = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
	HOME: 36,
	END: 35,
	ENTER: 13,
	SPACE: 32,
	DELETE: 46,
	TAB: 9
}

export default {
	name: 'PsSlider',
	props: {
		hideDots: {
			type: Boolean,
			required: false,
			default: false
		},
		hideArrows: {
			type: Boolean,
			required: false,
			default: false
		},
		items: {
			type: Array,
			required: true
		},
		type: {
			type: String,
			required: false,
			default: 'slider',
			validator: function(value) {
				return ['slider', 'carousel'].indexOf(value) !== -1
			}
		},
		itemType: {
			type: String,
			required: false,
			default: 'card',
			validator: function(value) {
				return ['card', 'testimonial', 'slide'].indexOf(value) !== -1
			}
		}
	},
	data() {
		return {
			dotFocus: false,
			wrapperTransformStyle: '',
			leftCounter: 0,
			rightCounter: 0,
			itemsOutOfView: 0,
			itemsInView: 0,
			timeout: false
		}
	},
	created() {
		if (process.client) {
			window.addEventListener('resize', this.onWindowResize)
		}
	},
	mounted() {
		this.updateState()
	},
	destroyed() {
		window.removeEventListener('resize', this.onWindowResize)
	},
	methods: {
		onWindowResize() {
			clearTimeout(this.timeout)
			this.timeout = setTimeout(this.updateState, '300')
		},
		slideBack() {
			this.rightCounter =
				this.rightCounter < this.itemsOutOfView
					? ++this.rightCounter
					: this.rightCounter
			this.leftCounter = this.leftCounter > 0 ? --this.leftCounter : 0

			this.slideCards()
		},
		slideForward() {
			if (this.rightCounter > 0) {
				--this.rightCounter
			}
			if (this.leftCounter < this.itemsOutOfView) {
				++this.leftCounter
			}
			this.slideCards()
		},
		slideCards() {
			const translateValue = this.leftCounter * (100 / this.itemsInView) * -1
			this.wrapperTransformStyle = 'translateX(' + translateValue + '%)'
			if (
				document.activeElement &&
				document.activeElement.getAttribute('role') === 'tab'
			) {
				if (this.$refs.tabs && this.$refs.tabs[this.leftCounter]) {
					this.$refs.tabs[this.leftCounter].focus()
				}
			}
		},
		updateState() {
			if (!this.$refs.wrapper || !this.$refs.wrapper.firstElementChild) {
				return
			}
			const card = this.$refs.wrapper.firstElementChild
			const container = this.$refs.container
			const cardWidth = card.offsetWidth
			const containerWidth = container.offsetWidth
			this.itemsInView = Math.round(containerWidth / cardWidth)
			this.itemsOutOfView = this.items.length - this.itemsInView
			this.rightCounter = this.itemsOutOfView
			this.leftCounter = 0
			this.slideCards()
		},
		paddleKeyboardRespond(e) {
			const keyCode = e.keyCode || e.which

			switch (keyCode) {
				case keyCodes.LEFT:
					if (this.$refs.prevButton) {
						this.$refs.prevButton.focus()
					}
					this.slideBack(e)
					break

				case keyCodes.RIGHT:
					if (this.$refs.nextButton) {
						this.$refs.nextButton.focus()
					}
					this.slideForward(e)
					break
			}
		},
		onDotClick(i) {
			this.leftCounter = i
			this.rightCounter = i + 1
			this.slideCards()
		},
		onAnyDotFocus() {
			this.dotFocus = true
		},
		onAnyDotBlur() {
			this.dotFocus = false
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

.c-slider[data-slider] {
	position: relative;
	padding: 0;
}

.c-slider__paddleNav {
	@media all and (max-width: 50em) {
		display: none;
	}

	.c-slider__paddleNav__prev,
	.c-slider__paddleNav__next {
		width: 2.75rem;
		height: 2.75rem;
		padding: 0.5rem;
		position: absolute;
		z-index: 2;
		top: 50%;
		margin-top: -5.5rem;
		border: 2px dotted transparent;
		border-radius: 50%;

		line-height: 0;

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

	.c-slider__paddleNav__prev {
		left: -3.5rem;
	}

	.c-slider__paddleNav__next {
		right: -3.5rem;
	}
}

.c-slider__dotNav {
	text-align: center;
	display: flex;
	padding: 1rem 0 4rem;
	align-items: center;
	justify-content: center;

	white-space: nowrap;
	overflow-x: auto;
	overflow-y: hidden;

	-webkit-overflow-scrolling: touch;

	background: linear-gradient(90deg, #fff 30%, rgba(255, 255, 255, 0)),
		linear-gradient(90deg, rgba(255, 255, 255, 0), #fff 70%) 0 100%,
		radial-gradient(farthest-side at 0 50%, rgba(0, 0, 0, 0.25), transparent),
		radial-gradient(farthest-side at 100% 50%, rgba(0, 0, 0, 0.25), transparent)
			0 100%;
	background-color: #fff;
	background-position: 0 0, 100%, 0 0, 100%;
	background-repeat: no-repeat;
	background-attachment: local, local, scroll, scroll;
	background-size: 20px 100%, 20px 100%, 10px 100%, 10px 100%;

	&::-webkit-scrollbar {
		display: none;
	}

	&:focus,
	&.focus-visible {
		outline: 2px dotted #888;
		outline-offset: 5px;
	}
}

.c-slider__dotNav__dot {
	display: inline-block;
	width: 2.75rem;
	height: 2.75rem;
	padding: 0;
	line-height: 0;
	border-radius: 50%;
	border: 2px dotted transparent;

	&::before {
		content: '';
		display: inline-block;
		width: 1rem;
		height: 1rem;
		background: #000;
		border-radius: 50%;
	}

	&[aria-selected='true'] {
		&::before {
			background: var(--color--primary);
		}
	}

	@media screen and (-ms-high-contrast: active) {
		/* All high contrast styling rules */
		&::before {
			background-color: windowText;
		}

		&[aria-selected='true'] {
			&::before {
				background: highlight;
			}
		}
	}

	&:focus,
	&.focus-visible {
		outline: none;
		border-color: var(--color--primary);
	}

	&:focus:not(:focus-visible) {
		border-color: transparent;
	}

	.js-focus-visible &:focus:not(.focus-visible) {
		border-color: transparent;
	}
}

/* styles for visible labels for the dotnav for voice dictation users */
.c-slider__dotNav__dot {
	position: relative;

	.dot-label {
		display: block;
		line-height: 1.5;
		position: absolute;
		left: 1.25rem;
		transform: translateX(-50%);
		bottom: -2.75rem;
		z-index: 1;
		background-color: var(--color--secondary);
		padding: 0.5em 1em;
		border-radius: 4px;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s linear;
		width: 15rem;

		&::after {
			/* up arrow */
			content: '';
			position: absolute;
			left: 50%;
			margin-left: -1rem;
			top: -0.5rem;
			width: 0;
			height: 0;
			border-left: 1rem solid transparent;
			border-right: 1rem solid transparent;
			border-bottom: 1rem solid var(--color--secondary);
		}
	}

	&:focus,
	&:hover {
		.dot-label {
			opacity: 1;
		}
	}

	&:focus:not(:focus-visible) {
		.dot-label {
			opacity: 0;
		}
	}

	.js-focus-visible &:focus:not(.focus-visible) {
		.dot-label {
			opacity: 0;
		}
	}
}

.c-slider__slides-container {
	display: flex;

	.ps-slider--images & {
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
	}
}

.c-slider__slides-wrapper {
	width: 80%;
	display: flex;
	align-items: center;
	transition: transform 0.4s cubic-bezier(0.39, 0.03, 0.56, 0.57);
}

.c-slider__slide {
	width: 100%;
	flex-shrink: 0;
	text-align: center;
	margin-bottom: var(--v-space);
	margin-right: var(--c-margin);
	transition: opacity 0.5s cubic-bezier(0.39, 0.03, 0.56, 0.57),
		visibility 1s cubic-bezier(0.39, 0.03, 0.56, 0.57);

	&[data-hidden='true'] {
		visibility: hidden;
		opacity: 0;
	}

	&[data-hidden='false'] {
		visibility: visible;
		opacity: 1;

		transition: opacity 0.2s cubic-bezier(0.39, 0.03, 0.56, 0.57),
			visibility 0.2s cubic-bezier(0.39, 0.03, 0.56, 0.57);
	}

	&:focus {
		outline: 1px dotted #888;
		outline-offset: -10px;
	}
}

.ps-slider {
	.c-slider__slides-container {
		overflow: hidden;
	}

	.c-slider__slides-wrapper {
		width: 100%;
		transition: transform 0.4s cubic-bezier(0.39, 0.03, 0.56, 0.57);
	}

	.c-slider__slide {
		margin: 0;
		flex-shrink: 0; // to make sure slides inside the flex container take up 100% of the container and don't shrink to their content size.
	}
}
</style>
