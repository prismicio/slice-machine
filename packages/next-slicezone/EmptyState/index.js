import React from 'react'

const box = {
  maxWidth: '840px',
  padding: '44px',
  margin: '4em auto',
  background: '#FFF',
  color: '#111',
  textAlign: 'center',
  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
}
const p = {
  fontSize: '20px'
}

const button = {
  border: '1px solid #111',
  background: '#F7F7F7',
  padding: '10px',
  fontSize: '18px',
  marginTop: '16px'
}

const handleEnpoint = (url) => url.replace('cdn.', '').split('/api')[0]

const EmptyState = ({ endpoint }) => {
  const wroom = endpoint ? handleEnpoint(endpoint) : null
  return (
    <section style={box}>
      <h1>Your SliceZone is empty</h1>
      <p style={p}>
        To render components here, create a document on Prismic first!
      </p>
      {
        wroom ? (
          <button style={button} onClick={() => window.open(wroom, '_blank')}>
            Create a page now
          </button>
        ) : null
      }
    </section>
  )
}

export default EmptyState