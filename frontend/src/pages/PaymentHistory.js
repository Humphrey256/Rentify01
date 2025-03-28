import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import API_BASE_URL from '../utils/api';

const PaymentHistory = () => {
    const { user } = useUser();
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/payments/`, {
                    headers: { Authorization: `Token ${user.token}` },
                });
                setPayments(response.data);
            } catch (error) {
                console.error('Error fetching payment history:', error);
            }
        };

        fetchPayments();
    }, [user.token]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Payment History</h1>
            <ul>
                {payments.map(payment => (
                    <li key={payment.id} className="mb-2 p-4 bg-white shadow rounded">
                        <p>Booking ID: {payment.id}</p>
                        <p>Amount: ${payment.total_price}</p>
                        <p>Status: {payment.payment_status}</p>
                        <p>Date: {new Date(payment.created_at).toLocaleDateString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PaymentHistory;
