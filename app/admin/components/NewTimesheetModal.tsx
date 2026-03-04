import { useState } from 'react';

interface NewTimesheetModalProps {
    date: string;
    onClose: () => void;
    onSave: (data: any) => void;
}

type SelectOption = {
    value: number;
    label: string;
};

export default function NewTimesheetModal({ date, onClose, onSave }: NewTimesheetModalProps) {
    const [project, setProject] = useState<SelectOption | null>(null);
    const [task, setTask] = useState<SelectOption | null>(null);
    const [type, setType] = useState<'Normal' | 'Overtime'>('Normal');
    const [workingTime, setWorkingTime] = useState<number>(0);
    const [note, setNote] = useState('');

    // Mock data - thay bằng API call thực tế
    const projectOptions = [
        { value: 1, label: 'Project A' },
        { value: 2, label: 'Project B' },
        { value: 3, label: 'Project C' },
    ];

    const taskOptions = [
        { value: 1, label: 'Development' },
        { value: 2, label: 'Testing' },
        { value: 3, label: 'Design' },
        { value: 4, label: 'Meeting' },
    ];

    const handleSave = () => {
        if (!project || !task || workingTime <= 0) {
            alert('Please fill all required fields');
            return;
        }

        onSave({
            projectId: project.value,
            projectName: project.label,
            taskId: task.value,
            taskName: task.label,
            type,
            workingTime,
            note,
            date
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
            <div className="bg-white w-[500px] rounded-lg p-6">
                {/* HEADER */}
                <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">New Timesheet</h2>
                    <span className="text-gray-600 font-medium">{date}</span>
                </div>

                {/* PROJECT */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project *
                    </label>
                    <select
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        value={project?.value || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            const selected = projectOptions.find(p => p.value.toString() === value);
                            setProject(selected || null);
                            setTask(null); // reset task khi đổi project
                        }}
                    >
                        <option value="">Select project</option>
                        {projectOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* TASK */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task *
                    </label>
                    <select
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        value={task?.value || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            const selected = taskOptions.find(t => t.value.toString() === value);
                            setTask(selected || null);
                        }}
                        disabled={!project}
                    >
                        <option value="">Select task</option>
                        {taskOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* NOTE */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note
                    </label>
                    <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter note..."
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                {/* WORKING TIME */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Working Time (minutes) *
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="1440"
                        step="30"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        value={workingTime || ''}
                        onChange={(e) => setWorkingTime(Number(e.target.value))}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                        {workingTime > 0 && (
                            <span>
                                {Math.floor(workingTime / 60)}h {workingTime % 60}m
                                {workingTime > 480 && (
                                    <span className="text-orange-600 ml-2">
                                        (More than 8 hours)
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {/* TYPE */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="Normal"
                                checked={type === 'Normal'}
                                onChange={(e) => setType(e.target.value as 'Normal')}
                                className="mr-2"
                            />
                            <span>Normal working hours</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="Overtime"
                                checked={type === 'Overtime'}
                                onChange={(e) => setType(e.target.value as 'Overtime')}
                                className="mr-2"
                            />
                            <span>Overtime</span>
                        </label>
                    </div>
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
                        disabled={!project || !task || workingTime <= 0}
                    >
                        Save & Continue
                    </button>
                </div>
            </div>
        </div>
    );
}