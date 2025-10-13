const getAuthToken = () => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem("accessToken");
  };
  
  // API 요청을 위한 fetch 래퍼 함수
  export const fetchApi = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
      console.log("현재 토큰:", token);
  
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  
    // 토큰이 있는 경우에만 Authorization 헤더 추가
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  
    const response = await fetch(url, { ...options, headers });
  
    // 401 오류 발생 시, 토큰을 함께 보낸 요청이었을 경우에만 로그아웃 처리
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event("auth-error"));
      throw new Error("인증이 만료되었습니다.");
    }
  
    return response;
  };