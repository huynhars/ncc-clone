interface WarningModalProps {
    date: string;
    items: any[];
    loggedMinutes: number;
    onClose: () => void;
    onContinue: () => void;
}

export default function WarningModal({
    date,
    items,
    loggedMinutes,
    onClose,
    onContinue,
}: WarningModalProps) {
    const formatMinutesToHHmm = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const w = items[0] || {};

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
            <div className="bg-white w-[720px] rounded-lg p-6 shadow-xl">
                {/* HEADER */}
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    ⚠️ Warning log{' '}
                    <span className="font-bold">
                        {formatMinutesToHHmm(loggedMinutes)}
                    </span>{' '}
                    on{' '}
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                        {date}
                    </span>
                </h2>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full border text-sm text-center">
                        <thead className="bg-gray-50">
                            <tr className="text-gray-600">
                                <th className="border px-4 py-2">Check in</th>
                                <th className="border px-4 py-2">Check out</th>
                                <th className="border px-4 py-2">Off hour</th>
                                <th className="border px-4 py-2">Đi muộn</th>
                                <th className="border px-4 py-2">Về sớm</th>
                                <th className="border px-4 py-2 bg-yellow-50">Logged timesheet</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-4 py-3 font-medium">{w?.checkInTime ?? '-:-'}</td>
                                <td className="border px-4 py-3 font-medium">{w?.checkOutTime ?? '-:-'}</td>
                                <td className="border px-4 py-3">{w?.offHour ?? 0}</td>
                                <td className="border px-4 py-3">{w?.lateMinute ?? 0}</td>
                                <td className="border px-4 py-3">{w?.earlyLeaveMinute ?? 0}</td>
                                <td className="border px-4 py-3 font-bold text-red-600 bg-yellow-50">
                                    {formatMinutesToHHmm(loggedMinutes)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* WARNING MESSAGE */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-start">
                        <span className="text-yellow-500 mr-2">ℹ️</span>
                        <div>
                            <p className="text-sm text-yellow-800">
                                You're logging <strong>{formatMinutesToHHmm(loggedMinutes)}</strong> hours for this day.
                            </p>
                            <p className="text-sm text-yellow-800 mt-1">
                                Make sure this matches your actual working hours.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onContinue}
                        className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
                    >
                        Continue & Save Timesheet
                    </button>
                </div>
            </div>
        </div>
    );
}