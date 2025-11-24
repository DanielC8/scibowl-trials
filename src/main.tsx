import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// import AppTest from './App-test.tsx' // Uncomment to use test version
import './index.css'

console.log('main.tsx loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    {/* <AppTest /> */} {/* Uncomment to use test version */}
  </React.StrictMode>,
)

console.log('React app rendered');
