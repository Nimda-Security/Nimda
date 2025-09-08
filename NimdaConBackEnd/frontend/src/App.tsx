import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import ApiTest from './components/ApiTest';

function App() {
  const [apiResult, setApiResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // GET 요청 테스트
  const testGetAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // POST 요청 테스트
  const testPostAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hello: 'world' })
      });
      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      
      {/* 백엔드 API 테스트 섹션 */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🚀 백엔드 API 테스트 (프록시 동작 확인)</h2>
        <p>React 앱(3001번 포트)에서 백엔드(3000번 포트)로 API 요청</p>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={testGetAPI} 
            disabled={loading}
            style={{ 
              marginRight: '10px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            GET /api/test
          </button>
          
          <button 
            onClick={testPostAPI} 
            disabled={loading}
            style={{ 
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            POST /api/test (hello: world)
          </button>
        </div>
        
        {loading && <p>⏳ 요청 중...</p>}
        
        {apiResult && (
          <div>
            <h3>📡 API 응답 결과:</h3>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px',
              overflow: 'auto',
              textAlign: 'left',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {apiResult}
            </pre>
          </div>
        )}
      </div>
      
      <ApiTest />
    </div>
  );
}

export default App;
