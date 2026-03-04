'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi, getCurrentLoginInfo, getAbsenceTypes, setAuthToken } from '@/src/lib/api';

export default function NCCLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        userNameOrEmailAddress: '',
        password: '',
        rememberClient: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
    const [apiBaseUrl, setApiBaseUrl] = useState('');

    // Lấy API base URL từ env
    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://stg-api-timesheet.nccsoft.vn';
        setApiBaseUrl(baseUrl);

        // Kiểm tra API status
        checkApiStatus(baseUrl);
    }, []);

    const checkApiStatus = async (url: string) => {
        setApiStatus('checking');
        try {
            const response = await fetch(`${url}/api/services/app/Session/GetCurrentLoginInformations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401 || response.status === 200) {
                // 401 là OK vì chưa login, 200 là đã login
                setApiStatus('online');
            } else {
                setApiStatus('offline');
            }
        } catch {
            setApiStatus('offline');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.group('🔐 NCC Timesheet Login Attempt');
            console.log('📡 API Endpoint:', apiBaseUrl);
            console.log('👤 Username:', formData.userNameOrEmailAddress);
            console.log('🔐 Password:', formData.password ? '••••••••' : '(empty)');
            console.log('💾 Remember me:', formData.rememberClient);

            // 1. Login
            const loginResponse = await loginApi(formData);

            if (!loginResponse.success) {
                throw new Error(loginResponse.error?.message || 'Login failed');
            }

            const token = loginResponse.result.accessToken;
            console.log('✅ Token received:', token.substring(0, 20) + '...');

            // Lưu token
            setAuthToken(token, formData.rememberClient);

            // 2. Lấy thông tin user
            const userInfoResponse = await getCurrentLoginInfo(token);
            console.log('👤 User info loaded:', userInfoResponse.result.user.userName);

            // 3. Lấy absence types (optional)
            try {
                const absenceTypesResponse = await getAbsenceTypes(token);
                console.log(`📊 Absence types loaded: ${absenceTypesResponse.result?.length || 0}`);
            } catch (absenceError) {
                console.warn('⚠️ Could not load absence types:', absenceError);
            }

            console.groupEnd();

            // Redirect to dashboard
            router.push('/admin');

        } catch (err: any) {
            console.error('❌ Login failed:', err);

            // Hiển thị error message thân thiện
            let userFriendlyError = err.message;

            if (err.message.includes('timeout')) {
                userFriendlyError = 'Connection timeout. Please check your network.';
            } else if (err.message.includes('Failed to fetch')) {
                userFriendlyError = `Cannot connect to server. Please check if you can access: ${apiBaseUrl}`;
            } else if (err.message.includes('401')) {
                userFriendlyError = 'Invalid username or password.';
            } else if (err.message.includes('500')) {
                userFriendlyError = 'Server error. Please try again later.';
            }

            setError(userFriendlyError);
        } finally {
            setLoading(false);
        }
    };

    const handleMezonLogin = () => {
        const mezonClientId = process.env.NEXT_PUBLIC_MEZON_CLIENT_ID || 'timesheet';
        const mezonRedirectUri = process.env.NEXT_PUBLIC_MEZON_REDIRECT_URI || window.location.origin + '/login/callback';
        const mezonAuthUrl = process.env.NEXT_PUBLIC_MEZON_AUTH_URL || 'https://mezon.nccsoft.vn/oauth/authorize';

        const mezonUrl = `${mezonAuthUrl}?response_type=code&client_id=${encodeURIComponent(mezonClientId)}&redirect_uri=${encodeURIComponent(mezonRedirectUri)}&state=${Date.now()}`;

        console.log('🔗 Redirecting to Mezon:', mezonUrl);
        window.location.href = mezonUrl;
    };
    return (
        <div className="min-h-screen bg-[#08b6c9] flex flex-col items-center justify-center">
            {/* Title */}
            <h1 className="text-white text-4xl font-light mb-10">Timesheet</h1>

            {/* Login Card */}
            <div className="bg-white w-[420px] rounded shadow-md px-10 py-8">
                <h2 className="text-center text-gray-700 font-medium mb-8">Login</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username */}
                    <div className="flex items-center border-b border-gray-400 pb-2">
                        <svg
                            className="w-5 h-5 text-gray-500 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-3.33 0-6 1.34-6 3v1h12v-1c0-1.66-2.67-3-6-3z" />
                        </svg>
                        <input
                            name="userNameOrEmailAddress"
                            type="text"
                            value={formData.userNameOrEmailAddress}
                            onChange={handleChange}
                            placeholder="User name or email *"
                            className="w-full outline-none  text-gray-700 border-gray-700"
                            disabled={loading}
                        />
                    </div>

                    {/* Password */}
                    <div className="flex items-center border-b border-gray-400 pb-2">
                        <svg
                            className="w-5 h-5 text-gray-500 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5 8V6a5 5 0 1110 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h1zm2-2a3 3 0 116 0v2H7V6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password *"
                            className="w-full outline-none text-gray-700 border-gray-700"
                            disabled={loading}
                        />
                    </div>

                    {/* Remember + Login */}
                    <div className="flex items-center justify-between mt-6">
                        <label className="flex items-center text-sm text-gray-700">
                            <input
                                type="checkbox"
                                name="rememberClient"
                                checked={formData.rememberClient}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            Remember me
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded text-sm font-medium ${loading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-900 text-white hover:bg-red-600'
                                }`}
                        >
                            Log in
                        </button>
                    </div>

                    {/* Mezon */}
                    <button
                        type="button"
                        onClick={handleMezonLogin}
                        className="w-full mt-6 bg-[#3f51b5] hover:bg-[#34449c] text-white py-2 rounded text-sm"
                    >
                        Login with Mezon
                    </button>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-600 mt-4 text-center">
                            {error}
                        </p>
                    )}
                </form>
            </div>

            {/* Footer */}
            <p className="text-white text-xs mt-10 opacity-80">
                © 2026 Timesheet. Version 4.3.0.0 [20262701]
            </p>
        </div>
    );
}