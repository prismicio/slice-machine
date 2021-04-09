import * as Renderers from './Renderers'

import { SupportedFrameworks } from '../../../../../../consts'

const FrameworkRenderers = {
  [SupportedFrameworks.nuxt]: Renderers.nuxt,
  [SupportedFrameworks.next]: Renderers.next,
  [SupportedFrameworks.vue]: Renderers.vue,
  [SupportedFrameworks.react]: Renderers.react,
  vanillajs: Renderers.vanillajs
}

const Hint = ({ framework, show, ...rest }) => { 
  if (FrameworkRenderers[framework]) {
    const Render = FrameworkRenderers[framework]
    return <div style={{ display: show ? 'initial' : 'none' }}><Render {...rest } /></div>
  }
  console.error(`Framework "${framework}" not supported`)
  return null
}

export default Hint;