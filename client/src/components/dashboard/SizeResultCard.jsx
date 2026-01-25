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

    const { calculatedSizes, confidenceScore, fitPreference } = profile;

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

    return (
        <div className="border rounded-xl bg-card shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Ruler className="text-primary h-5 w-5" />
                        Your IntelliFit Profile
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Based on {profile.gender}, {profile.height}cm, {profile.weight}kg
                    </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={startEditing}
                                className="h-8"
                            >
                                <Edit2 className="h-3 w-3 mr-2" />
                                Edit Manually
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelEditing}
                                    className="h-8"
                                    disabled={saving}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={saveChanges}
                                    className="h-8"
                                    disabled={saving}
                                >
                                    <Save className="h-3 w-3 mr-2" />
                                    {saving ? 'Saving...' : 'Save'}
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="h-3 w-3" />
                        {confidenceScore}% Match
                    </div>

                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {keys.map((key) => {
                    const value = isEditing ? editValues[key] : calculatedSizes[key];
                    // Handle missing thigh in old records gracefully
                    if (value === undefined && !isEditing) return null;

                    return (
                        <div key={key} className={`p-4 rounded-lg text-center border transition-all ${isEditing ? 'bg-background border-primary/50' : 'bg-secondary/50 border-transparent hover:border-border'}`}>
                            <div className="text-sm text-muted-foreground mb-1 capitalize">{key}</div>
                            {isEditing ? (
                                <div className="flex justify-center">
                                    <Input
                                        type="number"
                                        className="h-8 w-20 text-center"
                                        value={value || ''}
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="text-2xl font-bold text-primary">
                                    {value || '-'} <span className="text-xs font-normal text-muted-foreground">cm</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4 border-t">
                {isEditing ? (
                    <span className="text-amber-600 font-medium">
                        Info: Manual edits will be overwritten if you re-generate sizes using the AI calculator.
                    </span>
                ) : (
                    <span>* Measurements are calculated estimates. Visit a verified tailor for final fittings.</span>
                )}
            </div>
        </div>
    );
};

export default SizeResultCard;
