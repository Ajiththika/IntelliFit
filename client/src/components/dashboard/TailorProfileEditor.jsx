import { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import PortfolioUploader from './PortfolioUploader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Plus, Trash2, Save, X } from 'lucide-react';

const TailorProfileEditor = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Initial State
    const [formData, setFormData] = useState({
        businessName: '',
        bio: '',
        location: '',
        experienceYears: 0,
        specializations: [], // We'll handle this as comma-separated string in UI for simplicity or array
        pricing: [], // Array of { serviceName, startingPrice, description }
        portfolioImages: [],
        whatsappNumber: ''
    });

    // Specializations as string for easy editing
    const [specializationsInput, setSpecializationsInput] = useState('');

    const isFirstRun = useRef(true);

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get('/tailors/profile');
                if (data) {
                    setFormData({
                        businessName: data.businessName || '',
                        bio: data.bio || '',
                        location: data.location || '',
                        experienceYears: data.experienceYears || 0,
                        whatsappNumber: data.whatsappNumber || '',
                        specializations: data.specializations || [],
                        pricing: data.pricing || [],
                        portfolioImages: data.portfolioImages || []
                    });
                    setSpecializationsInput(data.specializations ? data.specializations.join(', ') : '');
                }
            } catch (error) {
                console.error("Error fetching profile", error);
                // If 404, it just means no profile yet, which is fine
            } finally {
                setLoading(false);
                // Prevent auto-save from firing immediately after fetch
                setTimeout(() => { isFirstRun.current = false; }, 500);
            }
        };

        fetchProfile();
    }, []);

    // Debounce the form data
    const debouncedFormData = useDebounce(formData, 1000);

    // Auto-Save Effect
    useEffect(() => {
        if (isFirstRun.current) return;
        if (loading) return;

        const saveProfile = async () => {
            setSaving(true);
            try {
                await API.post('/tailors', debouncedFormData);
                setLastSaved(new Date());
            } catch (error) {
                console.error("Auto-save failed", error);
            } finally {
                setSaving(false);
            }
        };

        saveProfile();
    }, [debouncedFormData]);

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecializationsChange = (e) => {
        const value = e.target.value;
        setSpecializationsInput(value);
        // Split by comma and trim to array
        const specs = value.split(',').map(s => s.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, specializations: specs }));
    };

    // Pricing Handlers
    const handleAddService = () => {
        setFormData(prev => ({
            ...prev,
            pricing: [...prev.pricing, { serviceName: '', startingPrice: 0, description: '' }]
        }));
    };

    const handleRemoveService = (index) => {
        setFormData(prev => ({
            ...prev,
            pricing: prev.pricing.filter((_, i) => i !== index)
        }));
    };

    const handlePricingChange = (index, field, value) => {
        setFormData(prev => {
            const newPricing = [...prev.pricing];
            newPricing[index] = { ...newPricing[index], [field]: value };
            return { ...prev, pricing: newPricing };
        });
    };

    // Portfolio Handlers
    const handleUploadComplete = (newUrls) => {
        setFormData(prev => ({
            ...prev,
            portfolioImages: [...prev.portfolioImages, ...newUrls]
        }));
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            portfolioImages: prev.portfolioImages.filter((_, i) => i !== indexToRemove)
        }));
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            {/* Header / Status */}
            <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
                <h2 className="text-2xl font-bold tracking-tight">Tailor Profile</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {saving ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <Save className="h-3 w-3" />
                            <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                    ) : (
                        <span>Changes save automatically</span>
                    )}
                </div>
            </div>

            {/* Basic Info Section */}
            <div className="space-y-4 border p-6 rounded-lg bg-card">
                <h3 className="text-lg font-semibold">Business Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                            id="businessName"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="e.g. Elite Tailors"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location (City, Country)</Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. New York, USA"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="experienceYears">Years of Experience</Label>
                        <Input
                            id="experienceYears"
                            name="experienceYears"
                            type="number"
                            value={formData.experienceYears}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                        <Input
                            id="whatsappNumber"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            placeholder="+1234567890"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio / About</Label>
                    <textarea
                        id="bio"
                        name="bio"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell customers about your expertise..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="specializations">Specializations (Comma separated)</Label>
                    <Input
                        id="specializations"
                        value={specializationsInput}
                        onChange={handleSpecializationsChange}
                        placeholder="Suits, Dresses, Alterations"
                    />
                </div>
            </div>

            {/* Pricing Section - Dynamic */}
            <div className="space-y-4 border p-6 rounded-lg bg-card">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Services & Pricing</h3>
                    <Button onClick={handleAddService} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" /> Add Service
                    </Button>
                </div>

                <div className="space-y-4">
                    {formData.pricing.map((item, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 items-start border p-4 rounded-md bg-muted/20">
                            <div className="flex-1 space-y-2 w-full">
                                <Label>Service Name</Label>
                                <Input
                                    value={item.serviceName}
                                    onChange={(e) => handlePricingChange(index, 'serviceName', e.target.value)}
                                    placeholder="e.g. Custom Suit"
                                />
                            </div>
                            <div className="w-full md:w-32 space-y-2">
                                <Label>Start Price</Label>
                                <Input
                                    type="number"
                                    value={item.startingPrice}
                                    onChange={(e) => handlePricingChange(index, 'startingPrice', Number(e.target.value))}
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                                <Label>Description (Optional)</Label>
                                <Input
                                    value={item.description || ''}
                                    onChange={(e) => handlePricingChange(index, 'description', e.target.value)}
                                    placeholder="Includes fabric selection..."
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mt-8 text-destructive hover:text-destructive/90"
                                onClick={() => handleRemoveService(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {formData.pricing.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-md border-dashed border-2">
                            Add services to handle pricing expectations (e.g., Hemming, Custom Suits).
                        </div>
                    )}
                </div>
            </div>

            {/* Portfolio Section */}
            <div className="space-y-4 border p-6 rounded-lg bg-card">
                <h3 className="text-lg font-semibold">Portfolio</h3>
                <p className="text-sm text-muted-foreground">Upload images of your best work.</p>

                <PortfolioUploader onUploadComplete={handleUploadComplete} />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {formData.portfolioImages.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                            <img src={url} alt={`Portfolio ${index + 1}`} className="object-cover w-full h-full" />
                            <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TailorProfileEditor;
