import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';


// Cấu hình base URL từ environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:21021/api';

// Tạo instance Axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Thêm token vào header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Xử lý response success
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    
    // Xử lý lỗi từ API response (NCC format)
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      console.error('API Error:', {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details
      });
      
      // Có thể thêm xử lý hiển thị thông báo lỗi cho người dùng ở đây
    }
    
    return Promise.reject(error);
  }
);

// Helper function để xử lý API response theo chuẩn NCC
export const handleApiResponse = <T>(response: AxiosResponse): T => {
  const data = response.data;
  
  // Kiểm tra response có đúng format NCC không
  if (data && typeof data.success !== 'undefined') {
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }
    return data;
  }
  
  // Trả về trực tiếp nếu không phải format NCC
  return data;
};

// Helper function để lấy data từ result field
export const getResultData = <T>(response: any): T => {
  if (response && typeof response.success !== 'undefined' && response.result) {
    return response.result;
  }
  return response;
};

// Export các phương thức HTTP
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get(url, config).then(response => handleApiResponse<T>(response)),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post(url, data, config).then(response => handleApiResponse<T>(response)),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put(url, data, config).then(response => handleApiResponse<T>(response)),
    
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete(url, config).then(response => handleApiResponse<T>(response)),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.patch(url, data, config).then(response => handleApiResponse<T>(response)),
};

export default axiosInstance;