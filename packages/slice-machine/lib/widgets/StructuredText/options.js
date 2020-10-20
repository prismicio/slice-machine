const Icon = (v) => ({ size }) =>
   <span style={{ fontSize: size }}>{v}</span>

const options = [{
  value: 'paragraph',
  label: 'P',
  icon: Icon('p'),
}, {
  value: 'preformatted',
  label: 'PRE',
  icon: Icon('pre'),
}, {
  value: 'heading1',
  label: 'H1',
  icon: Icon('h1'),
}, {
  value: 'heading2',
  label: 'H2',
  icon: Icon('h2'),
}, {
  value: 'heading3',
  label: 'H3',
  icon: Icon('h3'),
}, {
  value: 'heading4',
  label: 'H4',
  icon: Icon('h4'),
}, {
  value: 'heading5',
  label: 'H5',
  icon: Icon('h5'),
}, {
  value: 'heading6',
  label: 'H6',
  icon: Icon('h6'),
}, {
  value: 'rtl',
  label: 'RTL',
  icon: Icon('rtl'),
}]

export const optionValues = options.map(e => e.value)
export default options