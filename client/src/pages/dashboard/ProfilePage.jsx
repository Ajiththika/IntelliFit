import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import API from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Save, User, X } from 'lucide-react';
import AvatarUploader from '../../components/dashboard/AvatarUploader';
import TailorProfileEditor from '../../components/dashboard/TailorProfileEditor';

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: '',
    });
    const [allowedRoles, setAllowedRoles] = useState(['user']);
    const [roleRequest, setRoleRequest] = useState(null);
    const [roleLoading, setRoleLoading] = useState(false);

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
                setAllowedRoles(data.allowedRoles || ['user']);
                setRoleRequest(data.roleRequest || null);
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
            const { data } = await API.put('/users/profile', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                avatar: formData.avatar
            });

            setSuccess('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchRole = async (newRole) => {
        if (newRole === user?.role) return;
        setRoleLoading(true);
        try {
            const { data } = await API.post('/users/switch-role', { role: newRole });
            alert(`Switched to ${newRole}`);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to switch role');
        } finally {
            setRoleLoading(false);
        }
    };

    const handleRequestRole = async (role) => {
        setRoleLoading(true);
        try {
            const { data } = await API.post('/users/request-role', { role });
            setRoleRequest(data.roleRequest);
            alert('Role request submitted. Please wait for admin approval.');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to request role');
        } finally {
            setRoleLoading(false);
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
                        <AvatarUploader
                            currentAvatar={formData.avatar}
                            onUploadComplete={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                        />
                        <div className="mt-4 text-center">
                            <h3 className="text-xl font-bold">{formData.name}</h3>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold bg-secondary px-2 py-0.5 rounded mt-2 inline-block">{user?.role}</p>
                        </div>
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

                        {/* Avatar Input Removed - handled by AvatarUploader */}

                        <div className="pt-4">
                            {success && <p className="text-green-600 mb-4 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> {success}</p>}
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Account Details
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Role Management Section */}
                <div className="md:col-span-2 p-6 border rounded-xl bg-card shadow-sm space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2">Role Management</h3>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Switch Role */}
                        <div className="space-y-4">
                            <Label>Switch Active Role</Label>
                            <div className="flex flex-wrap gap-2">
                                {allowedRoles.map((r) => (
                                    <Button
                                        key={r}
                                        variant={user?.role === r ? "default" : "outline"}
                                        onClick={() => handleSwitchRole(r)}
                                        disabled={roleLoading || user?.role === r}
                                        className="capitalize"
                                    >
                                        {r} {user?.role === r && "(Active)"}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Switch your dashboard view to access features specific to that role.
                            </p>
                        </div>

                        {/* Request Role */}
                        <div className="space-y-4">
                            <Label>Request Permissions</Label>
                            <div className="flex flex-col gap-2">
                                {!allowedRoles.includes('admin') && (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Admin Access</span>
                                            {roleRequest === 'admin' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Pending</span>}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleRequestRole('admin')}
                                            disabled={roleLoading || roleRequest === 'admin'}
                                        >
                                            {roleRequest === 'admin' ? 'Requested' : 'Request Access'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tailor Profile Section - Delegated to separate component */}
                {user?.role === 'tailor' && (
                    <div className="md:col-span-2 mt-6">
                        <TailorProfileEditor />
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProfilePage;
