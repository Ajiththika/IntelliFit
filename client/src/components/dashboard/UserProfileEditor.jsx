import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/authContext';
import API from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Save } from 'lucide-react';
import AvatarUploader from './AvatarUploader';
import { useDebounce } from '../../hooks/useDebounce';

const UserProfileEditor = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: '',
    });

    const isFirstRun = useRef(true);

    // 1. Fetch Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get('/users/profile');
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    avatar: data.avatar || '',
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
                setTimeout(() => { isFirstRun.current = false; }, 500);
            }
        };
        fetchProfile();
    }, []);

    // 2. Debounce Data
    const debouncedFormData = useDebounce(formData, 1000);

    // 3. Auto-Save Effect
    useEffect(() => {
        if (isFirstRun.current) return;
        if (loading) return;

        const saveProfile = async () => {
            setSaving(true);
            try {
                await API.put('/users/profile', {
                    name: debouncedFormData.name,
                    email: debouncedFormData.email,
                    phone: debouncedFormData.phone,
                    avatar: debouncedFormData.avatar
                });
                setLastSaved(new Date());
            } catch (error) {
                console.error("Auto-save failed", error);
            } finally {
                setSaving(false);
            }
        };

        saveProfile();
    }, [debouncedFormData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <div className="flex flex-col items-center p-6 border rounded-xl bg-card shadow-sm">
                    <AvatarUploader
                        currentAvatar={formData.avatar}
                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                    />
                    <div className="mt-4 text-center">
                        <h3 className="text-xl font-bold">{formData.name}</h3>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold bg-secondary px-2 py-0.5 rounded inline-block">{user?.role}</span>
                            {saving ? (
                                <span className="text-xs text-muted-foreground flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Saving...</span>
                            ) : lastSaved ? (
                                <span className="text-xs text-green-600">Saved</span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border rounded-xl bg-card shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Personal Details</h3>
                    {lastSaved && <span className="text-xs text-muted-foreground">Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled className="opacity-70 bg-secondary/20" />
                        <p className="text-[10px] text-muted-foreground">Email cannot be changed directly.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2">
                        <Save className="h-3 w-3" />
                        Changes save automatically as you type.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileEditor;
