import React, { useState } from 'react';

export default function DashboardContent() {
  const [status, setStatus] = useState('Initializing MONTI Node...');
  const [payloadHex, setPayloadHex] = useState('0x4e6f64654a6f686e436861726c6573');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeEngine = async () => {
    setLoading(true);
    try {
      const res = await fetch('/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hardware-ID': 'MONTI_ANSI_F841005',
          'X-Container-ID': 'F841005WV22ZL01'
        },
        body: JSON.stringify({
          payloadHex,
          timestamp: new Date().toISOString()
        })
      });
      const data = await res.json();
      setOutput(data);
      setStatus('Execution Successful');
    } catch (err) {
      setOutput({ error: err.message });
      setStatus('Execution Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'monospace', padding: '20px', minHeight: '100vh' }}>
      <h2>MONTI ANSI F841005 // Terminal Dashboard</h2>
      <div style={{ border: '1px solid #30363d', padding: '15px', borderRadius: '6px', marginBottom: '20px', background: '#161b22' }}>
        <p><strong>Asset ID:</strong> MONTI_ANSI_F841005</p>
        <p><strong>Container:</strong> F841005WV22ZL01</p>
        <p><strong>Policy Status:</strong> PRECLUDE_TAW (Active)</p>
        <p><strong>Node Status:</strong> <span style={{ color: '#528bff' }}>{status}</span></p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Payload Hex:</label>
        <input 
          type="text" 
          value={payloadHex} 
          onChange={(e) => setPayloadHex(e.target.value)} 
          style={{ width: '100%', padding: '8px', background: '#010409', color: '#58a6ff', border: '1px solid #30363d', borderRadius: '4px' }}
        />
      </div>

      <button 
        onClick={executeEngine} 
        disabled={loading}
        style={{ padding: '10px 20px', backgroundColor: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {loading ? 'Processing...' : 'Run Engine Process'}
      </button>

      {output && (
        <div style={{ marginTop: '20px', background: '#010409', padding: '15px', border: '1px solid #30363d', borderRadius: '6px' }}>
          <h4>Execution Response:</h4>
          <pre style={{ color: '#7ee787', whiteSpace: 'pre-wrap' }}>{JSON.stringify(output, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
