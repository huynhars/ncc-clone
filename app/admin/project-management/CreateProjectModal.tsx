'use client';

import { X, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAllBranchFilter, getAllCustomers, saveProject, getAllTasks, getUserNotPagging } from '@/src/lib/api';
import { BranchDto, CustomerDto, ProjectDto, SaveProjectRequest, TaskDto, ProjectUserInput, ProjectTaskInput, UserDto } from '@/src/lib/type';

interface Props {
    open: boolean;
    onClose: () => void;
    project?: ProjectDto | null;
    onSuccess?: () => void;
}

interface SelectedTask {
    id: number;
    name: string;
    billable: boolean;
    projectTaskId?: number;
}

interface SelectedUser {
    userId: number;
    type: number;
    isTemp: boolean;
    id: number;
    name?: string;
    email?: string;
    branch?: string;
    userType?: string;
}

export default function CreateProjectModal({ open, onClose, project, onSuccess }: Props) {
    const [activeTab, setActiveTab] = useState('general');
    const [allowTeambuilding, setAllowTeambuilding] = useState<boolean>(true);
    const [projectType, setProjectType] = useState<string>('Product');
    const [showSelected, setShowSelected] = useState(true);
    const [showDeactive, setShowDeactive] = useState(false);
    const [searchMember, setSearchMember] = useState('');
    const [branches, setBranches] = useState<BranchDto[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<number | "">("");
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<number | "">("");
    const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([]);
    const [openSelectTask, setOpenSelectTask] = useState(true);
    const [projectName, setProjectName] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
    const [saving, setSaving] = useState(false);
    const [openUserDrawer, setOpenUserDrawer] = useState(false);
    const [note, setNote] = useState('');
    const [allTasks, setAllTasks] = useState<TaskDto[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<UserDto[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);



    // Mock data for users (replace with actual API call)


    // Reset form khi modal đóng/mở
    useEffect(() => {
        if (open) {
            if (project) {
                // Load project data when editing
                setProjectName(project.name || '');
                setProjectCode(project.code || '');
                if (project && customers.length > 0) {
                    setSelectedCustomer(project.customerId ?? "");
                }
                setStartDate(project.timeStart ? project.timeStart.slice(0, 10) : '');
                setEndDate(project.timeEnd ? project.timeEnd.slice(0, 10) : '');
                setAllowTeambuilding(project.isAllowTeamBuilding ?? true);
                setNote(project.note || '');

                // Set project type based on projectType value
                const typeMap: { [key: number]: string } = {
                    0: 'T&M',
                    1: 'Fixed Price',
                    2: 'Non-Bill',
                    3: 'ODC',
                    4: 'Product',
                    5: 'Training',
                    6: 'NoSalary'
                };
                setProjectType(typeMap[project.projectType] || 'Product');

                // Load tasks if available
                if (project.tasks && project.tasks.length > 0) {
                    setSelectedTasks(project.tasks.map(task => ({
                        id: task.taskId,
                        name: task.taskName,
                        billable: task.billable,

                    })));
                } else {
                    setSelectedTasks([]);
                }
            } else {
                // Reset form when creating new
                setProjectName('');
                setProjectCode('');
                setSelectedCustomer("");
                setStartDate('');
                setEndDate('');
                setSelectedTasks([]);
                setSelectedUsers([]);
                setAllowTeambuilding(true);
                setProjectType('Product');
                setNote('');
            }
            setActiveTab('general');
        }
    }, [open, project, customers]);

    useEffect(() => {
        if (!open) return;

        const fetchBranches = async () => {
            try {
                setLoadingBranches(true);
                const data = await getAllBranchFilter({ isAll: true });
                setBranches(data);
            } catch (error) {
                console.error("Failed to fetch branches:", error);
                setBranches([]);
            } finally {
                setLoadingBranches(false);
            }
        };

        fetchBranches();
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const fetchCustomers = async () => {
            try {
                setLoadingCustomers(true);
                const data = await getAllCustomers();
                setCustomers(data || []);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            } finally {
                setLoadingCustomers(false);
            }
        };

        fetchCustomers();
    }, [open]);

    useEffect(() => {
        if (!allTasks.length) return;
        if (project) return; // chỉ auto khi create

        const defaultTasks = allTasks
            .filter(task => task.type === 0 && !task.isDeleted)
            .map(task => ({
                id: task.id,
                name: task.name,
                billable: true
            }));

        setSelectedTasks(defaultTasks);

    }, [allTasks, project]);







    const addTask = (task: { id: number; name: string }) => {
        setSelectedTasks(prev => [
            {
                id: task.id,
                name: task.name,
                billable: true
            },
            ...prev
        ]);
    };

    useEffect(() => {
        if (!open) return;

        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);
                const data = await getUserNotPagging();
                setAvailableUsers(data || []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setAvailableUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [open]);

    const formatDate = (date: string) => {
        return new Date(date).toISOString();
    };



    const addUser = (user: UserDto) => {
        if (selectedUsers.some(u => u.userId === user.id)) return;

        const newUser: SelectedUser = {
            userId: user.id,
            type: user.type,
            isTemp: false,
            id: 0,
            name: user.name,
            email: user.emailAddress,
            branch: user.branchDisplayName,
            userType: user.type === 0 ? "Staff" : "Intern"
        };
        console.log(newUser)
        setSelectedUsers(prev => [...prev, newUser]);
    };

    useEffect(() => {
        if (!open) return;

        const fetchTasks = async () => {
            try {
                setLoadingTasks(true);
                const data = await getAllTasks();

                const mappedTasks = (data || []).map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    type: t.type,
                    isDeleted: t.isDeleted
                }));



                setAllTasks(mappedTasks);

            } catch (error) {
                console.error("Failed to fetch tasks:", error);
                setAllTasks([]);
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchTasks();
    }, [open]);







    const removeTask = (taskName: string) => {
        setSelectedTasks(prev =>
            prev.filter(t => t.name !== taskName)
        );
    };

    const removeUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.filter(u => u.userId !== userId)
        );
    };

    const toggleBillable = (taskName: string) => {
        setSelectedTasks(prev =>
            prev.map(t =>
                t.name === taskName
                    ? { ...t, billable: !t.billable }
                    : t
            )
        );
    };

    const toggleAllBillable = () => {
        const allChecked = selectedTasks.every(task => task.billable);
        const updated = selectedTasks.map(task => ({
            ...task,
            billable: !allChecked
        }));
        setSelectedTasks(updated);
    };

    const getProjectTypeValue = (type: string): number => {
        const typeMap: { [key: string]: number } = {
            'T&M': 0,
            'Fixed Price': 1,
            'Non-Bill': 2,
            'ODC': 3,
            'Product': 4,
            'Training': 5,
            'NoSalary': 6
        };
        return typeMap[type] || 0;
    };

    const validateForm = (): boolean => {
        if (!projectName.trim()) {
            alert('Project name is required');
            return false;
        }

        if (!projectCode.trim()) {
            alert('Project code is required');
            return false;
        }

        if (!selectedCustomer) {
            alert('Please select a customer');
            return false;
        }

        if (!startDate) {
            alert('Start date is required');
            return false;
        }

        if (selectedUsers.length === 0) {
            alert('Project must have at least 1 member');
            return false;
        }

        // 🔥 QUAN TRỌNG: phải có ít nhất 1 PM
        const hasPM = selectedUsers.some(u => u.type === 1);

        if (!hasPM) {
            alert('Project must have at least 1 PM');
            return false;
        }

        // 🔥 Nếu backend bắt buộc có task
        if (selectedTasks.length === 0) {
            alert('Project must have at least 1 task');
            return false;
        }

        return true;
    };




    const handleSave = async () => {
        try {
            if (!validateForm()) return;

            setSaving(true);

            const payload: SaveProjectRequest = {
                id: project ? project.id : 0,
                name: projectName.trim(),
                code: projectCode.trim(),
                status: project ? project.status : 0,

                timeStart: formatDate(startDate),
                timeEnd: endDate ? formatDate(endDate) : null, // ✅ dùng null

                note: note || "",

                projectType: getProjectTypeValue(projectType),
                customerId: Number(selectedCustomer),

                tasks: selectedTasks.map(t => ({
                    projectId: project ? project.id : 0,
                    taskId: t.id,
                    billable: t.billable,
                    id: t.projectTaskId || 0
                })),

                users: selectedUsers.map(u => ({
                    userId: u.userId,
                    type: u.type,
                    isTemp: u.isTemp,
                    id: u.id || 0
                })),

                projectTargetUsers: [],

                notifyChannel: 0,
                mezonUrl: "",
                komuChannelId: "",

                isNotifyToKomu: false,
                isNoticeKMSubmitTS: false,
                isNoticeKMApproveRejectTimesheet: false,
                isNoticeKMRequestOffDate: false,
                isNoticeKMApproveRequestOffDate: false,
                isNoticeKMRequestChangeWorkingTime: false,
                isNoticeKMApproveChangeWorkingTime: false,
                isAllUserBelongTo: false,
                isAllowTeamBuilding: allowTeambuilding ?? false
            };

            console.log("FINAL PAYLOAD:", payload);

            await saveProject(payload);

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("SAVE ERROR FULL:", error);
        } finally {
            setSaving(false);
        }
    };


    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-[1000px] max-h-[90vh] rounded-xl shadow-lg overflow-y-auto relative">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {project ? "Edit Project" : "Create Project"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 p-2 rounded text-black"
                        disabled={saving}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Tab */}
                <div className="flex border-b px-8">
                    {['general', 'team', 'tasks', 'notification'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 capitalize transition ${activeTab === tab
                                ? 'border-b-2 border-red-500 text-black font-medium'
                                : 'text-gray-500 hover:text-black'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-6">
                    {activeTab === 'general' && (
                        <>
                            {/* Client */}
                            <div>
                                <label className="block font-medium mb-2 text-gray-700">
                                    Client *
                                </label>
                                <div className="flex gap-4">
                                    <select
                                        value={selectedCustomer}
                                        onChange={(e) =>
                                            setSelectedCustomer(e.target.value ? Number(e.target.value) : "")
                                        }
                                        disabled={loadingCustomers}
                                        className="border rounded w-full px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            {loadingCustomers ? "Loading..." : "Choose a customer..."}
                                        </option>
                                        {customers?.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name} - [{customer.code}]
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="bg-red-500 hover:bg-red-600 text-white px-5 rounded flex items-center gap-2"
                                    >
                                        + New Client
                                    </button>
                                </div>
                            </div>

                            {/* Project Name */}
                            <div>
                                <label className="block font-medium mb-2 text-gray-700">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="border rounded w-full px-4 py-3 text-black"
                                    placeholder="Enter project name"
                                />
                            </div>

                            {/* Project Code */}
                            <div>
                                <label className="block font-medium mb-2 text-gray-700">
                                    Project Code *
                                </label>
                                <input
                                    type="text"
                                    value={projectCode}
                                    onChange={(e) => setProjectCode(e.target.value)}
                                    className="border rounded w-full px-4 py-3 text-black"
                                    placeholder="Enter project code"
                                />
                            </div>

                            {/* Dates */}
                            <div>
                                <label className="block font-medium mb-2 text-gray-700">
                                    Dates *
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-full">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="border rounded w-full px-4 py-3"
                                        />
                                        <Calendar
                                            size={18}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black"
                                        />
                                    </div>
                                    <span className="text-gray-500">to</span>
                                    <div className="relative w-full">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="border rounded w-full px-4 py-3"
                                        />
                                        <Calendar
                                            size={18}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block font-medium mb-2 text-gray-700">
                                    Note
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="border rounded w-full px-4 py-3 text-black"
                                    placeholder="Enter project note"
                                    rows={3}
                                />
                            </div>

                            {/* Allow Teambuilding */}
                            <div>
                                <label className="block font-medium mb-3 text-gray-700">
                                    Allow Teambuilding *
                                </label>
                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setAllowTeambuilding(true)}
                                        className={`py-3 rounded border transition ${allowTeambuilding
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'bg-white text-gray-700'
                                            }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAllowTeambuilding(false)}
                                        className={`py-3 rounded border transition ${!allowTeambuilding
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'bg-white text-gray-700'
                                            }`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>

                            {/* Project Type */}
                            <div>
                                <label className="block font-medium mb-3 text-gray-700">
                                    Project Type *
                                </label>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        'T&M',
                                        'Fixed Price',
                                        'Non-Bill',
                                        'ODC',
                                        'Product',
                                        'Training',
                                        'NoSalary',
                                    ].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setProjectType(type)}
                                            className={`py-3 rounded border transition ${projectType === type
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : 'bg-white text-gray-700'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'team' && (
                        <div className="flex gap-6">
                            {/* LEFT PANEL */}
                            <div className="flex-1 border rounded-md overflow-hidden">
                                {/* Header */}
                                <div
                                    onClick={() => setShowSelected(!showSelected)}
                                    className="flex items-center justify-between px-6 py-4 bg-gray-100 cursor-pointer"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Selected member
                                    </h3>
                                    <span className="text-gray-600 text-lg">
                                        {showSelected ? "▴" : "▾"}
                                    </span>
                                </div>

                                {/* Luôn hiển thị phần này khi right panel mở, bất kể showSelected */}
                                {openUserDrawer && (
                                    <div className="px-6 py-4 bg-white border-b">
                                        <div className="flex items-center justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setOpenUserDrawer(false)}
                                                className="bg-red-400 hover:bg-red-600 text-white px-6 py-2 rounded-md shadow transition flex items-center gap-2"
                                            >
                                                <span>Exit add</span>
                                                <span>✕</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showSelected && (
                                    <div className="px-6 py-6 space-y-6 bg-white">
                                        {/* Top controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={showDeactive}
                                                    onChange={(e) => setShowDeactive(e.target.checked)}
                                                    className="w-4 h-4 accent-red-500"
                                                />
                                                <span className="text-gray-700 font-medium">
                                                    Show deactive member
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                {/* Search */}
                                                <div className="relative w-[350px]">
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name, email"
                                                        value={searchMember}
                                                        onChange={(e) => setSearchMember(e.target.value)}
                                                        className="w-full border-b border-gray-400 py-2 pl-8 focus:outline-none focus:border-gray-600"
                                                    />
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500">
                                                        🔍
                                                    </span>
                                                </div>

                                                {/* Chỉ hiện Add users khi chưa mở right panel */}
                                                {!openUserDrawer && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenUserDrawer(true)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md shadow transition"
                                                    >
                                                        Add users
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Member list area */}
                                        <div className="space-y-4">
                                            {selectedUsers.map((user) => (
                                                <div
                                                    key={user.userId}
                                                    className="flex items-center gap-4 px-4 py-3 border rounded-md"
                                                >
                                                    <div className="flex flex-col flex-1">
                                                        <span className="font-semibold">
                                                            {user.name || `User ${user.userId}`}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {user.email || `user${user.userId}@ncc.asia`}
                                                        </span>
                                                        {user.branch && (
                                                            <span className="text-xs text-gray-400">
                                                                Branch: {user.branch}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Remove button */}
                                                    <button
                                                        onClick={() => removeUser(user.userId)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT PANEL (chỉ hiện khi bấm Add users) */}
                            {openUserDrawer && (
                                <div className="w-[480px] border rounded-md bg-white shadow-xl flex flex-col">
                                    {/* HEADER */}
                                    <div className="px-6 py-4 border-b flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            Select team member
                                        </h2>
                                        <button
                                            onClick={() => setOpenUserDrawer(false)}
                                            className="text-gray-500 hover:text-black"
                                        >
                                            ▴
                                        </button>
                                    </div>

                                    {/* FILTER ROW */}
                                    <div className="px-6 py-4 border-b flex items-end gap-6">
                                        {/* Branch */}
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 mb-1">Branch</span>
                                            <select
                                                value={selectedBranch}
                                                onChange={(e) =>
                                                    setSelectedBranch(e.target.value ? Number(e.target.value) : "")
                                                }
                                                className="border-b border-gray-400 focus:outline-none py-1 w-[90px] bg-transparent"
                                            >
                                                <option value="">All</option>
                                                {branches.map((b) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Type */}
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 mb-1">Type</span>
                                            <select
                                                className="border-b border-gray-400 focus:outline-none py-1 w-[90px] bg-transparent"
                                            >
                                                <option>All</option>
                                                <option>Staff</option>
                                                <option>Intern</option>
                                            </select>
                                        </div>

                                        {/* Search */}
                                        <div className="flex items-center border-b border-gray-400 flex-1 pb-1">
                                            <span className="text-gray-500 mr-2">🔍</span>
                                            <input
                                                type="text"
                                                placeholder="Search by name, email"
                                                className="w-full focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* USER LIST */}
                                    <div className="flex-1 overflow-y-auto">
                                        {loadingUsers && (
                                            <div className="p-6 text-gray-500">Loading users...</div>
                                        )}

                                        {!loadingUsers && availableUsers.map((user) => (

                                            <div
                                                key={user.id}
                                                onClick={() => addUser(user)}
                                                className="flex items-center gap-4 px-6 py-4 border-b hover:bg-gray-100 cursor-pointer"
                                            >
                                                {/* Arrow */}
                                                <span className="text-xl text-gray-500">‹</span>

                                                {/* Avatar */}
                                                <img
                                                    src={user.avatarFullPath || "/default-avatar.png"}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                    alt={user.name}
                                                />

                                                {/* Info */}
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-800">
                                                            {user.name}
                                                        </span>

                                                        {/* Branch badge */}
                                                        <span
                                                            className="text-xs text-white px-2 py-0.5 rounded-full"
                                                            style={{ backgroundColor: user.branchColor || "#ef4444" }}
                                                        >
                                                            {user.branchDisplayName}
                                                        </span>

                                                        {/* Type badge */}
                                                        <span className="text-xs bg-red-400 text-white px-2 py-0.5 rounded-full">
                                                            {user.type === 0 ? "Staff" : "Intern"}
                                                        </span>
                                                    </div>

                                                    <span className="text-sm text-gray-600">
                                                        {user.emailAddress}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="bg-white border rounded-md">
                            {/* SELECTED TASK */}
                            <div className="border-b">
                                <div className="grid grid-cols-2 px-6 py-3 bg-gray-50 font-medium text-gray-700">
                                    <div>Tasks</div>
                                    <div className="flex justify-end items-center gap-2">
                                        <span>Billable</span>
                                        <input
                                            type="checkbox"
                                            checked={selectedTasks.length > 0 && selectedTasks.every(t => t.billable)}
                                            onChange={toggleAllBillable}
                                            className="w-4 h-4 accent-red-500"
                                        />
                                    </div>
                                </div>

                                {selectedTasks.map((task, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-2 items-center px-6 py-4 border-t hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => removeTask(task.name)}
                                                className="text-gray-500 hover:text-black text-lg"
                                            >
                                                ✕
                                            </button>
                                            <span className="text-gray-800">{task.name}</span>
                                        </div>
                                        <div className="flex justify-end">
                                            <input
                                                type="checkbox"
                                                checked={task.billable}
                                                onChange={() => toggleBillable(task.name)}
                                                className="w-4 h-4 accent-red-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* SELECT TASK */}
                            <div className="border-t">
                                <div
                                    onClick={() => setOpenSelectTask(!openSelectTask)}
                                    className="flex justify-between items-center px-6 py-4 cursor-pointer bg-gray-50"
                                >
                                    <h3 className="font-medium text-gray-700">Select task</h3>
                                    <span className={`transition-transform ${openSelectTask ? "rotate-180" : ""}`}>
                                        ⌃
                                    </span>
                                </div>

                                {openSelectTask && (
                                    <div>
                                        {loadingTasks && (
                                            <div className="px-6 py-4 text-gray-500">
                                                Loading tasks...
                                            </div>
                                        )}

                                        {!loadingTasks &&
                                            allTasks
                                                .filter(task => !selectedTasks.some(t => t.id === task.id))
                                                .map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="grid grid-cols-2 items-center px-6 py-4 border-t hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => addTask(task)}
                                                                className="text-xl text-gray-600 hover:text-black"
                                                            >
                                                                ⊕
                                                            </button>
                                                            <span className="text-gray-900">
                                                                {task.name}
                                                            </span>
                                                        </div>
                                                        <div className="text-gray-500 text-sm text-right">
                                                            Task
                                                        </div>
                                                    </div>
                                                ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                    {activeTab === 'notification' && (
                        <div className="bg-white border rounded-sm">
                            {/* ===== TOP SECTION ===== */}
                            <div className="p-6 space-y-6">
                                {/* Radio KOMU / Mezon */}
                                <div className="flex items-center gap-8">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="notiType"
                                            defaultChecked
                                            className="w-5 h-5 accent-red-500"
                                        />
                                        <span className="font-semibold text-gray-800">KOMU</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="notiType"
                                            className="w-5 h-5 accent-gray-500"
                                        />
                                        <span className="font-semibold text-gray-800">Mezon</span>
                                    </label>
                                </div>

                                {/* Komu Channel Id */}
                                <div className="space-y-2">
                                    <label className="text-gray-600">Komu Channel Id</label>
                                    <input
                                        type="text"
                                        className="w-full border-b border-gray-300 focus:outline-none focus:border-gray-500 py-2"
                                    />
                                </div>
                            </div>

                            {/* ===== DIVIDER ===== */}
                            <div className="border-t" />

                            {/* ===== CHECKBOX LIST ===== */}
                            <div className="p-6 space-y-4">
                                {[
                                    "Submit timesheet",
                                    "Request Off/Remote/Onsite/Đi muộn, về sớm",
                                    "Approve/Reject Request Off/Remote/Onsite/Đi muộn, về sớm",
                                    "Request Change Working Time",
                                    "Approve/Reject Timesheet",
                                    "Approve/Reject Change Working Time",
                                ].map((item, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-red-500"
                                        />
                                        <span className="text-red-700 font-medium">
                                            {item}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 px-8 py-6 border-t">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-6 py-2 bg-white text-black border rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : (project ? 'Update' : 'Create')}
                    </button>
                </div>
            </div>
        </div>
    );
}