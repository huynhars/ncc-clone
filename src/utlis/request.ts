import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  result: T;
  targetUrl?: string;
  success: boolean;
  error?: string;
  unAuthorizedRequest: boolean;
  __abp?: boolean;
}

export const request = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    // Thêm token authentication nếu có
    const token = localStorage.getItem('accessToken');
    const headers = {
      ...config.headers,
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response: AxiosResponse<ApiResponse<T>> = await axios({
      ...config,
      headers,
    });

    if (response.data.success) {
      return response.data as T;
    } else {
      throw new Error(response.data.error || 'Request failed');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Xử lý unauthorized
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      throw new Error(error.response?.data?.error?.message || error.message);
    }
    throw error;
  }
};