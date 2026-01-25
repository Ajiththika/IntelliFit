import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import API from '../../services/api';

import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import UserProfileEditor from '../../components/dashboard/UserProfileEditor';
import TailorProfileEditor from '../../components/dashboard/TailorProfileEditor';

const ProfilePage = () => {
    const { user } = useAuth();
    const [allowedRoles, setAllowedRoles] = useState(['user']);
    const [roleRequest, setRoleRequest] = useState(null);
    const [roleLoading, setRoleLoading] = useState(false);

    useEffect(() => {
        const fetchRoleData = async () => {
            try {
                const { data } = await API.get('/users/profile');
                setAllowedRoles(data.allowedRoles || ['user']);
                setRoleRequest(data.roleRequest || null);
            } catch (error) {
                console.error('Failed to fetch role data', error);
            }
        };
        fetchRoleData();
    }, []);

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

            {/* Universal User Profile (Auto-Saved) */}
            <UserProfileEditor />

            <div className="grid gap-6 md:grid-cols-2">

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
