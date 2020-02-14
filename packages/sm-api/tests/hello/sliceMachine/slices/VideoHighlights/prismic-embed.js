export default {
	name: 'PrismicEmbed',
	functional: true,
	props: {
		field: {
			type: Object,
			required: true
		},
		wrapper: {
			type: String,
			required: false,
			default: 'div'
		}
	},
	render(h, { props, data }) {
		const { field, wrapper } = props
		if (!field || !field.html) {
			return null
		}

		const { embed_url: embedUrl, type, provider_name: providerName } = field

		const attrs = {
			...data.attrs,
			...(embedUrl && { 'data-oembed': embedUrl }),
			...(type && { 'data-oembed-type': type }),
			...(providerName && { 'data-oembed-provider': providerName })
		}

		return h(wrapper, {
			...Object.assign(data, { attrs }),
			domProps: {
				innerHTML: field.html
			}
		})
	}
}
