<template>
	<section
		:class="`ps ps-video-player ${darkMode ? ' ps-video-player--dark' : ''}`"
	>
		<div class="ps__wrap">
			<div class="ps__head">
				<header class="ps__header">
					<span class="ps__kicker">
						{{ slice.primary.eyebrow_headline }}
					</span>
					<h2 class="ps__title" aria-level="">
						{{ $prismic.asText(slice.primary.title) }}
					</h2>
				</header>
				<div class="ps__desc">
					<p>
						{{ $prismic.asText(slice.primary.description) }}
					</p>
				</div>
			</div>
			<div class="ps__main" v-if="dataItems.length">
				<div :id="currId" class="ps__video-player" data-video-player>
					<div class="ps__video-player__playlist span-9-12" data-playlist>
						<ul
							role="list"
							class="ps__video-player__playlist__list"
							aria-label="Video Playlist"
							aria-orientation="vertical"
							@keydown="keyEvent"
						>
							<li
								v-for="(item, index) in dataItems.filter(e => e.src)"
								:key="`ps__video-player__playlist__item-${index + 1}`"
								class="ps__video-player__playlist__item"
								role="presentation"
							>
								<a
									:id="`${currId}__tab-${index + 1}`"
									ref="links"
									class="ps__video-player__playlist__link"
									:tabindex="item.selected ? '0' : '-1'"
									:aria-selected="item.selected || false"
									:data-href="item.src.embed_url"
									:data-index="index"
									role="tab"
									@click="selectItem(index)"
								>
									{{ item.title }}
								</a>
							</li>
						</ul>
					</div>
					<prismic-embed
						:aria-labelledby="
							`${currId}__tab-${dataItems.findIndex(e => e.selected)}`
						"
						class="ps__video-container span-1-8"
						:tabindex="videoTabIndex"
						:field="dataItems.find(e => e.selected).src"
						@blur="onVideoContainerBlur"
					/>
				</div>
			</div>
		</div>
	</section>
</template>
<script>
import PrismicEmbed from './prismic-embed'
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
	name: 'VideoHighlights',
	components: {
		PrismicEmbed
	},
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
	data() {
		return {
			videoTabIndex: '-1',
			dataItems: this.slice.items.map((item, i) => ({
				src: item.video_src,
				title: item.video_title,
				selected: i === 0
			}))
		}
	},
	computed: {
		currId() {
			return `ps__video-player-${Math.floor(Math.random() * 999)}`
		},
		darkMode() {
			return this.slice && this.slice.slice_label === 'dark_mode'
		}
	},
	methods: {
		selectItem(index) {
			if (index === this.dataItems.findIndex(e => e.selected)) {
				return
			}
			this.dataItems = this.dataItems.map((e, i) => ({
				...e,
				selected: i === index
			}))
		},
		onVideoContainerBlur() {
			this.videoTabIndex = '-1'
		},
		keyEvent(e) {
			const keyCode = e.keyCode || e.which
			const index = Number(event.target.getAttribute('data-index'))
			if (keyCode !== keyCodes.TAB) {
				e.preventDefault()
			}

			switch (keyCode) {
				case keyCodes.UP:
					const previousIndex = this.dataItems[index - 1]
						? index - 1
						: this.dataItems.length - 1
					this.$refs.links[previousIndex].focus()
					break
				case keyCodes.DOWN:
					const nextIndex = this.dataItems[index + 1] ? index + 1 : 0
					this.$refs.links[nextIndex].focus()
					break
				case keyCodes.ENTER:
				case keyCodes.SPACE:
					this.selectItem(index)
					break
				case keyCodes.TAB:
					if (event.target.getAttribute('role') === 'tab') {
						this.videoTabIndex = '0'
					}
					break
				case keyCodes.HOME:
					this.$refs.links[0].focus()
					break
				case keyCodes.END:
					this.$refs.links[this.items.length - 1].focus()
					break
			}
		}
	}
}
</script>
<style lang="scss">
.ps-video-player--dark {
	background-color: black;
	color: #fff;
}

.ps__video-player {
	display: flex;
	flex-direction: column-reverse;

	@media all and (min-width: 50em) {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		grid-column-gap: var(--h-padding);
	}
}

.ps__video-player__playlist__list {
	margin: 0;
	padding: 0;
	list-style: none;
}

.ps__video-container {
	height: 0;
	width: 100%;
	padding-top: 56.2%;
	position: relative;
	margin-bottom: var(--c-margin);

	grid-row: 1;

	@media all and (min-width: 50em) {
		margin-bottom: 0;
	}

	&:focus {
		outline-color: var(--color-text-grey);
	}

	iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		&:focus {
			outline-color: var(--color-text-grey);
		}
	}
}

.ps__video-player__playlist__item {
	border-top: 1px solid #e5e5e5;

	&:last-of-type {
		border-bottom: 1px solid #e5e5e5;
	}

	@media all and (max-width: 50em) {
		&:first-of-type {
			border-top: none;
		}
	}

	.ps-video-player--dark & {
		border-color: var(--color-grey-20);
	}
}

.ps__video-player__playlist__link {
	position: relative;
	z-index: 1;
	display: block;
	cursor: pointer;
	font-weight: normal;
	color: inherit;

	text-align: left;
	text-decoration: none;
	text-overflow: ellipsis;
	/* Required for text-overflow to do anything */
	white-space: nowrap;
	overflow: hidden;

	padding: 0.75em;
	padding-left: 0.5em;
	padding-right: 3em;
	background-size: 1em 1em;
	background-repeat: no-repeat;
	background-position: right center;
	background-image: url('./video-play-icon--grey.svg');

	&:hover {
		color: inherit;
		// text-decoration: none;
	}

	.ps-video-player--dark & {
		color: var(--color-text-grey);
		background-image: url('./video-play-icon--dark-grey.svg');

		&:visited {
			color: var(--color-text-grey);
		}
	}

	&[aria-selected='true'] {
		background-image: url('./video-play-icon--black.svg');
		font-weight: bold;
	}
	.ps-video-player--dark &[aria-selected='true'] {
		background-image: url('./video-play-icon--white.svg');
		color: #fff;
		font-weight: normal;
	}

	&[href]:focus {
		background-repeat: no-repeat; // for a weird firefox bug on click
		outline-color: var(--color-text-grey);

		outline-offset: 5px;
	}

	&:visited {
		color: inherit;
	}
}
</style>
