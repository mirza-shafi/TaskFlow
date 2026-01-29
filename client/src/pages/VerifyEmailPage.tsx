import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiX, FiRefreshCcw } from 'react-icons/fi';
import * as authApi from '../api/auth.api';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token found.');
                return;
            }

            try {
                await authApi.verifyEmail(token);
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || err.response?.data?.detail || 'Verification failed. The link may be invalid or expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-display">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <FiRefreshCcw className="animate-spin text-primary mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Email...</h2>
                        <p className="text-slate-500">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <FiCheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
                        <p className="text-slate-500 mb-6">Your account has been successfully verified. You can now log in.</p>
                        <Link 
                            to="/login" 
                            className="inline-block w-full py-3 px-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
                        >
                            Proceed to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <FiX size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                        <p className="text-slate-500 mb-6">{message}</p>
                        <Link 
                            to="/login" 
                            className="text-primary font-bold hover:underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
