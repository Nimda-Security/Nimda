import React, { useState } from 'react';
import { authAPI, usersAPI } from '../services/api';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await authAPI.login({
        username: 'testuser',
        password: 'testpass'
      });
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getProfile();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>API 연동 테스트</h2>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testLogin} 
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          로그인 API 테스트
        </button>
        <button 
          onClick={testProfile} 
          disabled={loading}
        >
          프로필 API 테스트
        </button>
      </div>
      
      {loading && <p>로딩 중...</p>}
      
      {result && (
        <div>
          <h3>결과:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '5px',
            overflow: 'auto'
          }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
