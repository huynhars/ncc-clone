// Login interfaces
export interface LoginRequest {
  userNameOrEmailAddress: string;
  password: string;
  rememberClient?: boolean;
}

export interface LoginResponse {
  result: {
    accessToken: string;
    encryptedAccessToken: string;
    expireInSeconds: number;
    userId: number;
  };
  targetUrl?: string;
  success: boolean;
  error?: {
    code: number;
    message: string;
    details: string | null;
  };
  unAuthorizedRequest: boolean;
}

export interface UserInfo {
  result: {
    application: {
      version: string;
      releaseDate: string;
    };
    user: {
      id: number;
      name: string;
      userName: string;
      emailAddress: string;
      isEmailConfirmed: boolean;
    };
    tenant?: {
      id: number;
      tenancyName: string;
      name: string;
    };
  };
  success: boolean;
  error?: string;
}

// Absence Type interfaces
export interface AbsenceType {
  id: number;
  name: string;
  color: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface AbsenceTypeResponse {
  result: AbsenceType[];
  success: boolean;
  error?: string;
}

// Timesheet interfaces
export interface TimeSheetEntry {
  id: number;
  userId: number;
  userName: string;
  projectId: number;
  projectName: string;
  taskId: number;
  taskName: string;
  workingTime: number;
  dateAt: string;
  status: number; // 0: Open, 1: Pending, 2: Approved, 3: Rejected
  type: number;
  note?: string;
  creationTime: string;
  creatorUserId?: number;
  lastModificationTime?: string;
  lastModifierUserId?: number;
}

export interface TimeSheetSummary {
  totalHours: number;
  approvedHours: number;
  pendingHours: number;
  rejectedHours: number;
  openHours: number;
}

export interface TimeSheetData {
  items: TimeSheetEntry[];
  totalCount: number;
  summary?: TimeSheetSummary;
}

// Check-in interfaces
export interface CheckInRecord {
  id: number;
  userId: number;
  userName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  trackerTime: number;
  editedBy: string;
  editedTime?: string;
  punishments: number;
  complain: string;
  complainReply: string;
  status: string; // "Normal", "Late", "Early", "Absent"
  note?: string;
}

export interface CheckInData {
  items: CheckInRecord[];
  totalCount: number;
  summary?: {
    totalPunishments: number;
    paidPunishments: number;
    remainingPunishments: number;
    pendingPunishments: number;
  };
}

// User interfaces
export interface UserData {
  id: number;
  userName: string;
  name: string;
  surname: string;
  emailAddress: string;
  isActive: boolean;
  isEmailConfirmed: boolean;
  lastLoginTime?: string;
  creationTime: string;
  roleNames: string[];
  lockoutEndDateUtc?: string;
  accessFailedCount: number;
  phoneNumber?: string;
  position?: string;
  department?: string;
}

export interface UserListResponse {
  items: UserData[];
  totalCount: number;
}

// Project interfaces
export interface Project {
  id: number;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  tasks: Task[];
}

export interface Task {
  id: number;
  name: string;
  projectId: number;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ProjectResponse {
  items: Project[];
  totalCount: number;
}

// Working time interfaces
export interface WorkingTime {
  id: number;
  userId: number;
  userName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workingTime: number;
  status: number;
  punishment: number;
  complain?: string;
  complainReply?: string;
  note?: string;
}

export interface WorkingTimeResponse {
  items: WorkingTime[];
  totalCount: number;
  summary?: {
    totalWorkingTime: number;
    totalPunishment: number;
  };
}

// HRM interfaces
export interface HRMWorkingTime {
  id: number;
  userId: number;
  userName: string;
  date: string;
  morningCheckIn?: string;
  morningCheckOut?: string;
  afternoonCheckIn?: string;
  afternoonCheckOut?: string;
  workingTime: number;
  status: string; // "Normal", "Late", "Early", "Absent"
  note?: string;
}

export interface HRMResponse {
  items: HRMWorkingTime[];
  totalCount: number;
}

// Punishment interfaces
export interface PreviewApplyPunishmentRequest {
  year: number;
  month: number;
}

export interface UserBalanceDto {
  totalPunishmentMoney: number;
  remainPoints: number;
}

export interface PreviewApplyPunishmentResponse {
  success: boolean;
  message: string;
  userBalance: UserBalanceDto;
  totalRemainPointsUsedInMonth: number;
  totalPaidPunishmentInMonth: number;
}
// Mezon interfaces
export interface MezonTimesheet {
  id: number;
  userId: number;
  userName: string;
  projectId: number;
  projectName: string;
  taskId: number;
  taskName: string;
  workingTime: number;
  dateAt: string;
  status: number;
  note?: string;
  type: number;
}

export interface MezonTimesheetResponse {
  items: MezonTimesheet[];
  totalCount: number;
}

// Timekeeping interfaces
export interface TimekeepingDetail {
  id: number;
  userId: number;
  userName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workingTime: number;
  status: number;
  punishment: number;
  complain?: string;
  complainReply?: string;
  note?: string;
}

export interface TimekeepingResponse {
  items: TimekeepingDetail[];
  totalCount: number;
}

// Common response interface
export interface ApiResponse<T = any> {
  result: T;
  success: boolean;
  error?: {
    code: number;
    message: string;
    details: string;
    validationErrors?: Array<{
      message: string;
      members: string[];
    }>;
  };
  unAuthorizedRequest?: boolean;
  targetUrl?: string;
}

// Filter interfaces
export interface PagedAndSortedRequest {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

export interface TimeRangeRequest {
  startDate?: string;
  endDate?: string;
}

export interface UserFilterRequest extends PagedAndSortedRequest {
  filter?: string;
  role?: number;
  isActive?: boolean;
}

export interface TimesheetFilterRequest extends PagedAndSortedRequest, TimeRangeRequest {
  userId?: number;
  projectId?: number;
  taskId?: number;
  status?: number;
}

// Status enums
export enum TimesheetStatus {
  Open = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3
}

export enum CheckInStatus {
  Normal = "Normal",
  Late = "Late",
  Early = "Early",
  Absent = "Absent"
}

// Chart data interfaces
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalHours: number;
  approvedHours: number;
  pendingHours: number;
  totalPunishments: number;
  remainingPunishments: number;
  totalProjects: number;
  activeProjects: number;
}

// Export data interface
export interface ExportData {
  fileName: string;
  contentType: string;
  fileContent: string; // base64 encoded
}

export interface ApiResponse<T = any> {
  result: T;  // NCC API luôn wrap data trong "result"
  success: boolean;
  error?: {
    code: number;
    message: string;
    details: string;
    validationErrors?: Array<{
      message: string;
      members: string[];
    }>;
  };
  unAuthorizedRequest?: boolean;
  targetUrl?: string;
  __abp?: boolean;  // NCC thường có field này
}

// User-specific response interfaces
export interface UserResponse {
  result: UserData;
}



// Get User response (single user)
export interface GetUserResponse extends ApiResponse<UserData> { }

// Get All Users response
export interface GetAllUsersResponse extends ApiResponse<{
  items: UserData[];
  totalCount: number;
}> { }

export interface SubmitTimesheetRequest {
  timesheetIds: number[];
  note?: string;
}

// (Nếu cần) Thêm interface cho response
export interface SubmitTimesheetResponse {
  successCount: number;
  failedCount: number;
  message?: string;
}

// type.ts
export interface WarningMyTimesheetItem {
  userId: number;
  dateAt: string;
  hourOff: number;
  workingTime: number;
  workingTimeLogged: number;
  checkIn: string | null;
  checkOut: string | null;
  checkInShow: string;
  checkOutShow: string;
  isWarning: boolean;
  hourDiMuon: number;
  hourVeSom: number;
  isOffHalfDay: boolean;
  isOffDay: boolean;
  minuteActive: number;
}

// ============ CAPABILITY ============

export interface MyTimesheetCreateInput {
  projectTaskId: number;
  note: string;
  workingTime: number;
  targetUserWorkingTime: number;
  typeOfWork: number;
  isCharged: boolean;
  dateAt: string; // ISO string date
  status: number;
  projectTargetUserId: number;
  isTemp: boolean;
  userId: number;
  emailAddress: string;
  id: number;
}

export interface MyTimesheetDto {
  id: number;
  projectTaskId: number;
  note: string;
  workingTime: number;
  targetUserWorkingTime: number;
  typeOfWork: number;
  isCharged: boolean;
  dateAt: string;
  status: number;
  projectTargetUserId: number;
  isTemp: boolean;
  userId: number;
  emailAddress: string;
  // Các trường khác có thể có
  creationTime?: string;
  creatorUserId?: number;
  lastModificationTime?: string;
  lastModifierUserId?: number;
}

export interface CreateMyTimesheetResponse {
  result: MyTimesheetDto;
  targetUrl?: string;
  success: boolean;
  error?: string;
  unAuthorizedRequest: boolean;
  __abp?: boolean;
}

// ============ PROJECT / TASK (NEW API) ============

export interface ProjectTask {
  projectTaskId: number;
  taskName: string;
  billable: boolean;
  isDefault: boolean;
}

export interface ProjectTargetUser {
  projectTargetUserId: number;
  userName: string;
  roleName: string;
}

export interface ProjectWithTasks {
  id: number;
  projectName: string;
  customerName: string;
  projectCode: string;
  projectUserType: number;
  listPM: string[];
  tasks: ProjectTask[];
  targetUsers: ProjectTargetUser[];
}

/**
 * API này KHÔNG wrap trong { result }
 * Trả thẳng array
 */
export type ProjectWithTasksResponse = ProjectWithTasks[];


// Thêm vào file type.ts

export interface TimesheetItem {
  id: number;
  projectName: string;
  taskName: string;
  projectTaskId: number;
  customerName: string;
  projectCode: string;
  dateAt: string;
  workingTime: number;
  status: number;
  note: string;
  typeOfWork: number;
  isCharged: boolean;
  billable: boolean;
  isTemp: boolean;
  projectTargetUser: string;
  workingTimeTargetUser: number;
  openTalkJoinTime: number;
  rejectReason: string;
  lastModificationTime: string;
  lastModifierUserName: string;
  workType: string;
}

export interface TimesheetResponse {
  items: TimesheetItem[];
  totalCount: number;
}

export interface GetAllTimesheetRequest {
  startDate: string;
  endDate: string;
  maxResultCount?: number;
  skipCount?: number;
}


// ===============================
// Timesheet Update
// ===============================

export interface UpdateMyTimesheetRequest {
  projectTaskId: number;
  note: string;
  workingTime: number;
  targetUserWorkingTime: number;
  typeOfWork: number;
  isCharged: boolean;
  dateAt: string; // ISO string
  status: number;
  projectTargetUserId: number;
  isTemp: boolean;
  userId: number;
  emailAddress: string;
  id: number;
}

export type DeleteMyTimesheetResponse = {
  success: boolean;
};

export interface GetQuantityProjectResponse {
  result: number;
  success: boolean;
  error: any;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface ProjectTaskDto {
  id: number;
  taskId: number;
  taskName: string;
  billable: boolean;
}

export interface ProjectDto {
  customerName: string;
  customerId: number;
  name: string;
  code: string;
  status: number;
  pms: string[];
  activeMember: number;
  projectType: number;
  timeStart: string;
  timeEnd: string;
  id: number;
  note?: string; // Thêm field note
  tasks?: ProjectTaskDto[]; // Thêm tasks array
  isAllowTeamBuilding: boolean

}

export interface ProjectDtoDetail extends ProjectDto {
  tasks: ProjectTaskDto[];
}

export interface GetAllProjectsParams {
  status?: number;
  search?: string;
}

export interface CustomerDto {
  name: string;
  code: string;
  id: number;
}

export interface BranchDto {
  name: string;
  displayName: string;
  id: number;
}

export interface GetAllBranchFilterParams {
  isAll?: boolean;
}

export interface ProjectTaskInput {
 
  taskId: number;
  billable: boolean;
  id: number;
}

export interface ProjectUserInput {
  userId: number;
  type: number;
  isTemp: boolean;
  id: number;
}

export interface ProjectTargetUserInput {
  userId: number;
  roleName: string;
  id: number;
}

export interface SaveProjectRequest {
  name: string;
  code: string;
  status: number;
  timeStart: string;
  timeEnd: string | null;   // ✅ SỬA Ở ĐÂY

  note: string;
  projectType: number;
  customerId: number;
  tasks: ProjectTaskInput[];
  users: ProjectUserInput[];
  projectTargetUsers: ProjectTargetUserInput[];
  notifyChannel: number;
  mezonUrl: string;
  komuChannelId: string;
  isNotifyToKomu: boolean;
  isNoticeKMSubmitTS: boolean;
  isNoticeKMApproveRejectTimesheet: boolean;
  isNoticeKMRequestOffDate: boolean;
  isNoticeKMApproveRequestOffDate: boolean;
  isNoticeKMRequestChangeWorkingTime: boolean;
  isNoticeKMApproveChangeWorkingTime: boolean;
  isAllUserBelongTo: boolean;
  isAllowTeamBuilding: boolean;
  id: number;
}

export type SaveProjectResponse = SaveProjectRequest;

export interface TaskStatisticDto {
  taskId: number;
  taskName: string;
  totalWorkingTime: number;
  billableWorkingTime: number;
  billable: boolean;
}

export interface TeamStatisticDto {
  userID: number;
  userName: string;
  projectUserType: number;
  totalWorkingTime: number;
  billableWorkingTime: number;
}


export interface TaskDto {
  id: number;
  name: string;
  type: number; // 0 = Common, 1 = Other
  isDeleted: boolean;
}


export interface UserDto {
  name: string;
  userName: string;
  emailAddress: string;
  isActive: boolean;
  type: number;
  jobTitle: string;
  level: number;
  userCode: string;
  avatarPath: string;
  avatarFullPath: string;
  branch: number;
  branchColor: string;
  branchDisplayName: string;
  branchId: number;
  positionId: number;
  positionName: string;
  id: number;
}
