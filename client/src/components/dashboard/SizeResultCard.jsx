import { useState, useEffect } from 'react';
import { Ruler, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import API from '../../services/api';

const SizeResultCard = ({ profile: initialProfile }) => {
    const [profile, setProfile] = useState(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setProfile(initialProfile);
    }, [initialProfile]);

    if (!profile || !profile.calculatedSizes) return null;

    const { calculatedSizes, confidenceScore, fitPreference, status, measurementMeta } = profile;

    // Helper to get meta for a key
    const getMeta = (key) => measurementMeta?.[key] || { confidence: confidenceScore, source: 'AI' };

    // Initialize edit values when entering edit mode
    const startEditing = () => {
        setEditValues(calculatedSizes);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditValues({});
    };

    const handleInputChange = (key, value) => {
        setEditValues(prev => ({ ...prev, [key]: Number(value) }));
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            const { data } = await API.put('/size/manual', { measurements: editValues });
            setProfile(data);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update measurements", error);
            alert("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    // Measurement items to display (keys match schema)
    const keys = ['chest', 'waist', 'hip', 'shoulder', 'sleeve', 'neck', 'inseam', 'thigh'];

    const getStatusColor = (val) => {
        if (val >= 90) return 'bg-emerald-500';
        if (val >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const isVerified = status === 'VERIFIED';

    return (
        <div className="border rounded-2xl bg-card shadow-lg p-8 space-y-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary/10 blur-3xl"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">
                            IntelliFit Estimates
                        </h3>
                        {/* Status Badge */}
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isVerified
                            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800'
                            }`}>
                            {isVerified ? 'VERIFIED PROFILE' : 'AI GENERATED'}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Stats: {profile.gender}, {profile.height} cm, {profile.weight} kg • {fitPreference} fit
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {!isEditing ? (
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg border border-border">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall Confidence</div>
                                <div className="font-bold text-primary">{confidenceScore}%</div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={startEditing}
                                className="flex-1 md:flex-none transition-all hover:bg-primary/5 hover:text-primary"
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button
                                variant="ghost"
                                onClick={cancelEditing}
                                className="flex-1"
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={saveChanges}
                                className="flex-1"
                                disabled={saving}
                            >
                                {saving ? <span className="animate-pulse">Saving...</span> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {keys.map((key) => {
                    const value = isEditing ? editValues[key] : calculatedSizes[key];
                    const meta = getMeta(key);
                    const isManual = meta.source === 'MANUAL';

                    if (value === undefined && !isEditing) return null;

                    return (
                        <div key={key} className={`relative group p-5 rounded-xl transition-all duration-300 ${isEditing
                            ? 'bg-background border-2 border-primary ring-4 ring-primary/5'
                            : 'bg-muted/30 border border-border hover:border-primary/30 hover:shadow-md'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{key}</div>
                                {!isEditing && (
                                    <div title={isManual ? 'Manually Verified' : `AI Confidence: ${meta.confidence}%`}
                                        className={`w-2 h-2 rounded-full ${isManual ? 'bg-blue-500' : getStatusColor(meta.confidence)}`}>
                                    </div>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="flex items-center justify-center py-2">
                                    <Input
                                        type="number"
                                        className="text-center font-bold text-xl h-10 w-full bg-transparent border-b-2 border-primary/20 focus:border-primary rounded-none px-0"
                                        value={value || ''}
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-start gap-1">
                                    <div className="text-3xl font-bold text-foreground tracking-tight">
                                        {value || '-'} <span className="text-sm font-normal text-muted-foreground ml-0.5">cm</span>
                                    </div>

                                    {/* Confidence Bar */}
                                    <div className="w-full flex items-center gap-2 mt-2">
                                        <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isManual ? 'bg-blue-500' : getStatusColor(meta.confidence)}`}
                                                style={{ width: isManual ? '100%' : `${meta.confidence}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-muted-foreground w-8 text-right font-medium">
                                            {isManual ? '100%' : `${meta.confidence}%`}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="text-xs flex items-center justify-between text-muted-foreground pt-4 border-t border-border">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> High Confidence</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Medium</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> User Verified</span>
                </div>
                <div>
                    {isEditing && (
                        <span className="text-amber-600 font-medium animate-pulse">
                            Editing Mode Active
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SizeResultCard;


