import React from 'react'

function TestMinimal() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>Minimal Test Component</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>
        Click Me
      </button>
    </div>
  )
}

export default TestMinimal
