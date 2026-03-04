'use client';

import { AlertCircle } from 'lucide-react';
import { inactiveProject } from '@/src/lib/api';
import { useState, useEffect } from 'react';
import { toast } from "sonner";



interface Props {
    open: boolean;
    projectName?: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmDeactivateModal({
    open,
    projectName,
    onClose,
    onConfirm,
}: Props) {
    if (!open) return null;
    const [deactivating, setDeactivating] = useState(false);

 


    


    return (
        <div className="fixed inset-0  bg-black/40 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[400px] p-6 shadow-lg">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-orange-100 p-4 rounded-full mb-4">
                        <AlertCircle className="text-orange-400" size={36} />
                    </div>

                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                        Are you sure?
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Deactive project: '{projectName}'?
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onConfirm}
                            className="px-6 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
