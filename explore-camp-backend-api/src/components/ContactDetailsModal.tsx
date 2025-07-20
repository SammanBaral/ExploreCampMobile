import apiService from '@/services/api';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from './ui/use-toast';

interface ContactDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    onContactUpdated: (user: any) => void;
}

const ContactDetailsModal = ({ open, onOpenChange, user, onContactUpdated }: ContactDetailsModalProps) => {
    const { toast } = useToast();
    const [form, setForm] = useState({
        email: user?.email || '',
        phone: user?.phone || '',
        emergencyContactName: user?.emergencyContactName || '',
        emergencyContactPhone: user?.emergencyContactPhone || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (form.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone)) {
            newErrors.phone = 'Phone number is invalid';
        }
        if (form.emergencyContactPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.emergencyContactPhone)) {
            newErrors.emergencyContactPhone = 'Emergency contact phone is invalid';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await apiService.updateContactDetails(user.id, {
                phone: form.phone,
                emergencyContactName: form.emergencyContactName,
                emergencyContactPhone: form.emergencyContactPhone,
            });
            onContactUpdated(res.data?.user || user);
            onOpenChange(false);
            toast({
                title: "Success",
                description: "Contact details updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update contact details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Contact Details</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div>
                        <input
                            name="email"
                            value={form.email}
                            disabled
                            className="input"
                        />
                    </div>
                    <div>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className={`input ${errors.phone ? 'border-red-500' : ''}`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <input
                            name="emergencyContactName"
                            value={form.emergencyContactName}
                            onChange={handleChange}
                            placeholder="Emergency Contact"
                            className="input"
                        />
                    </div>
                    <div>
                        <input
                            name="emergencyContactPhone"
                            value={form.emergencyContactPhone}
                            onChange={handleChange}
                            placeholder="Emergency Contact Phone"
                            className={`input ${errors.emergencyContactPhone ? 'border-red-500' : ''}`}
                        />
                        {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ContactDetailsModal; 