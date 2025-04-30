import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import axiosInstance from '../utils/api';

const PaymentHistory = () => {
    const { user } = useUser();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/payments/', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setPayments(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching payment history:', error);
                setError('Failed to load payment history. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user && user.token) {
            fetchPayments();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-100 p-4 mt-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Payment History</h1>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-10 bg-white shadow rounded">
                        <p className="text-gray-500">No payment history found.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow rounded overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Booking ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map(payment => (
                                    <tr key={payment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${payment.total_price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${payment.payment_status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    payment.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {payment.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
