import { useState, useEffect } from 'react';
import API from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Loader2, Ruler } from 'lucide-react';
import SizeResultCard from '../../components/dashboard/SizeResultCard';

const MeasurementsPage = () => {
    const [formData, setFormData] = useState({
        gender: 'male',
        height: '',
        weight: '',
        age: '',
        wristSize: '',
        fitPreference: 'regular'
    });

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    // Fetch existing profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get('/size/profile');
                if (data) {
                    setProfile(data);
                    // Pre-fill form if data exists
                    setFormData({
                        gender: data.gender,
                        height: data.height,
                        weight: data.weight,
                        age: data.age,
                        wristSize: data.wristSize || '',
                        fitPreference: data.fitPreference
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGenerating(true);
        setError('');

        try {
            const { data } = await API.post('/size/generate', formData);
            setProfile(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate measurements');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">My Measurements</h1>
                <p className="text-muted-foreground">
                    Update your body statistics to generate accurate garment sizes.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="md:col-span-5 space-y-6">
                    <div className="border rounded-xl p-6 bg-card shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="number"
                                        placeholder="25"
                                        required
                                        value={formData.age}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="height">Height (cm)</Label>
                                    <Input
                                        id="height"
                                        name="height"
                                        type="number"
                                        placeholder="175"
                                        required
                                        value={formData.height}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        name="weight"
                                        type="number"
                                        placeholder="70"
                                        required
                                        value={formData.weight}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="wristSize">Wrist (cm)</Label>
                                    <Input
                                        id="wristSize"
                                        name="wristSize"
                                        type="number"
                                        placeholder="17 (Optional)"
                                        value={formData.wristSize}
                                        onChange={handleChange}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Optional: Helps frame size</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fitPreference">Fit Preference</Label>
                                    <Select
                                        name="fitPreference"
                                        value={formData.fitPreference}
                                        onChange={handleChange}
                                    >
                                        <option value="slim">Slim Fit</option>
                                        <option value="regular">Regular Fit</option>
                                        <option value="loose">Loose Fit</option>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={generating}>
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Ruler className="mr-2 h-4 w-4" />
                                        Generate Sizes
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                <div className="md:col-span-7">
                    {profile ? (
                        <SizeResultCard profile={profile} />
                    ) : (
                        <div className="h-full border border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center bg-secondary/20 min-h-[300px]">
                            <div className="bg-background p-4 rounded-full mb-4">
                                <Ruler className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg">No measurements yet</h3>
                            <p className="text-muted-foreground max-w-xs mt-2 text-sm">
                                Fill out the form to let our AI calculate your perfect measurements.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeasurementsPage;
