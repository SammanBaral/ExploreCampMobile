import apiService from '@/services/api';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from './ui/use-toast';

interface NotificationSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    onNotificationsUpdated: (user: any) => void;
}

const defaultSettings = {
    push: {
        bookingConfirmations: true,
        bookingReminders: true,
        specialOffers: false,
    },
    email: {
        bookingConfirmations: true,
        bookingReminders: true,
        newsletter: true,
        specialOffers: true,
    },
};

const NotificationSettingsModal = ({ open, onOpenChange, user, onNotificationsUpdated }: NotificationSettingsModalProps) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState<any>(user?.notificationSettings || defaultSettings);
    const [loading, setLoading] = useState(false);

    const handleToggle = (type: string, key: string) => {
        setSettings((prev: any) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: !prev[type][key],
            },
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await apiService.updateNotificationSettings(user.id, { notificationSettings: settings });
            onNotificationsUpdated(res.data?.user || user);
            onOpenChange(false);
            toast({
                title: "Success",
                description: "Notification settings updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update notification settings",
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
                    <DialogTitle>Notification Settings</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="font-semibold mb-2">Push Notifications</div>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.push.bookingConfirmations} onChange={() => handleToggle('push', 'bookingConfirmations')} /> Booking Confirmations
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.push.bookingReminders} onChange={() => handleToggle('push', 'bookingReminders')} /> Booking Reminders
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.push.specialOffers} onChange={() => handleToggle('push', 'specialOffers')} /> Special Offers
                        </label>
                    </div>
                    <div>
                        <div className="font-semibold mb-2 mt-4">Email Notifications</div>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.email.bookingConfirmations} onChange={() => handleToggle('email', 'bookingConfirmations')} /> Booking Confirmations
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.email.bookingReminders} onChange={() => handleToggle('email', 'bookingReminders')} /> Booking Reminders
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.email.newsletter} onChange={() => handleToggle('email', 'newsletter')} /> Newsletter
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.email.specialOffers} onChange={() => handleToggle('email', 'specialOffers')} /> Special Offers
                        </label>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NotificationSettingsModal; 