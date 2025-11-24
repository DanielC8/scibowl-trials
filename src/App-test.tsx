// Simple test component to verify React is working
function AppTest() {
  console.log('AppTest component rendering...');
  
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb' }}>Science Bowl Trials - Test</h1>
      <p>If you see this, React is working! ✅</p>
      <p>The white screen issue was likely due to:</p>
      <ul>
        <li>Icon library loading</li>
        <li>PDF.js import blocking</li>
        <li>Module resolution issues</li>
      </ul>
      <button 
        onClick={() => alert('Button works!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Click me to test
      </button>
    </div>
  );
}

export default AppTest;
