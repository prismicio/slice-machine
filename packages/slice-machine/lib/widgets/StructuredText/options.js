import { FaParagraph } from 'react-icons/fa'

const Icon = (v) => ({ size }) => 
   <span style={{ fontSize: size }}>{v}</span>

const options = [{
  value: 'p',
  label: 'P',
  icon: Icon('p'),
}, {
  value: 'pre',
  label: 'PRE',
  icon: Icon('pre'),
}, {
  value: 'h1',
  label: 'H1',
  icon: Icon('h1'),
}, {
  value: 'h2',
  label: 'H2',
  icon: Icon('h2'),
}, {
  value: 'h3',
  label: 'H3',
  icon: Icon('h3'),
}, {
  value: 'h4',
  label: 'H4',
  icon: Icon('h4'),
}, {
  value: 'h5',
  label: 'H5',
  icon: Icon('h5'),
}, {
  value: 'h6',
  label: 'H6',
  icon: Icon('h6'),
}, {
  value: 'rtl',
  label: 'RTL',
  icon: Icon('rtl'),
}]

export const optionValues = options.map(e => e.value)
export default options