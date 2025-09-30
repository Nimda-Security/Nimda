// 문제 관련 API 함수들 (JavaScript)

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * 문제 출제 API 호출
 * URL : /api/problems
 * method: POST
 * 
 * * Header 정보 * 
 * - Content-Type : applicaton
 * - Authorization : Http Header 이름. 
 * localStorage.getItem('authToken') : 로컬스토리지에 저장된 JWT 토큰 가져오기 
 * 
 */
export const createProblemAPI = async (problemData) => {

  try {
    const response = await fetch(`${API_BASE_URL}/problems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(problemData)
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || '문제가 성공적으로 출제되었습니다.',
        problem: result.problem
      };
    } 
    
    else {
      return {
        success: false,
        message: result.message || '문제 출제에 실패했습니다.'
      };
    }
  } 
  
  catch (error) {
    console.error('문제 출제 API 오류:', error);
    return {
      success: false,
      message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
    };
  }

};

/**
 * 모든 문제 조회 API
 */
export const getAllProblemsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/problems`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('문제 목록 조회 API 오류:', error);
    return { success: false, message: '문제 목록을 불러올 수 없습니다.' };
  }
};

/**
 * 특정 문제 조회 API
 */
export const getProblemByIdAPI = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/problems/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('문제 조회 API 오류:', error);
    return { success: false, message: '문제를 불러올 수 없습니다.' };
  }
};

