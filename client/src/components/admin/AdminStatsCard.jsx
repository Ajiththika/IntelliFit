import { cn } from '@/lib/utils';

const AdminStatsCard = ({ title, value, icon: Icon, description, trend }) => {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="text-2xl font-bold">
                    {value}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminStatsCard; 
