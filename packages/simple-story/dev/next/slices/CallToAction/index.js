export default function({ slice }) {
  console.log({ slice })
  return (
    <div style={{ color: 'orange' }}>{ slice.primary.keyText }</div>
  )
}