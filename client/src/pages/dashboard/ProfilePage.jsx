import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import API from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Save, User } from 'lucide-react';

const ProfilePage = () => {
    const { user, login } = useAuth(); // Login used to update context
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: '',
        whatsappNumber: '', // For tailors
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get('/users/profile');
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    avatar: data.avatar || '',
                    whatsappNumber: data.whatsappNumber || '',
                });
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        try {
            const { data } = await API.put('/users/profile', formData);
            // Update auth context with new user data
            // We can't directly update context without a setter, but usually re-login or refresh works.
            //Ideally AuthContext should have an 'updateUser' method. 
            // For MVP, we presume the backend update is enough, context might be stale until refresh.
            // But we can manually update localStorage if needed or just show success.
            setSuccess('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="flex flex-col items-center p-6 border rounded-xl bg-card shadow-sm">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary mb-4 border-4 border-background shadow-lg">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold">{formData.name}</h3>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold bg-secondary px-2 py-0.5 rounded mt-2">{user?.role}</p>
                    </div>
                </div>

                <div className="p-6 border rounded-xl bg-card shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar URL</Label>
                            <Input id="avatar" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://example.com/me.jpg" />
                        </div>

                        {/* Tailor Specific Fields */}
                        {user?.role === 'tailor' && (
                            <div className="space-y-2 p-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                                <Label htmlFor="whatsappNumber" className="text-green-700 dark:text-green-400">WhatsApp Number</Label>
                                <Input
                                    id="whatsappNumber"
                                    name="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    className="border-green-200 focus-visible:ring-green-500"
                                />
                                <p className="text-xs text-muted-foreground">This will be shared with customers to contact you directly.</p>
                            </div>
                        )}

                        <div className="pt-4">
                            {success && <p className="text-green-600 mb-4 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> {success}</p>}
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
