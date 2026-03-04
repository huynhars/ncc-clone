'use client';

import Select from 'react-select';
import { useState, useEffect } from 'react';
import {
    getTimeSheetData,
    formatDate,
    getAuthToken,
    submitToPending,
    getMyTimesheetWarning,
    getProjectsIncludingTasks,
    createTimesheet,
    getAllTimesheetsOfUser,
    getTimekeepingDetails,
    updateMyTimesheet, 
    deleteMyTimesheet// Thêm import mới
} from '@/src/lib/api';
import {
    TimesheetFilterRequest,
    TimesheetResponse,       // Thêm import
    GetAllTimesheetRequest, // Thêm import
    TimesheetItem,
    UpdateMyTimesheetRequest          // Thêm import
} from '@/src/lib/type'

// Hàm lấy user ID từ localStorage
const getCurrentUserId = (): number | null => {
    if (typeof window === 'undefined') return null;

    try {
        // Thử lấy từ localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id || user.userId || null;
        }

        // Hoặc từ auth token
        const token = getAuthToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.userId || payload.sub || null;
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
};

export default function TimesheetHeader() {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [timesheetData, setTimesheetData] = useState<TimesheetResponse | null>(null); // Cập nhật type
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningData, setWarningData] = useState<any[]>([]);
    const [pendingWorkingTime, setPendingWorkingTime] = useState<number>(0);
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [note, setNote] = useState('');
    const [workingTime, setWorkingTime] = useState<string>('');
    const [type, setType] = useState<'Normal' | 'Overtime'>('Normal');
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingProjects, setIsFetchingProjects] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<TimesheetItem | null>(null);

    /* ================= FETCH ================= */
    /* ================= FETCH ================= */
    const fetchTimesheetData = async (date: Date) => {
        const token = getAuthToken();
        if (!token) return;

        setIsLoading(true);
        setError(null);
        try {
            let params: GetAllTimesheetRequest;

            if (viewMode === 'week') {
                // Week view: lấy dữ liệu cả tuần
                const weekStart = weekDates[0];
                const weekEnd = weekDates[6];
                params = {
                    startDate: formatDate(weekStart),
                    endDate: formatDate(weekEnd),
                    maxResultCount: 1000, // Tăng lên để lấy đủ
                    skipCount: 0
                };
            } else {
                // Day view: chỉ lấy ngày hiện tại
                params = {
                    startDate: formatDate(date),
                    endDate: formatDate(date),
                    maxResultCount: 100,
                    skipCount: 0
                };
            }

            // Sử dụng API mới
            const res = await getAllTimesheetsOfUser(token, params);
            console.log('📊 API Response:', res);

            if (res.success) {
                setTimesheetData(res.result);
                console.log('✅ Timesheet data loaded:', res.result?.items?.length || 0, 'items');

                // Log chi tiết từng item
                if (res.result?.items) {
                    res.result.items.forEach((item: TimesheetItem, index: number) => {
                        console.log(`📝 Item ${index + 1}:`, {
                            id: item.id,
                            projectName: item.projectName,
                            taskName: item.taskName,
                            workingTime: item.workingTime,
                            dateAt: item.dateAt,
                            note: item.note
                        });
                    });
                }
            } else {
                console.error('Failed to fetch timesheet:', res.error);
                setError(res.error?.message || 'Failed to load timesheet data');
            }
        } catch (error: any) {
            console.error('Error fetching timesheet:', error);
            setError('Error loading timesheet data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDayTimesheet = async () => {
        const token = getAuthToken();
        if (!token) return;

        const params: GetAllTimesheetRequest = {
            startDate: formatDate(currentDate),
            endDate: formatDate(currentDate),
            maxResultCount: 100,
            skipCount: 0
        };

        const res = await getAllTimesheetsOfUser(token, params);
        if (res.success) {
            setTimesheetData(res.result);
        }
    };

    const fetchWeekTimesheet = async () => {
        const token = getAuthToken();
        if (!token) return;

        const weekDates = getWeekDates(currentDate);

        const params: GetAllTimesheetRequest = {
            startDate: formatDate(weekDates[0]),
            endDate: formatDate(weekDates[6]),
            maxResultCount: 1000,
            skipCount: 0
        };

        const res = await getAllTimesheetsOfUser(token, params);
        if (res.success) {
            setTimesheetData(res.result);
        }
    };





    // Thêm useEffect để fetch lại khi viewMode thay đổi
    useEffect(() => {
        fetchWeekTimesheet();
    }, [currentDate]);


    const getWeekRange = (date: Date) => {
        const current = new Date(date);
        const day = current.getDay(); // 0 = Sunday

        const diffToMonday = day === 0 ? -6 : 1 - day;

        const monday = new Date(current);
        monday.setDate(current.getDate() + diffToMonday);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return { monday, sunday };
    };


    const fetchWeekData = async () => {
        const token = getAuthToken();
        if (!token) return;

        const { monday, sunday } = getWeekRange(currentDate);

        const res = await getTimekeepingDetails(
            token,
            monday.toISOString(),
            sunday.toISOString()
        );

        if (res.result) {
            setTimesheetData(res.result);
        }
    };




    /* ================= RENDER TIMESHEET ITEMS ================= */
    const renderTimesheetItems = () => {
        if (!timesheetData?.items) return null;

        // 🔥 CHỈ LẤY ITEM CỦA NGÀY ĐANG ACTIVE
        const itemsOfCurrentDay = timesheetData.items.filter(
            (item: TimesheetItem) =>
                new Date(item.dateAt).toDateString() ===
                currentDate.toDateString()
        );

        if (itemsOfCurrentDay.length === 0) {
            return (
                <div className="flex items-center justify-center h-32 text-gray-500">
                    No timesheets for this day
                </div>
            );
        }

        return (
            <div className="">
                {itemsOfCurrentDay.map((item: TimesheetItem, index: number) => {
                    const minutes = item.workingTime || 0;
                    const hh = Math.floor(minutes / 60);
                    const mm = minutes % 60;
                    const timeStr = `${hh.toString().padStart(2, '0')}:${mm
                        .toString()
                        .padStart(2, '0')}`;

                    const typeLabel =
                        item.typeOfWork === 1 ? 'Overtime' : 'Official';

                    return (
                        <div
                            key={item.id || index}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                        >
                            <div className="flex-1">
                                <div className="text-gray-900">
                                    [{item.projectCode} {item.projectName}]
                                    <span className="text-blue-600 font-medium">
                                        {item.taskName}
                                    </span>{' '}
                                    - {typeLabel}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {item.note || 'No note'}
                                </div>
                            </div>

                            <div className="w-20 text-right font-medium text-gray-700">
                                {timeStr}
                            </div>

                            <span className="ml-4 px-3 py-1 w-20 text-center rounded-full text-sm bg-green-500 text-white">
                                New
                            </span>

                            <div className="ml-4 flex items-center gap-3">
                                <button
                                    onClick={() => handleEditTimesheet(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDeleteTimesheet(item)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };





    // Thêm hàm edit tạm thời
    const handleEditTimesheet = (item: TimesheetItem) => {
        setEditingItem(item);
        setSelectedProject({
            projectCode: item.projectCode,
            projectName: item.projectName,
            customerName: item.customerName,
        });

        setSelectedTask({
            taskName: item.taskName,
            projectTaskId: item.projectTaskId,
        });

        setWorkingTime(item.workingTime.toString());
        setNote(item.note || '');
        setType(item.typeOfWork === 1 ? 'Overtime' : 'Normal');

        setShowAddModal(true); // dùng lại modal cũ
    };

    const handleDeleteTimesheet = async (item: TimesheetItem) => {
    const confirmDelete = confirm(
        `Are you sure you want to delete this timesheet?\n\nProject: ${item.projectName}\nTask: ${item.taskName}`
    );

    if (!confirmDelete) return;

    try {
        await deleteMyTimesheet(item.id);

        alert('✅ Deleted successfully');

        // Cách 1: Gọi lại API để reload
        await fetchTimesheetData(currentDate);

        // Cách 2 (nhanh hơn): update state local luôn
        // setTimesheetData(prev => {
        //     if (!prev) return prev;
        //     return {
        //         ...prev,
        //         items: prev.items.filter(i => i.id !== item.id),
        //         totalCount: prev.totalCount - 1
        //     };
        // });

    } catch (error: any) {
        console.error('❌ Delete failed:', error);
        alert('Delete failed: ' + error.message);
    }
};


    const fetchProjects = async () => {
        const token = getAuthToken();
        if (!token) return;

        setIsFetchingProjects(true);
        try {
            const res = await getProjectsIncludingTasks(token);
            if (Array.isArray(res)) {
                setProjects(res);
                console.log('✅ Projects loaded:', res.length);
            } else if (res?.result && Array.isArray(res.result)) {
                setProjects(res.result);
                console.log('✅ Projects loaded from result:', res.result.length);
            } else if (res?.data && Array.isArray(res.data)) {
                setProjects(res.data);
                console.log('✅ Projects loaded from data:', res.data.length);
            } else {
                console.warn('Unexpected projects response format:', res);
                setProjects([]);
            }
        } catch (e: any) {
            console.error('Error fetching projects:', e);
            alert(e.message || 'Failed to load projects');
            setProjects([]);
        } finally {
            setIsFetchingProjects(false);
        }
    };



    useEffect(() => {
        if (showAddModal) {
            fetchProjects();
        }
    }, [showAddModal]);

    const getTimesheetIds = () => {
        if (!timesheetData?.items) return [];
        return timesheetData.items.map((i: any) => i.id);
    };

    const handleSubmitWeek = async () => {
        const token = getAuthToken();
        if (!token) return;

        const ids = getTimesheetIds();
        if (ids.length === 0) {
            alert('No timesheets to submit');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await submitToPending(token, ids);
            console.log('✅ Submit response:', res);

            if (res.success) {
                setShowSubmitModal(false);
                alert('Submit successfully!');
                fetchTimesheetData(currentDate);
            } else {
                alert(res.error?.message || 'Submit failed');
            }
        } catch (error: any) {
            console.error('❌ Submit error:', error);
            alert(error.message || 'Submit failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateTimesheet = async (token: string, workingMinutes: number) => {
        if (!editingItem) return;

        try {
            const updateData: UpdateMyTimesheetRequest = {
                id: editingItem.id,
                projectTaskId: selectedTask.projectTaskId,
                workingTime: workingMinutes,
                note: note || '',
                typeOfWork: type === 'Overtime' ? 1 : 0,
                dateAt: formatDate(currentDate), // 👈 thêm dòng này
            };

            await updateMyTimesheet(updateData);

            alert('✅ Timesheet updated successfully');

            setEditingItem(null);
            setShowWarningModal(false);
            setShowAddModal(false);
            resetForm();

            await fetchTimesheetData(currentDate);
        } catch (e: any) {
            alert('Update failed: ' + e.message);
        }
    };


    const handleSaveTimesheet = async () => {
        const token = getAuthToken();
        if (!token) return;

        const workingMinutes = parseInt(workingTime);

        setPendingWorkingTime(workingMinutes);
        setIsSaving(true);

        try {
            const warningRes = await getMyTimesheetWarning(token, {
                dateAt: formatDate(currentDate),
                workingTime: workingMinutes,
            });

            if (warningRes.success && warningRes.result?.isWarning) {
                setWarningData([warningRes.result]);
                setShowAddModal(false);
                setTimeout(() => setShowWarningModal(true), 100);
            } else {
                if (editingItem) {
                    await updateTimesheet(token, workingMinutes);
                } else {
                    await createTimesheetDirectly(token, workingMinutes);
                }
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const createTimesheetDirectly = async (token: string, workingMinutes: number) => {
        try {
            // Kiểm tra xem selectedTask có projectTaskId không
            const projectTaskId = selectedTask.projectTaskId || selectedTask.id;
            if (!projectTaskId) {
                throw new Error('Task ID is required');
            }

            // Tạo request body
            const timesheetRequestData = {
                projectTaskId: projectTaskId,
                workingTime: workingMinutes,
                dateAt: formatDate(currentDate),
                note: note || '',
                typeOfWork: type === 'Overtime' ? 1 : 0,
            };

            console.log('📤 Creating timesheet with data:', timesheetRequestData);

            // Sử dụng hàm createTimesheet từ api.ts
            const res = await createTimesheet(token, timesheetRequestData);

            console.log('✅ Create response:', res);

            // Kiểm tra response
            if (res.success) {
                alert('✅ Timesheet created successfully!');
                setShowWarningModal(false);
                setShowAddModal(false);
                resetForm();

                // QUAN TRỌNG: Gọi lại API để lấy dữ liệu mới nhất
                await fetchTimesheetData(currentDate);

                // Cập nhật local state nếu cần
                if (res.result && timesheetData) {
                    const newItem = {
                        ...timesheetRequestData,
                        id: res.result.id,
                        projectName: selectedProject.projectName,
                        projectCode: selectedProject.projectCode,
                        taskName: selectedTask.taskName,
                        customerName: selectedProject.customerName,
                        status: 0, // Pending
                        creationTime: new Date().toISOString()
                    };

                    setTimesheetData(prev => {
                        if (prev) {
                            return {
                                ...prev,
                                items: [...prev.items, newItem as TimesheetItem],
                                totalCount: prev.totalCount + 1
                            };
                        }
                        return prev;
                    });
                }
            } else {
                const errorMsg = res.error?.message || 'Create failed without error message';
                console.error('❌ Create failed:', errorMsg);
                alert(`❌ Failed to create timesheet: ${errorMsg}`);
            }
        } catch (e: any) {
            console.error('❌ Create timesheet error:', e);
            alert('❌ Create timesheet failed: ' + (e.message || 'Unknown error'));
        }
    };

    const resetForm = () => {
        setSelectedProject(null);
        setSelectedTask(null);
        setNote('');
        setWorkingTime('');
        setType('Normal');
        setError(null);
    };

    const formatMinutesToHHmm = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    function WarningModal({
        date,
        items,
        loggedMinutes,
        onClose,
        onContinue,
    }: {
        date: string;
        items: any[];
        loggedMinutes: number;
        onClose: () => void;
        onContinue: () => void;
    }) {
        const w = items[0];

        return (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <div className="bg-white w-[640px] rounded-lg p-6 shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Warning log{' '}
                        <span className="font-bold">
                            {formatMinutesToHHmm(loggedMinutes)}
                        </span>{' '}
                        on{' '}
                        <span className="bg-green-500 text-white px-2 py-0.5 rounded text-sm">
                            {date}
                        </span>
                    </h2>

                    <table className="w-full border-t text-sm text-center">
                        <thead>
                            <tr className="text-gray-600">
                                <th>Check in</th>
                                <th>Check out</th>
                                <th>Off hour</th>
                                <th>Đi muộn</th>
                                <th>Về sớm</th>
                                <th>Logged timesheet</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-gray-700">
                                <td>{w?.checkInTime ?? '-:-'}</td>
                                <td>{w?.checkOutTime ?? '-:-'}</td>
                                <td>{w?.offHour ?? 0}</td>
                                <td>{w?.lateMinute ?? 0}</td>
                                <td>{w?.earlyLeaveMinute ?? 0}</td>
                                <td className="font-bold">
                                    {formatMinutesToHHmm(loggedMinutes)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onContinue}
                            className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ================= DATE ================= */
    const handlePrevDay = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        setCurrentDate(d);
    };

    const handleNextDay = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        setCurrentDate(d);
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const d = new Date(e.target.value);
        if (!isNaN(d.getTime())) setCurrentDate(d);
    };

    const formatDisplayDate = (d: Date) =>
        d.toISOString().split('T')[0];

    /* ================= WEEK ================= */
    const getWeekDates = (date: Date): Date[] => {
        const current = new Date(date);
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(current.setDate(diff));

        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    };

    const weekDates = getWeekDates(currentDate);

    const calculateHoursByDate = (date: Date) => {
        if (!timesheetData?.items) return '00:00';

        const totalMinutes = timesheetData.items
            .filter((item: TimesheetItem) => {
                const itemDate = new Date(item.dateAt);
                return itemDate.toDateString() === date.toDateString();
            })
            .reduce((sum: number, item: TimesheetItem) => {
                return sum + (item.workingTime || 0);
            }, 0);

        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;

        return `${h.toString().padStart(2, '0')}:${m
            .toString()
            .padStart(2, '0')}`;
    };


    const getDayName = (d: Date) =>
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];

    /* ================= TOTAL ================= */
    /* ================= TOTAL ================= */
    const calculateTotalHours = () => {
        if (!timesheetData?.items) return '00:00';

        const totalMinutes = timesheetData.items.reduce(
            (s, i) => s + (i.workingTime || 0),
            0
        );

        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    function NewTimesheetModal({
        date,
        onClose,
    }: {
        date: string;
        onClose: () => void;
    }) {
        const projectOptions = Array.isArray(projects)
            ? projects.map(p => ({
                value: p,
                label: `[${p.projectCode}] ${p.projectName}`
            }))
            : [];

        const taskOptions =
            selectedProject && Array.isArray(selectedProject.tasks)
                ? selectedProject.tasks.map((t: any) => ({
                    value: t,
                    label: t.taskName,
                    projectTaskId: t.projectTaskId || t.id
                }))
                : [];

        // 🔥 dropdown giờ 1h → 12h
        const workingTimeOptions = Array.from({ length: 12 }, (_, i) => ({
            value: (i + 1) * 60,
            label: `${i + 1}`
        }));

        return (
            <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
                <div className="bg-white w-[520px] rounded shadow-xl p-8">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-semibold text-gray-800">
                            {editingItem ? 'Edit Timesheet' : 'New Timesheet'}
                        </h2>
                        <span className="text-lg text-gray-700 font-medium">
                            {date}
                        </span>
                    </div>

                    <div className="space-y-8">

                        {/* Project */}
                        <div>
                            <label className="block text-gray-500 mb-2">
                                Project <span className="text-red-500">*</span>
                            </label>
                            <div className="border-b border-gray-400 pb-1 text-gray-700">
                                <Select
                                    options={projectOptions}
                                    value={
                                        selectedProject
                                            ? {
                                                value: selectedProject,
                                                label: `[${selectedProject.projectCode}] ${selectedProject.projectName}`
                                            }
                                            : null
                                    }
                                    onChange={(opt) => {
                                        setSelectedProject(opt?.value || null);
                                        setSelectedTask(null);
                                    }}
                                    classNamePrefix="select"
                                    styles={{
                                        control: base => ({
                                            ...base,
                                            border: "none",
                                            boxShadow: "none",
                                            minHeight: "30px"
                                        })
                                    }}
                                />
                            </div>
                        </div>

                        {/* Task */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gray-500">
                                    Task <span className="text-red-500">*</span>
                                </label>

                                <label className="flex items-center gap-2 text-gray-600 text-sm">
                                    <input type="checkbox" />
                                    Default
                                </label>
                            </div>

                            <div className="border-b border-gray-400 pb-1 text-gray-700">
                                <Select
                                    options={taskOptions}
                                    value={
                                        selectedTask
                                            ? {
                                                value: selectedTask,
                                                label: selectedTask.taskName
                                            }
                                            : null
                                    }
                                    onChange={(opt) =>
                                        setSelectedTask(opt?.value || null)
                                    }
                                    isDisabled={!selectedProject}
                                    classNamePrefix="select"
                                    styles={{
                                        control: base => ({
                                            ...base,
                                            border: "none",
                                            boxShadow: "none",
                                            minHeight: "30px"
                                        })
                                    }}
                                />
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-gray-500 mb-2">
                                Note
                            </label>
                            <textarea
                                className="w-full border-b border-gray-400 text-gray-700 outline-none resize-none pb-1"
                                rows={2}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        {/* Working Time */}
                        <div>
                            <label className="block text-gray-500 mb-2">
                                WorkingTime <span className="text-red-500">*</span>
                            </label>

                            <div className="border-b border-gray-400 pb-1 text-gray-700">
                                <input
                                    type="number"
                                    min={1}
                                    max={24}
                                    step={1}
                                    className="w-full outline-none bg-transparent text-gray-700 appearance-auto"
                                    value={workingTime}
                                    onChange={(e) => setWorkingTime(e.target.value)}
                                />
                            </div>
                        </div>


                        {/* Type */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">
                                Type
                            </label>
                            <div className="border-b border-gray-400 pb-1">
                                <select
                                    className="w-full outline-none bg-transparent text-gray-700"
                                    value={type}
                                    onChange={(e) =>
                                        setType(
                                            e.target.value as "Normal" | "Overtime"
                                        )
                                    }
                                >
                                    <option value="Normal">
                                        Normal working hours
                                    </option>
                                    <option value="Overtime">
                                        Overtime
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 mt-12">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded shadow"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSaveTimesheet}
                            disabled={
                                !selectedProject ||
                                !selectedTask ||
                                !workingTime ||
                                isSaving
                            }
                            className="px-6 py-2 bg-blue-400 text-white rounded shadow disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    }




    /* ================= WEEK VIEW ================= */
    const LEFT_WIDTH = "w-[320px]"; // chỉnh nếu muốn rộng hơn

    const renderWeekView = () => {
        const total = calculateTotalHours();

        return (
            <div className="px-6">
                <div className="max-w-[1200px] ml-auto">

                    {/* HEADER */}
                    <div className="flex py-3 text-sm font-medium text-gray-700">

                        {/* Left Empty Header */}
                        <div className={`${LEFT_WIDTH}`} />

                        {/* Right Days Header */}
                        <div className="flex-1 grid grid-cols-8 text-right pr-8">
                            {weekDates.map((d, i) => (
                                <div key={i}>
                                    <div>{getDayName(d)}</div>
                                    <div className="text-xs text-gray-400">
                                        {formatDisplayDate(d)}
                                    </div>
                                </div>
                            ))}
                            <div>Total</div>
                        </div>
                    </div>

                    {/* TOTAL ROW */}
                    <div className="flex py-2 text-sm text-gray-800">

                        <div className={LEFT_WIDTH}></div>

                        <div className="flex-1 grid grid-cols-8 text-right pr-8 font-bold">
                            {weekDates.map((d, i) => {
                                const time = calculateHoursByDate(d);

                                return (
                                    <div key={i}>
                                        {time !== "00:00" ? time : ""}
                                    </div>
                                );
                            })}

                            <div>{total !== "00:00" ? total : ""}</div>
                        </div>

                    </div>

                    {/* PROJECT ROW */}
                    {Object.values(
                        (timesheetData?.items || []).reduce((acc: any, item: TimesheetItem) => {
                            const key = `${item.projectCode}-${item.projectTaskId}`;

                            if (!acc[key]) {
                                acc[key] = {
                                    projectCode: item.projectCode,
                                    projectName: item.projectName,
                                    clientName: item.customerName,
                                    taskName: item.taskName,
                                    items: []
                                };
                            }

                            acc[key].items.push(item);
                            return acc;
                        }, {})
                    ).map((group: any, index: number) => {

                        const totalMinutesOfRow = group.items.reduce(
                            (sum: number, i: TimesheetItem) => sum + (i.workingTime || 0),
                            0
                        );

                        const totalH = Math.floor(totalMinutesOfRow / 60);
                        const totalM = totalMinutesOfRow % 60;

                        return (
                            <div key={index} className="flex bg-gray-50 py-4">

                                {/* LEFT INFO FROM API */}
                                <div className={`${LEFT_WIDTH} pr-4`}>
                                    <div className="font-medium text-sm text-gray-700">
                                        [{group.projectCode}] [{group.projectName}]
                                        {group.clientName && (
                                            <span className="text-gray-700">
                                                {" "}({group.clientName})
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-700 mt-1">
                                        {group.taskName}
                                    </div>
                                </div>

                                {/* RIGHT WEEK COLUMNS */}
                                <div className="flex-1 grid grid-cols-8 text-right pr-8 items-center text-gray-700">
                                    {weekDates.map((d, i) => {

                                        const minutes = group.items
                                            .filter((item: TimesheetItem) =>
                                                new Date(item.dateAt).toDateString() === d.toDateString()
                                            )
                                            .reduce(
                                                (sum: number, item: TimesheetItem) =>
                                                    sum + (item.workingTime || 0),
                                                0
                                            );



                                        const h = Math.floor(minutes / 60);
                                        const m = minutes % 60;

                                        const timeStr = `${h.toString().padStart(2, '0')}:${m
                                            .toString()
                                            .padStart(2, '0')}`;

                                        return (
                                            <div key={i}>
                                                <input
                                                    readOnly
                                                    className="w-16 text-center border rounded px-1 py-0.5 bg-white"
                                                    value={`${h.toString().padStart(2, '0')}:${m
                                                        .toString()
                                                        .padStart(2, '0')}`}
                                                />
                                            </div>
                                        );
                                    })}

                                    <div className="font-medium">
                                        {`${totalH.toString().padStart(2, '0')}:${totalM
                                            .toString()
                                            .padStart(2, '0')}`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}


                </div>
            </div>
        );
    };


    /* ================= RENDER ================= */
    return (
        <div className="bg-white rounded-lg shadow mb-6">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-2xl font-semibold text-gray-700">
                    {formatDisplayDate(currentDate)}
                </h2>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchTimesheetData(currentDate)}
                        className="bg-pink-600 text-white px-5 py-2 rounded hover:bg-pink-700 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                            </span>
                        ) : 'Refresh'}
                    </button>

                    <button
                        onClick={handleToday}
                        className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                        Today
                    </button>

                    <div className="flex border rounded overflow-hidden">
                        <button
                            onClick={handlePrevDay}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                            &lt;
                        </button>
                        <input
                            type="date"
                            value={formatDisplayDate(currentDate)}
                            onChange={handleDateChange}
                            className="px-3 py-2 w-32 text-center text-gray-700 outline-none"
                        />
                        <button
                            onClick={handleNextDay}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                            &gt;
                        </button>
                    </div>

                    <div className="flex border rounded overflow-hidden">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-4 py-2 ${viewMode === 'day' ? 'bg-gray-100 font-medium text-gray-700' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-4 py-2 ${viewMode === 'week' ? 'bg-gray-100 font-medium text-gray-700' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                        >
                            Week
                        </button>
                    </div>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                    <div className="text-red-600 text-sm">{error}</div>
                </div>
            )}

            {/* Content */}
            {viewMode === 'week' && renderWeekView()}

            {/* Day View Tabs */}
            {/* Day View Content */}
            {viewMode === 'day' && (
                <>
                    {/* Day View Tabs */}
                    <div className="px-6">
                        <div className="max-w-[1000px] mr-auto">
                            <div className="grid grid-cols-8 text-center text-sm border-b">
                                {weekDates.map((d, i) => {
                                    const isActive =
                                        d.toDateString() === currentDate.toDateString();

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setCurrentDate(d)}
                                            className={`py-3 cursor-pointer transition-colors ${isActive
                                                ? 'text-orange-600 border-b-2 border-orange-600 font-medium'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div>{getDayName(d)}</div>
                                            <div
                                                className={`mt-1 text-sm min-h-[20px] ${isActive ? 'text-orange-600' : 'text-gray-700'}`}
                                            >
                                                {calculateHoursByDate(d) !== "00:00"
                                                    ? calculateHoursByDate(d)
                                                    : ""}
                                            </div>

                                        </div>
                                    );
                                })}

                                {/* TOTAL */}
                                <div className="py-3 text-gray-800 font-bold">
                                    <div>Total</div>
                                    <div className="font-bold mt-1">
                                        {calculateTotalHours()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Timesheet List */}
                    {renderTimesheetItems()}
                </>
            )}


            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-orange-600 text-white w-14 h-10 rounded-sm text-2xl hover:bg-orange-800 transition-colors shadow-md hover:shadow-lg"
                    title="Add new timesheet"
                >
                    +
                </button>

                <button
                    onClick={() => setShowSubmitModal(true)}
                    className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition-colors"
                >
                    Submit Week for Approval
                </button>
            </div>

            {/* Add Timesheet Modal */}
            {showAddModal && (
                <NewTimesheetModal
                    date={formatDisplayDate(currentDate)}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                        resetForm();
                    }}
                />
            )}

            {/* Warning Modal */}
            {showWarningModal && (
                <WarningModal
                    date={formatDisplayDate(currentDate)}
                    items={warningData}
                    loggedMinutes={pendingWorkingTime}
                    onClose={() => {
                        setShowWarningModal(false);
                        resetForm();
                    }}
                    onContinue={async () => {
                        setIsSaving(true);
                        const token = getAuthToken();
                        if (token) {
                            if (editingItem) {
                                await updateTimesheet(token, pendingWorkingTime);
                            } else {
                                await createTimesheetDirectly(token, pendingWorkingTime);
                            }
                        }
                        setIsSaving(false);
                    }}
                />
            )}

            {/* Debug Panel - Chỉ hiển thị trong development */}
            {/* {process.env.NODE_ENV === 'development' && timesheetData && (
                <div className="px-6 py-2 bg-yellow-50 border-t border-yellow-200">
                    <details className="text-xs">
                        <summary className="cursor-pointer text-yellow-700">
                            📊 Debug: {timesheetData.items.length} items, Total: {calculateTotalHours()}
                        </summary>
                        <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-60">
                            {JSON.stringify(timesheetData.items, null, 2)}
                        </pre>
                    </details>
                </div>
            )} */}

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg w-[420px] p-6 text-center shadow-lg">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full border-4 border-orange-300 flex items-center justify-center">
                                <span className="text-orange-400 text-4xl font-bold">!</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Submit Timesheets for Approval
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to submit {getTimesheetIds().length} timesheet(s) for approval?
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="px-6 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmitWeek}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded bg-sky-400 text-white hover:bg-sky-500 disabled:opacity-60 transition-colors"
                            >
                                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}

        </div>
    );
}