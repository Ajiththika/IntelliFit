import { motion } from 'framer-motion';
import { Shirt, Scissors } from 'lucide-react'; // Using standard icons for now

const categories = {
    men: [
        { id: 'shirt', label: 'Custom Shirt', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'suit', label: 'Tailored Suit', image: 'https://images.unsplash.com/photo-1593030761757-71bd90dbe78b?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'pant', label: 'Trousers', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'traditional', label: 'Traditional', image: 'https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&q=80&w=300&h=400' }
    ],
    women: [
        { id: 'dress', label: 'Custom Dress', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'blouse', label: 'Blouse', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'skirt', label: 'Skirt', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=300&h=400' },
        { id: 'traditional', label: 'Traditional', image: 'https://plus.unsplash.com/premium_photo-1664202526559-e21e9c0fb46a?auto=format&fit=crop&q=80&w=300&h=400' }
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
                        onClick={() => onSelect(item)}
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
