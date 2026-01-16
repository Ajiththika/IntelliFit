import { motion } from 'framer-motion';
import { Shirt, Scissors } from 'lucide-react'; // Using standard icons for now

const categories = {
    men: [
        { id: 'shirt', label: 'Custom Shirt', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'suit', label: 'Tailored Suit', image: 'https://images.unsplash.com/photo-1594938298603-c8148c47e356?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'pant', label: 'Trousers', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'traditional', label: 'Traditional', image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=300&h=400' }
    ],
    women: [
        { id: 'dress', label: 'Custom Dress', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'blouse', label: 'Blouse', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'skirt', label: 'Skirt', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'traditional', label: 'Traditional', image: 'https://images.unsplash.com/photo-1583391733958-3d526bd476ad?auto=format&fit=crop&q=80&w=300&h=400' }
    ]
};

const CategorySelector = ({ gender, onSelect }) => {
    const items = categories[gender] || [];

    return (
        <div className="flex flex-col items-center min-h-[60vh]">
            <h2 className="text-2xl font-semibold mb-8">What would you like to design?</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
                {items.map((item) => (
                    <CategoryCard
                        key={item.id}
                        item={item}
                        onClick={() => onSelect(item.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const CategoryCard = ({ item, onClick }) => (
    <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="group cursor-pointer rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-all"
    >
        <div className="aspect-[3/4] overflow-hidden relative">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
            <img
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <div className="p-4 text-center">
            <h3 className="font-semibold text-lg">{item.label}</h3>
        </div>
    </motion.div>
);

export default CategorySelector;
