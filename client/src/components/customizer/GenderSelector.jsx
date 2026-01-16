import { motion } from 'framer-motion';
import { User, UserCheck } from 'lucide-react';

const GenderSelector = ({ onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <h2 className="text-2xl font-semibold mb-6">Who are you designing for?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                <SelectionCard
                    label="Men"
                    icon={<User className="w-16 h-16" />}
                    onClick={() => onSelect('men')}
                    description="Suits, Shirts, Trousers & Traditional Wear"
                />
                <SelectionCard
                    label="Women"
                    icon={<UserCheck className="w-16 h-16" />}
                    onClick={() => onSelect('women')}
                    description="Dresses, Blouses, Skirts & Traditional Wear"
                />
            </div>
        </div>
    );
};

const SelectionCard = ({ label, icon, onClick, description }) => (
    <motion.div
        whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary))' }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="cursor-pointer bg-card border-2 border-border rounded-xl p-10 flex flex-col items-center text-center gap-6 shadow-sm hover:shadow-xl transition-all"
    >
        <div className="p-6 bg-primary/5 rounded-full text-primary">
            {icon}
        </div>
        <div>
            <h3 className="text-2xl font-bold mb-2">{label}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </motion.div>
);

export default GenderSelector;
