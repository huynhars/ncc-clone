'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
    getTimeSheetStatisticTasks, getTimeSheetStatisticTeams

} from '@/src/lib/api';
import { TaskStatisticDto, TeamStatisticDto } from '@/src/lib/type';

interface Props {
    open: boolean;
    projectId: number | null;
    onClose: () => void;
}

export default function ProjectTimesheetModal({
    open,
    projectId,
    onClose,
}: Props) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'team'>('tasks');
    const [tasks, setTasks] = useState<TaskStatisticDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'year' | 'all'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [teams, setTeams] = useState<TeamStatisticDto[]>([]);


    // ✅ Hook phải nằm trước return
 useEffect(() => {
    if (!projectId || !open) return;

    const fetchData = async () => {
        try {
            setLoading(true);

            let startDate = '';
            let endDate = '';

            if (viewMode === 'week') {
                const { start, end } = getWeekRange(currentDate);
                startDate = start.toISOString();
                endDate = end.toISOString();
            }

            if (viewMode === 'month') {
                const { start, end } = getMonthRange(currentDate);
                startDate = start.toISOString();
                endDate = end.toISOString();
            }

            if (viewMode === 'year') {
                const { start, end } = getYearRange(currentDate);
                startDate = start.toISOString();
                endDate = end.toISOString();
            }

            if (activeTab === 'tasks') {
                const data = await getTimeSheetStatisticTasks(
                    projectId,
                    startDate,
                    endDate
                );
                setTasks(data || []);
            }

            if (activeTab === 'team') {
                const data = await getTimeSheetStatisticTeams(
                    projectId,
                    startDate,
                    endDate
                );
                setTeams(data || []);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();

}, [projectId, open, viewMode, currentDate, activeTab]);

    if (!open) return null;

    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        const day = start.getDay(); // 0 = Sunday
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    const getMonthRange = (date: Date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    const getYearRange = (date: Date) => {
        const start = new Date(date.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date.getFullYear(), 11, 31);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    const formatRange = () => {
        if (viewMode === 'week') {
            const { start, end } = getWeekRange(currentDate);
            return `Week: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
        }

        if (viewMode === 'month') {
            return `Month: ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
        }

        if (viewMode === 'year') {
            return `Year: ${currentDate.getFullYear()}`;
        }

        return 'All Time';
    };



    // ✅ Tính tổng giờ
    const totalHours = tasks.reduce(
        (sum, t) => sum + t.totalWorkingTime,
        0
    );

    const totalTeamHours = teams.reduce(
        (sum, t) => sum + (t.totalWorkingTime || 0),
        0
    );


    // ✅ Map + tính %
    const mappedTasks = tasks.map((t) => ({
        ...t,
        percent: totalHours
            ? Math.round((t.totalWorkingTime / totalHours) * 100)
            : 100,
    }));


    const totalBillable = teams.reduce(
        (sum, t) => sum + (t.billableWorkingTime || 0),
        0
    );

    const teamsWithPercent = teams.map((t) => ({
        ...t,
        percent:
            totalTeamHours > 0
                ? Math.round((t.totalWorkingTime / totalTeamHours) * 100)
                : 0,
    }));

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-[1050px] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-8 py-5 bg-gray-50 border-b">
                    <div className="flex items-center gap-6">
                        <div className="flex border rounded overflow-hidden">
                            <button
                                onClick={() => {
                                    if (viewMode === 'week') {
                                        const newDate = new Date(currentDate);
                                        newDate.setDate(newDate.getDate() - 7);
                                        setCurrentDate(newDate);
                                    }
                                    if (viewMode === 'month') {
                                        const newDate = new Date(currentDate);
                                        newDate.setMonth(newDate.getMonth() - 1);
                                        setCurrentDate(newDate);
                                    }
                                    if (viewMode === 'year') {
                                        const newDate = new Date(currentDate);
                                        newDate.setFullYear(newDate.getFullYear() - 1);
                                        setCurrentDate(newDate);
                                    }

                                }}
                                className="px-4 py-2 hover:bg-gray-100 border-r text-gray-700"
                            >
                                ◀
                            </button>

                            <button
                                onClick={() => {
                                    if (viewMode === 'week') {
                                        const newDate = new Date(currentDate);
                                        newDate.setDate(newDate.getDate() + 7);
                                        setCurrentDate(newDate);
                                    }
                                    if (viewMode === 'month') {
                                        const newDate = new Date(currentDate);
                                        newDate.setMonth(newDate.getMonth() + 1);
                                        setCurrentDate(newDate);
                                    }
                                    if (viewMode === 'year') {
                                        const newDate = new Date(currentDate);
                                        newDate.setFullYear(newDate.getFullYear() + 1);
                                        setCurrentDate(newDate);
                                    }
                                }}
                                className="px-4 py-2 hover:bg-gray-100 text-gray-700"
                            >
                                ▶
                            </button>

                        </div>

                        <h2 className="text-xl font-semibold text-gray-800">
                            {formatRange()}
                        </h2>

                        <select
                            value={viewMode}
                            onChange={(e) =>
                                setViewMode(e.target.value as 'week' | 'month' | 'all')
                            }
                            className="border rounded px-4 py-2 bg-white text-gray-700"
                        >
                            <option value="week" className='text-gray-700'>Week</option>
                            <option value="month" className='text-gray-700'>Month</option>
                            <option value="year" className='text-gray-700'>Year</option>
                            <option value="all" className='text-gray-700'>All</option>
                        </select>
                    </div>

                    <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow">
                        Export
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 px-8 border-b bg-white">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`py-4 text-sm font-medium ${activeTab === 'tasks'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-700 hover:text-gray-600'
                            }`}
                    >
                        Tasks
                    </button>

                    <button
                        onClick={() => setActiveTab('team')}
                        className={`py-4 text-sm font-medium ${activeTab === 'team'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-700 hover:text-gray-600'
                            }`}
                    >
                        Team
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">

                    {activeTab === 'tasks' && (
                        <div>

                            {/* Table Header */}
                            <div className="grid grid-cols-3 pb-4 border-b text-gray-700 font-semibold">
                                <div>Billable Tasks</div>
                                <div>HOURS</div>
                                <div>Billable Hours</div>
                            </div>

                            {loading && (
                                <div className="py-10 text-center text-gray-400">
                                    Loading...
                                </div>
                            )}

                            {!loading && mappedTasks.map((task) => (
                                <div
                                    key={task.taskId}
                                    className="grid grid-cols-3 items-center py-5 border-b text-gray-700"
                                >
                                    <div>{task.taskName}</div>

                                    {/* Progress */}
                                    <div className="flex items-center">
                                        <div className="w-full h-4 bg-green-800 rounded">
                                            <div
                                                className="h-4 bg-gray-400 rounded transition-all duration-500"
                                                style={{ width: `${task.percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-gray-600 px-4">
                                        {task.billableWorkingTime}h
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                    

                        {activeTab === "team" && (
                            <div>
                                {/* Header */}
                                <div className="grid grid-cols-3 pb-4 border-b text-gray-700 font-semibold">
                                    <div>Name</div>
                                    <div>Hour</div>
                                    <div>Billable Hour</div>
                                </div>

                                {loading && (
                                    <div className="py-10 text-center text-gray-400">
                                        Loading...
                                    </div>
                                )}

                                {!loading && (
                                    <>
                                        {/* TOTAL ROW */}
                                        <div className="grid grid-cols-3 items-center py-5 font-semibold text-gray-700">
                                            <div>Total</div>

                                            <div className="flex items-center">
                                                <div className="w-full h-4 bg-gray-200 rounded">
                                                    <div
                                                        className="h-4  rounded bg-green-800"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                            </div>

                                            <div>{totalBillable}h</div>
                                        </div>

                                        {/* MEMBER ROWS */}
                                        {teamsWithPercent.map((member) => (
                                            <div
                                                key={member.userID}
                                                className="grid grid-cols-3 items-center py-5 border-b"
                                            >
                                                <div className='text-gray-700'>{member.userName}</div>

                                                <div className="flex items-center">
                                                    <div className="w-full h-4 bg-green-700 rounded">
                                                        <div
                                                            className="h-4 rounded transition-all duration-500"
                                                            style={{ width: `${member.percent}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className='text-gray-700 px-4'>
                                                    {member.billableWorkingTime}h
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}


                    
                </div>


            </div>
        </div>
    );
}
