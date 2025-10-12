// 이 함수는 localStorage에 직접 접근하므로 클라이언트 측에서만 사용해야 합니다.
const getAuthToken = () => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem("accessToken");
  };
  
  // API 요청을 위한 fetch 래퍼 함수
  export const fetchApi = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
  
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    
    // 토큰이 있는 경우 Authorization 헤더에 추가
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  
    const response = await fetch(url, { ...options, headers });
  
    // 401 Unauthorized 오류 발생 시 자동으로 로그아웃 처리
    if (response.status === 401) {
      // auth-context에서 logout을 직접 호출할 수 없으므로,
      // 커스텀 이벤트를 발생시켜 전역적으로 처리합니다.
      window.dispatchEvent(new Event("auth-error"));
      throw new Error("인증이 만료되었습니다.");
    }
  
    return response;
  };