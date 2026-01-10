import { Ruler, CheckCircle } from 'lucide-react';

const SizeResultCard = ({ profile }) => {
    if (!profile || !profile.calculatedSizes) return null;

    const { calculatedSizes, confidenceScore, fitPreference } = profile;

    // Measurement items to display
    const items = [
        { label: 'Chest', value: calculatedSizes.chest },
        { label: 'Waist', value: calculatedSizes.waist },
        { label: 'Hips', value: calculatedSizes.hip },
        { label: 'Shoulder', value: calculatedSizes.shoulder },
        { label: 'Sleeve', value: calculatedSizes.sleeve },
        { label: 'Neck', value: calculatedSizes.neck },
        { label: 'Inseam', value: calculatedSizes.inseam },
    ];

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
                <div className="text-right">
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="h-3 w-3" />
                        {confidenceScore}% Match
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                        Fit: {fitPreference}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item) => (
                    <div key={item.label} className="bg-secondary/50 p-4 rounded-lg text-center border border-transparent hover:border-border transition-all">
                        <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
                        <div className="text-2xl font-bold text-primary">
                            {item.value} <span className="text-xs font-normal text-muted-foreground">cm</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4 border-t">
                * Measurements are calculated estimates. Visit a verified tailor for final fittings.
            </div>
        </div>
    );
};

export default SizeResultCard;
