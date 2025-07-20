import { Button } from '@/components/ui/button';
import { useState } from 'react';

const PaymentMethods = () => {
    const [methods, setMethods] = useState([
        { id: 1, type: 'eSewa', detail: '9800000000' },
        { id: 2, type: 'Khalti', detail: '9801111111' },
        { id: 3, type: 'Visa', detail: 'ending in 1234' },
    ]);

    const addMethod = () => {
        setMethods([...methods, { id: Date.now(), type: 'New Method', detail: 'Add details...' }]);
    };

    return (
        <div className="min-h-screen bg-background pb-20 px-4">
            <h2 className="text-xl font-bold my-4">Payment Methods</h2>
            <div className="space-y-4">
                {methods.map((m) => (
                    <div key={m.id} className="bg-white rounded-lg shadow p-4 border flex items-center justify-between">
                        <div>
                            <div className="font-medium">{m.type}</div>
                            <div className="text-sm text-muted-foreground">{m.detail}</div>
                        </div>
                        <Button size="sm" variant="outline">Edit</Button>
                    </div>
                ))}
                <Button className="mt-4 w-full" onClick={addMethod}>Add New Method</Button>
            </div>
        </div>
    );
};

export default PaymentMethods; 