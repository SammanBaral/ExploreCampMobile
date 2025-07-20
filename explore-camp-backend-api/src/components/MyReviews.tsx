import apiService from '@/services/api';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const MyReviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            const res = await apiService.getUserReviews();
            if (res.data) {
                setReviews(res.data);
            } else {
                setReviews([]);
            }
            setLoading(false);
        };
        fetchReviews();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-20 px-4">
            <h2 className="text-xl font-bold my-4">My Reviews</h2>
            {loading ? (
                <div>Loading...</div>
            ) : reviews.length === 0 ? (
                <div className="text-muted-foreground">You have not written any reviews yet.</div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review: any) => (
                        <div key={review.id} className="bg-white rounded-lg shadow p-4 border">
                            <div className="flex items-center gap-2 mb-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span className="font-semibold">{review.rating}</span>
                                <span className="text-xs text-muted-foreground ml-2">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                            </div>
                            <div className="font-medium">{review.product?.name || 'Campsite'}</div>
                            <div className="text-sm text-muted-foreground mt-1">{review.comment}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReviews; 