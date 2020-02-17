<template>
	<section style="border-bottom: 1px solid #eee">
		<div class="hero-section">
			<div class="hero-section__inner">
				<p class="error">SliceZone Error</p>
				<h1>
					{{ pascalize(slice.slice_type) }}
					<em>does not exist</em>.
				</h1>
			</div>
		</div>
		<div class="container">
			<p class="paragraph">
				Make sure you created a '{{ pascalize(slice.slice_type) }}' component
				inside `sliceMachine/slices`. If not: create one! Also, check the
				console to check the payload received and the docs for more information.
			</p>
		</div>
	</section>
</template>
<script>
import { pascalize } from './utils'
export default {
	name: 'UnknownSlice',
	props: {
		slice: {
			type: Object,
			required: true,
			validator: function(value) {
				if (process.env.NODE_ENV === 'development') {
					console.log(
						'[SliceZone] Unable to find a component matching this Prismic slice:'
					)
					console.log(value)
					console.log('--- end of SliceZone')
				}
				return true
			}
		}
  },
  methods: { pascalize }
}
</script>

<style lang="scss" scoped="true">
.hero-section {
	background: #2b2b33;
	color: #fff;
	&__inner {
		max-width: 940px;
		margin: auto;
		padding: 2rem;
		.paragraph {
			color: #fff;
			max-width: 480px;
		}
	}
	* {
		margin-bottom: 1rem;
	}
}
.error {
	color: tomato;
	margin-bottom: 0;
}
.container {
	max-width: 940px;
	margin: auto;
	padding: 2rem;
	.paragraph {
		color: #111;
		max-width: 480px;
	}
}
</style>