import apiService from '@/services/api';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from './ui/use-toast';

interface EditProfileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    onProfileUpdated: (user: any) => void;
}

const EditProfileModal = ({ open, onOpenChange, user, onProfileUpdated }: EditProfileModalProps) => {
    const { toast } = useToast();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Always update form state when user prop changes
    useEffect(() => {
        setForm({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            bio: user?.bio || '',
        });
        setIsEditing(false); // Reset to read-only when user changes or modal opens
    }, [user, open]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
        if (form.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone)) {
            newErrors.phone = 'Phone number is invalid';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const profileRes = await apiService.updateUserProfile(user.id, form);
            let updatedUser = profileRes.data?.user || user;
            if (image) {
                const imgRes = await apiService.uploadProfileImage(user.id, image);
                if (imgRes.data?.user) {
                    updatedUser = {
                        ...imgRes.data.user,
                        profileImage: imgRes.data.user.profileImage?.replace(/^uploads\//, '')
                    };
                }
            }
            // Always fetch the latest user data from backend after update
            const latestUserRes = await apiService.getCurrentUser();
            if (latestUserRes.data) {
                updatedUser = {
                    ...latestUserRes.data,
                    profileImage: latestUserRes.data.profileImage?.replace(/^uploads\//, '')
                };
            }
            onProfileUpdated(updatedUser);
            onOpenChange(false);
            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile",
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
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <label htmlFor="profile-image" className="cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {image ? (
                                    <img src={URL.createObjectURL(image)} alt="Profile" className="w-full h-full object-cover" />
                                ) : user?.profileImage ? (
                                    <img src={`http://10.0.2.2:5000/uploads/${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl">👤</span>
                                )}
                            </div>
                            <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                        <span className="text-xs text-muted-foreground">Change Photo</span>
                    </div>
                    <div>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className={`input ${errors.name ? 'border-red-500' : ''}`}
                            readOnly={!isEditing}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className={`input ${errors.email ? 'border-red-500' : ''}`}
                            disabled
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className={`input ${errors.phone ? 'border-red-500' : ''}`}
                            readOnly={!isEditing}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="Location"
                            className="input"
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Bio"
                            className="input"
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        {!isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Close</Button>
                                <Button onClick={() => setIsEditing(true)} disabled={loading}>Edit</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => { setIsEditing(false); setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', location: user?.location || '', bio: user?.bio || '' }); }} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal; 