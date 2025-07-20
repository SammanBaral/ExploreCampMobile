import apiService from '@/services/api';
import { useEffect, useState } from 'react';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            const res = await apiService.getUserBookings();
            if (res.data) {
                setTransactions(res.data);
            } else {
                setTransactions([]);
            }
            setLoading(false);
        };
        fetchTransactions();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-20 px-4">
            <h2 className="text-xl font-bold my-4">Transaction History</h2>
            {loading ? (
                <div>Loading...</div>
            ) : transactions.length === 0 ? (
                <div className="text-muted-foreground">No transactions found.</div>
            ) : (
                <div className="space-y-4">
                    {transactions.map((tx: any) => (
                        <div key={tx.id} className="bg-white rounded-lg shadow p-4 border flex items-center justify-between">
                            <div>
                                <div className="font-medium">{tx.product?.name || 'Campsite'}</div>
                                <div className="text-sm text-muted-foreground">{tx.checkIn ? new Date(tx.checkIn).toLocaleDateString() : ''} - {tx.checkOut ? new Date(tx.checkOut).toLocaleDateString() : ''}</div>
                                <div className="text-xs text-muted-foreground">Status: {tx.status}</div>
                            </div>
                            <div className="text-right font-semibold text-green-700">Rs. {tx.totalPrice}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory; 