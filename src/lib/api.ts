import {
  LoginRequest,
  LoginResponse,
  UserInfo,
  AbsenceTypeResponse,
  TimeSheetData,
  CheckInData,
  UserListResponse,
  ProjectResponse,
  HRMResponse,
  TimekeepingResponse,
  MezonTimesheetResponse,
  TimesheetFilterRequest,
  UserFilterRequest,
  ApiResponse,
  UserData,
  SubmitTimesheetRequest,
  SubmitTimesheetResponse,
  WarningMyTimesheetItem,
  CreateMyTimesheetResponse,
  MyTimesheetCreateInput,
  ProjectWithTasks,
  ProjectWithTasksResponse,
  GetAllTimesheetRequest,
  TimesheetItem,
  TimesheetResponse,
  MyTimesheetDto,
  UpdateMyTimesheetRequest,
  DeleteMyTimesheetResponse,
  PreviewApplyPunishmentRequest,
  PreviewApplyPunishmentResponse,
  GetQuantityProjectResponse,
  GetAllProjectsParams,
  ProjectDto,
  CustomerDto,
  BranchDto,
  GetAllBranchFilterParams,
  SaveProjectRequest,
  SaveProjectResponse,
  TaskStatisticDto,
  TeamStatisticDto,
  UserDto, 
  TaskDto

} from './type';


import axios from 'axios';
import axiosClient from './axiosClient'


// Lấy base URL từ environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://stg-api-timesheet.nccsoft.vn';

console.log('🌐 API Base URL:', API_BASE_URL);

// Helper để thêm timeout cho fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Helper để xử lý response - FIXED TYPE
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const text = await response.text(); // ✅ đọc 1 lần duy nhất

  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('Invalid JSON response');
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.error?.message ||
      data?.error?.details ||
      `HTTP ${response.status}`
    );
  }

  return data as ApiResponse<T>;
};


// ============ AUTHENTICATION APIs ============

// Login API - FIXED: LoginResponse đã là ApiResponse
export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const url = `${API_BASE_URL}/api/TokenAuth/Authenticate`;

  console.log('🔐 Calling login API:', url);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    }, 15000);

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Login failed');
    }

    return result as LoginResponse;
  } catch (error: any) {
    console.error('❌ Login error:', error);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your network connection.');
    }

    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check if the API is accessible.');
    }

    throw error;
  }
};

// ============ SESSION APIs ============

// Get current login info - FIXED: Trả về ApiResponse<UserInfo>
export const getCurrentLoginInfo = async (token?: string): Promise<ApiResponse<UserInfo>> => {
  const url = `${API_BASE_URL}/api/services/app/Session/GetCurrentLoginInformations`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
  });

  return handleResponse<UserInfo>(response);
};

// ============ ABSENCE TYPE APIs ============

// Get absence types - FIXED: Trả về ApiResponse<AbsenceType[]>
export const getAbsenceTypes = async (token: string): Promise<ApiResponse<AbsenceTypeResponse>> => {
  const url = `${API_BASE_URL}/api/services/app/AbsenceType/GetAll`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<AbsenceTypeResponse>(response);
};

// ============ TIMESHEET APIs ============

// Get timesheet data - OK
export const getTimeSheetData = async (
  token: string,
  params?: TimesheetFilterRequest
): Promise<ApiResponse<TimeSheetData>> => {
  const url = `${API_BASE_URL}/api/services/app/TimeSheet/GetAll`;

  const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';

  const response = await fetchWithTimeout(`${url}${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<TimeSheetData>(response);
};

// Submit timesheet for approval - OK
export const submitTimesheetForApproval = async (
  token: string,
  timesheetIds: number[]
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/services/app/TimeSheet/SubmitForApproval`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ timesheetIds }),
  });

  return handleResponse<any>(response);
};

// ============ MEZON APIs ============

// Get all timesheets of user (Mezon) - OK
export const getAllTimesheetOfUser = async (
  token: string,
  userId?: number,
  startDate?: string,
  endDate?: string,
  maxResultCount: number = 10,
  skipCount: number = 0
): Promise<ApiResponse<MezonTimesheetResponse>> => {
  const url = `${API_BASE_URL}/api/services/app/Mezon/GetAllTimesheetOfUser`;

  const params = new URLSearchParams({
    MaxResultCount: maxResultCount.toString(),
    SkipCount: skipCount.toString(),
  });

  if (userId) params.append('UserId', userId.toString());
  if (startDate) params.append('StartDate', startDate);
  if (endDate) params.append('EndDate', endDate);

  const response = await fetchWithTimeout(`${url}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<MezonTimesheetResponse>(response);
};

// Get projects including tasks - OK
export const getProjectsIncludingTasks = async (
  token: string
): Promise<ApiResponse<ProjectResponse[]>> => {
  const url = `${API_BASE_URL}/api/services/app/Project/GetProjectsIncludingTasks`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<ProjectResponse[]>(response);
};


// Create timesheet (Mezon) - OK
export const createTimesheet = async (
  token: string,
  data: {
    projectTaskId: number;
    workingTime: number;
    dateAt: string;
    note?: string;
    typeOfWork: 0 | 1;
  }
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/services/app/MyTimesheets/Create`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse<any>(response);
};


// Update timesheet (Mezon) - OK
export const updateTimesheet = async (
  token: string,
  id: number,
  data: {
    projectId?: number;
    taskId?: number;
    workingTime?: number;
    dateAt?: string;
    note?: string;
  }
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/services/app/Mezon/UpdateTimesheet`;

  const payload = {
    id,
    ...data
  };

  const response = await fetchWithTimeout(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<any>(response);
};

// Delete timesheet (Mezon) - OK
export const deleteTimesheet = async (
  token: string,
  id: number
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/services/app/Mezon/DeleteTimesheet?id=${id}`;

  const response = await fetchWithTimeout(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<any>(response);
};

// ============ HRM APIs ============

// Get HRM normal working times - OK
export const getHRMNormalWorking = async (
  token: string,
  startDate?: string,
  endDate?: string,
  userId?: number
): Promise<ApiResponse<HRMResponse>> => {
  const url = `${API_BASE_URL}/api/services/app/HRM/GetAllNormalWorking`;

  const params = new URLSearchParams();
  if (startDate) params.append('StartDate', startDate);
  if (endDate) params.append('EndDate', endDate);
  if (userId) params.append('UserId', userId.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';

  const response = await fetchWithTimeout(`${url}${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<HRMResponse>(response);
};

// ============ PUNISHMENT APIs ============

// Get punishment preview and summary - OK




// ============ TIMEKEEPING APIs ============

// Get timekeeping details - OK
export const getTimekeepingDetails = async (
  token: string,
  startDate?: string,
  endDate?: string,
  userId?: number
): Promise<ApiResponse<TimekeepingResponse>> => {
  const url = `${API_BASE_URL}/api/services/app/Timekeeping/GetMyDetails`;

  const params = new URLSearchParams();
  if (startDate) params.append('StartDate', startDate);
  if (endDate) params.append('EndDate', endDate);
  if (userId) params.append('UserId', userId.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';

  const response = await fetchWithTimeout(`${url}${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<TimekeepingResponse>(response);
};

// ============ USER APIs ============

// Get all users - FIXED: ApiResponse<UserListResponse>
export const getAllUsers = async (
  token: string,
  params?: UserFilterRequest
): Promise<ApiResponse<UserListResponse>> => {
  const url = `${API_BASE_URL}/api/services/app/User/GetAll`;

  const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';

  const response = await fetchWithTimeout(`${url}${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<UserListResponse>(response);
};

// Get user by id - FIXED: ApiResponse<UserData>
export const getUserById = async (
  token: string,
  userId: number
): Promise<ApiResponse<UserData>> => {
  const url = `${API_BASE_URL}/api/services/app/User/Get?id=${userId}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<UserData>(response);
};

// Unlock staff - OK
export const unlockStaff = async (
  token: string,
  userId: number
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/services/app/User/Unlock`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  return handleResponse<any>(response);
};

// ============ CHECK-IN APIs ============

// Get check-in data - OK
export const getCheckInData = async (
  token: string,
  year?: number,
  month?: number,
  userId?: number
): Promise<ApiResponse<CheckInData>> => {
  const url = `${API_BASE_URL}/api/services/app/CheckIn/GetAll`;

  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  if (userId) params.append('userId', userId.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';

  const response = await fetchWithTimeout(`${url}${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse<CheckInData>(response);
};

// Create complain for check-in - OK
export const createComplain = async (
  token: string,
  checkInId: number,
  content: string
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/services/app/CheckIn/CreateComplain`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ checkInId, content }),
  });

  return handleResponse<any>(response);
};

// ============ TOKEN MANAGEMENT ============

export const setAuthToken = (token: string, rememberClient = false) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);

    if (rememberClient) {
      localStorage.setItem('token_expiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000));
    } else {
      localStorage.setItem('token_expiry', String(Date.now() + 24 * 60 * 60 * 1000));
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('token_expiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    } else {
      removeAuthToken();
    }
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token_expiry');
  }
};

export const getCurrentUserId = (): number | null => {
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.userId || null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Helper để format date
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Helper để format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Helper để get status text
export const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Open';
    case 1: return 'Pending';
    case 2: return 'Approved';
    case 3: return 'Rejected';
    default: return 'Unknown';
  }
};

// Helper để get status color
export const getStatusColor = (status: number): string => {
  switch (status) {
    case 0: return 'bg-blue-100 text-blue-800';
    case 1: return 'bg-yellow-100 text-yellow-800';
    case 2: return 'bg-green-100 text-green-800';
    case 3: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper để extract data từ ApiResponse
export const extractData = <T>(response: ApiResponse<T>): T | null => {
  if (response.success && response.result !== undefined) {
    return response.result;
  }
  console.warn('Failed to extract data:', response.error);
  return null;
};

// Helper để extract list data
export const extractListData = <T>(response: ApiResponse<{ items: T[]; totalCount: number }>): T[] => {
  if (response.success && response.result?.items) {
    return response.result.items;
  }
  console.warn('Failed to extract list data:', response.error);
  return [];
};

// ============ MY TIMESHEETS APIs ============

// Submit timesheet to pending status
export const submitToPending = async (
  token: string,
  timesheetIds: number[],
  note?: string
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/services/app/MyTimesheets/SubmitToPending`;

  const payload = {
    timesheetIds,
    ...(note && { note })
  };

  console.log('🔗 API URL:', url); // Thêm log để debug
  console.log('📦 Payload:', payload);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await handleResponse<any>(response);
  console.log('📥 API Response:', result);
  return result;
};

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export const getMyTimesheetWarning = async (
  token: string,
  params: {
    dateAt: string;
    workingTime: number;
    timesheetId?: number;
  }
): Promise<ApiResponse<WarningMyTimesheetItem>> => {
  const url = `${API_BASE_URL}/api/services/app/MyTimesheets/WarningMyTimesheet`;

  const query = new URLSearchParams({
    dateAt: params.dateAt,
    workingTime: params.workingTime.toString(),
  });

  if (params.timesheetId !== undefined) {
    query.append('timesheetId', params.timesheetId.toString());
  }

  const response = await fetchWithTimeout(`${url}?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<WarningMyTimesheetItem>(response);
};


export const myTimesheetApi = {
  /**
   * Tạo timesheet mới
   * @param input Dữ liệu timesheet
   * @returns Promise với kết quả tạo timesheet
   */
  create: (input: MyTimesheetCreateInput): Promise<CreateMyTimesheetResponse> => {
    return request({
      url: `${API_BASE_URL}/api/services/app/MyTimesheets/Create`,
      method: 'POST',
      data: input,
    });
  },

  /**
   * Tạo timesheet mới với các tham số đơn giản hóa
   * @param params Tham số đơn giản cho việc tạo timesheet
   * @returns Promise với kết quả tạo timesheet
   */
  createSimple: (params: {
    projectTaskId: number;
    note: string;
    workingTime: number;
    dateAt: string;
    userId: number;
    typeOfWork?: number;
    isCharged?: boolean;
  }): Promise<CreateMyTimesheetResponse> => {
    const input: MyTimesheetCreateInput = {
      projectTaskId: params.projectTaskId,
      note: params.note,
      workingTime: params.workingTime,
      targetUserWorkingTime: params.workingTime, // Mặc định bằng workingTime
      typeOfWork: params.typeOfWork || 0,
      isCharged: params.isCharged ?? true,
      dateAt: params.dateAt,
      status: 0, // Mặc định
      projectTargetUserId: 0, // Mặc định
      isTemp: false, // Mặc định
      userId: params.userId,
      emailAddress: '', // Có thể cần điền email thực tế
      id: 0 // Mặc định 0 cho tạo mới
    };

    return myTimesheetApi.create(input);
  }
};

// ============ PROJECT APIs (NEW) ============

export const getProjectsIncludingTasksV2 = async (
  token: string
): Promise<ProjectWithTasksResponse> => {
  const url = `${API_BASE_URL}/api/services/app/Project/GetProjectsIncludingTasks`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  // data là array luôn
  return data as ProjectWithTasksResponse;
};

export const getAllTimesheetsOfUser = async (
  token: string,
  params: GetAllTimesheetRequest
): Promise<ApiResponse<TimesheetResponse>> => {
  try {
    // Validate required parameters
    if (!params.startDate || !params.endDate) {
      throw new Error('startDate and endDate are required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    // Add optional parameters if provided
    if (params.maxResultCount !== undefined) {
      queryParams.append('maxResultCount', params.maxResultCount.toString());
    }

    if (params.skipCount !== undefined) {
      queryParams.append('skipCount', params.skipCount.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/services/app/MyTimesheets/GetAllTimesheetOfUser?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          details: data.error?.details,
          validationErrors: data.error?.validationErrors,
        },
      };
    }

    // Transform response to match expected structure
    let result: TimesheetResponse;

    if (Array.isArray(data.result)) {
      // If result is already an array
      result = {
        items: data.result,
        totalCount: data.result.length
      };
    } else if (data.result && Array.isArray(data.result.items)) {
      // If result has items property
      result = data.result;
    } else if (Array.isArray(data)) {
      // If response is directly an array
      result = {
        items: data,
        totalCount: data.length
      };
    } else {
      // Default structure
      result = {
        items: [],
        totalCount: 0
      };
    }

    return {
      success: true,
      result,
    };
  } catch (error: any) {
    console.error('Error getting all timesheets:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch timesheets',
      },
    };
  }
};

// Hoặc nếu muốn giữ tên giống với API endpoint
export const getAllTimeSheetOfUser = getAllTimesheetsOfUser;

// ===============================
// Update My Timesheet
// ===============================

export async function updateMyTimesheet(
  input: UpdateMyTimesheetRequest
): Promise<MyTimesheetDto> {
  const token = getAuthToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/MyTimesheets/Update`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json-patch+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update timesheet');
  }

  return response.json();
}

// ===============================
// Delete My Timesheet
// ===============================

export async function deleteMyTimesheet(id: number): Promise<void> {
  const token = getAuthToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/MyTimesheets/Delete?Id=${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete timesheet');
  }
}



export async function previewApplyPunishmentAndGetSummary(
  input: PreviewApplyPunishmentRequest
): Promise<PreviewApplyPunishmentResponse> {
  const token = getAuthToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/UserPunishmentPaid/PreviewApplyAndGetSummary`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json-patch+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to preview punishment summary');
  }

  return response.json();
}

// ===============================
// Get Quantity Project
// ===============================


export async function getQuantityProject(): Promise<number> {
  const token = getAuthToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/Project/GetQuantityProject`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get quantity project');
  }

  const data = await response.json();

  console.log("API RESPONSE:", data); // ← thêm dòng này để check

  return data.quantity; // ✅ CHỈ TRẢ VỀ number
}


export async function getAllProjects(
  params?: GetAllProjectsParams
): Promise<ProjectDto[]> {
  const token = getAuthToken();

  const query = new URLSearchParams();

  if (params?.status !== undefined) {
    query.append('status', params.status.toString());
  }

  if (params?.search) {
    query.append('search', params.search);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/Project/GetAll?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get projects');
  }

  const data = await response.json();

  return data.result; // 👈 QUAN TRỌNG
}




export async function getAllCustomers(): Promise<CustomerDto[]> {
  const token = getAuthToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/Customer/GetAll`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get customers');
  }

  const data = await response.json();

  console.log("CUSTOMER API:", data);

  return data.result; // hoặc data.result.items nếu backend phân trang
}

export async function getAllBranchFilter(
  params?: GetAllBranchFilterParams
): Promise<BranchDto[]> {

  const token = getAuthToken()
  const query = new URLSearchParams()

  if (params?.isAll !== undefined) {
    query.append('isAll', String(params.isAll))
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/Branch/GetAllBranchFilter?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get branch list')
  }

  const data = await response.json()

  console.log("FULL API RESPONSE:", data)

  // ✅ CHỈ CẦN CÁI NÀY
  return data?.result ?? []
}



export async function saveProject(input: SaveProjectRequest) {
  const token = getAuthToken();
  // remove undefined fields
  const cleaned = JSON.parse(JSON.stringify(input));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/Project/Save`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleaned),
    }
  );

  const data = await response.json();
  // const text = await response.text();
  // console.log(text);
  if (!response.ok || data.success === false) {
    console.error("FULL BACKEND ERROR:", data);
    throw new Error(data.error?.message || "Save failed");
  }

  return data.result;
}


export async function getProjectById(id: number) {
  const token = getAuthToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/Project/Get?input=${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Get Project Detail Error:", error);
    throw new Error("Failed to fetch project detail");
  }

  return response.json();
}

export const getTimeSheetStatisticTasks = async (
  projectId: number,
  startDate: string,
  endDate: string
): Promise<TaskStatisticDto[]> => {
  const token = getAuthToken();

  const response = await axios.get(
    `${API_BASE_URL}/api/services/app/TimeSheetProject/GetTimeSheetStatisticTasks`,
    {
      params: {
        projectId,
        startDate,
        endDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.result; // vì backend ABP thường trả result
};


export const getTimeSheetStatisticTeams = async (
  projectId: number,
  startDate: string,
  endDate: string
): Promise<TeamStatisticDto[]> => {
  const token = getAuthToken();

  const response = await axios.get(
    `${API_BASE_URL}/api/services/app/TimeSheetProject/GetTimeSheetStatisticTeams`,
    {
      params: {
        projectId,
        startDate,
        endDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.result; // vì backend ABP thường trả result
};

export const inactiveProject = async (id: number): Promise<void> => {
  const token = getAuthToken();

  await axios.post(
    `${API_BASE_URL}/api/services/app/Project/Inactive`,
    { id },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const deleteProject = async (id: number): Promise<void> => {
  const token = getAuthToken();

  await axios.delete(
    `${API_BASE_URL}/api/services/app/Project/Delete`,
    {
      params: { id },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export async function getAllTasks(): Promise<TaskDto[]> {
  const token = getAuthToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/Task/GetAll`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const data = await response.json();

  return data.result; // 👈 QUAN TRỌNG
}

export async function getUserNotPagging(): Promise<UserDto[]> {
  const token = getAuthToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/app/User/GetUserNotPagging`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();

  return data.result; // 👈 QUAN TRỌNG (ABP luôn nằm trong result)
}
