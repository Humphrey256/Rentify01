
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const ReviewForm = () => {
    const { rentalId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!rating || !comment) {
            setError('All fields are required.');
            return;
        }

        try {
            await axios.post(
                'http://localhost:8000/api/reviews/',
                {
                    rental: rentalId,
                    rating,
                    comment,
                },
                {
                    headers: {
                        'Authorization': `Token ${user.token}`,
                    },
                }
            );
            navigate(`/rentals/${rentalId}`);
        } catch (error) {
            console.error('Error submitting review:', error);
            setError('Error submitting review.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Submit Review</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
                <div className="mb-4">
                    <label className="block text-gray-700">Rating</label>
                    <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Comment</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Submit Review
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
