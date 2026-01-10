import { useState, useEffect } from 'react';
import API from '../../services/api';
import TailorCard from '../../components/dashboard/TailorCard';
import { Loader2, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';

const MarketplacePage = () => {
    const [tailors, setTailors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTailors = async () => {
            try {
                const { data } = await API.get('/tailors');
                setTailors(data);
            } catch (err) {
                console.error("Failed to fetch tailors", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTailors();
    }, []);

    const filteredTailors = tailors.filter(tailor =>
        tailor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tailor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tailor.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Find a Tailor</h1>
                    <p className="text-muted-foreground">Connect with expert craftsmen near you.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name, location, or style..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {filteredTailors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredTailors.map((tailor) => (
                                <TailorCard key={tailor._id} tailor={tailor} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border border-dashed rounded-xl bg-secondary/20">
                            <h3 className="text-lg font-semibold">No tailors found</h3>
                            <p className="text-muted-foreground">Try adjusting your search terms.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MarketplacePage;
