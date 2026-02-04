import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronDown, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import API from '../../services/api';

// --- SHARED DATA ---
const colors = [
    { id: 'white', name: 'White', hex: '#ffffff' },
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'navy', name: 'Navy', hex: '#000080' },
    { id: 'burgundy', name: 'Burgundy', hex: '#800020' },
    { id: 'emerald', name: 'Emerald', hex: '#50C878' },
    { id: 'gold', name: 'Gold', hex: '#FFD700' },
    { id: 'royal_blue', name: 'Royal Blue', hex: '#4169E1' },
    { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
];

const fabrics = [
    { id: 'egyptian_cotton', name: 'Egyptian Cotton', price: 0, desc: 'Breathable & soft' },
    { id: 'linen', name: 'Premium Linen', price: 25, desc: 'Lightweight & airy' },
    { id: 'silk', name: 'Pure Silk', price: 60, desc: 'Luxurious & smooth' },
    { id: 'velvet', name: 'Velvet', price: 45, desc: 'Rich texture' },
    { id: 'wool_blend', name: 'Wool Blend', price: 35, desc: 'Warm & durable' },
];

const fits = [
    { id: 'slim', name: 'Slim Fit', desc: 'Closer to body' },
    { id: 'regular', name: 'Regular Fit', desc: 'Classic comfort' },
    { id: 'relaxed', name: 'Relaxed Fit', desc: 'Loose & breezy' },
];

// --- CATEGORY SPECIFIC OPTIONS ---
const categoryOptions = {
    // MEN
    shirt: {
        basePrice: 89,
        sections: [
            { id: 'fit', label: 'Fit', type: 'select', options: fits },
            { id: 'fabric', label: 'Fabric', type: 'fabric', options: fabrics },
            { id: 'color', label: 'Color', type: 'color', options: colors },
            {
                id: 'collar', label: 'Collar', type: 'select', options: [
                    { id: 'spread', name: 'Spread', desc: 'Modern choice' },
                    { id: 'classic', name: 'Classic', desc: 'Timeless style' },
                    { id: 'button_down', name: 'Button Down', desc: 'Casual look' },
                ]
            },
            {
                id: 'cuff', label: 'Cuff', type: 'select', options: [
                    { id: 'single_button', name: 'Single Button', desc: 'Standard' },
                    { id: 'double_button', name: 'Double Button', desc: 'Adjustable' },
                    { id: 'french', name: 'French Cuff', desc: 'Formal' },
                ]
            },
            {
                id: 'pocket', label: 'Pocket', type: 'select', options: [
                    { id: 'none', name: 'No Pocket', desc: 'Clean look' },
                    { id: 'one', name: 'One Pocket', desc: 'Classic utility' },
                ]
            }
        ]
    },
    suit: {
        basePrice: 399,
        sections: [
            { id: 'fit', label: 'Fit', type: 'select', options: fits },
            {
                id: 'fabric', label: 'Fabric', type: 'fabric', options: [
                    { id: 'wool_110', name: 'Super 110s Wool', price: 0, desc: 'All-season' },
                    { id: 'wool_130', name: 'Super 130s Wool', price: 100, desc: 'Finer texture' },
                    { id: 'linen_blend', name: 'Linen Blend', price: 50, desc: 'Summer suits' },
                ]
            },
            { id: 'color', label: 'Color', type: 'color', options: colors },
            {
                id: 'lapel', label: 'Lapel', type: 'select', options: [
                    { id: 'notch', name: 'Notch Lapel', desc: 'Standard business' },
                    { id: 'peak', name: 'Peak Lapel', desc: 'More formal' },
                    { id: 'shawl', name: 'Shawl Collar', desc: 'Tuxedo style' },
                ]
            },
            {
                id: 'vents', label: 'Vents', type: 'select', options: [
                    { id: 'double', name: 'Double Vent', desc: 'Modern British' },
                    { id: 'single', name: 'Single Vent', desc: 'American classic' },
                    { id: 'no_vent', name: 'No Vent', desc: 'Italian slim' },
                ]
            }
        ]
    },
    // WOMEN
    dress: {
        basePrice: 129,
        sections: [
            { id: 'fit', label: 'Fit', type: 'select', options: fits },
            { id: 'fabric', label: 'Fabric', type: 'fabric', options: fabrics },
            { id: 'color', label: 'Color', type: 'color', options: colors },
            {
                id: 'length', label: 'Length', type: 'select', options: [
                    { id: 'mini', name: 'Mini', desc: 'Above knee' },
                    { id: 'midi', name: 'Midi', desc: 'Below knee' },
                    { id: 'maxi', name: 'Maxi', desc: 'Floor length' },
                ]
            },
            {
                id: 'neckline', label: 'Neckline', type: 'select', options: [
                    { id: 'v_neck', name: 'V-Neck', desc: 'Elongating' },
                    { id: 'round', name: 'Round Neck', desc: 'Classic' },
                    { id: 'boat', name: 'Boat Neck', desc: 'Elegant' },
                    { id: 'square', name: 'Square Neck', desc: 'Vintage style' },
                ]
            },
            {
                id: 'sleeve', label: 'Sleeve', type: 'select', options: [
                    { id: 'sleeveless', name: 'Sleeveless', desc: 'Summer ready' },
                    { id: 'cap', name: 'Cap Sleeve', desc: 'Cover shoulders' },
                    { id: 'short', name: 'Short Sleeve', desc: 'Classic T' },
                    { id: 'three_quarter', name: '3/4 Sleeve', desc: 'Versatile' },
                    { id: 'long', name: 'Long Sleeve', desc: 'Full coverage' },
                ]
            }
        ]
    },
    blouse: {
        basePrice: 79,
        sections: [
            { id: 'fit', label: 'Fit', type: 'select', options: fits },
            { id: 'fabric', label: 'Fabric', type: 'fabric', options: fabrics },
            { id: 'color', label: 'Color', type: 'color', options: colors },
            {
                id: 'neckline', label: 'Neckline', type: 'select', options: [
                    { id: 'collar', name: 'Collared', desc: 'Workwear' },
                    { id: 'v_neck', name: 'V-Neck', desc: 'Casual' },
                    { id: 'bow', name: 'Pussy Bow', desc: 'Elegant' },
                ]
            },
            {
                id: 'sleeve', label: 'Sleeve', type: 'select', options: [
                    { id: 'sleeveless', name: 'Sleeveless', desc: 'Cool' },
                    { id: 'puff', name: 'Puff Sleeve', desc: 'Trendy' },
                    { id: 'long_cuffed', name: 'Long Cuffed', desc: 'Formal' },
                ]
            }
        ]
    },
    skirt: {
        basePrice: 69,
        sections: [
            { id: 'fabric', label: 'Fabric', type: 'fabric', options: fabrics },
            { id: 'color', label: 'Color', type: 'color', options: colors },
            {
                id: 'style', label: 'Style', type: 'select', options: [
                    { id: 'pencil', name: 'Pencil', desc: 'Fitted' },
                    { id: 'a_line', name: 'A-Line', desc: 'Flattering' },
                    { id: 'pleated', name: 'Pleated', desc: 'Classic flow' },
                    { id: 'wrap', name: 'Wrap', desc: 'Adjustable' },
                ]
            },
            {
                id: 'length', label: 'Length', type: 'select', options: [
                    { id: 'mini', name: 'Mini', desc: 'Mid-thigh' },
                    { id: 'knee', name: 'Knee Length', desc: 'Professional' },
                    { id: 'mid_calf', name: 'Mid-Calf', desc: 'Modern' },
                    { id: 'maxi', name: 'Maxi', desc: 'Ankle length' },
                ]
            }
        ]
    }
};

// Default fallback if category not found
const defaultSections = categoryOptions.shirt.sections;

const Configurator = ({ selections }) => {
    // Get configuration based on selected category (passed from parent)
    const categoryKey = selections.category?.id || 'shirt';
    const initialCategoryLabel = selections.category?.label || 'Shirt';

    const activeCategory = categoryOptions[categoryKey] || categoryOptions.shirt;
    const activeSections = activeCategory.sections || defaultSections;

    // --- STATE ---
    const [mode, setMode] = useState('classic'); // 'classic' | 'ai'

    // Classic Mode State
    const [config, setConfig] = useState({});
    const [expandedSection, setExpandedSection] = useState(null);

    // AI Mode State
    const [aiParams, setAiParams] = useState({
        description: '',
        age: '25',
        ethnicity: 'French',
        background: 'studio'
    });
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState(null);

    // Hydrate config on mount/category change
    useEffect(() => {
        const initialConfig = {};
        activeSections.forEach(section => {
            initialConfig[section.id] = section.options[0];
        });
        setConfig(initialConfig);
        setExpandedSection(activeSections[0].id);

        // Reset AI state on category change
        setGeneratedImage(null);
        setAiParams(prev => ({ ...prev, description: '' }));
    }, [categoryKey]);

    const handleSelect = (sectionId, option) => {
        setConfig(prev => ({ ...prev, [sectionId]: option }));
    };

    const toggleSection = (id) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const calculateTotal = () => {
        let total = activeCategory.basePrice || 0;
        Object.values(config).forEach(val => {
            if (val && val.price) total += val.price;
        });
        return total;
    };

    const handleGenerateDesign = async () => {
        setIsGenerating(true);
        setAiError(null);
        try {
            const outfitDesc = `${selections.category?.label || categoryKey}, ${aiParams.description}`;

            const response = await API.post('/design/generate', {
                outfit: outfitDesc,
                gender: selections.gender,
                age: aiParams.age,
                country: aiParams.ethnicity,
                background: aiParams.background
            });

            if (response.data && response.data.imageUrl) {
                setGeneratedImage(response.data.imageUrl);
            } else {
                setAiError('Failed to generate image. Please try again.');
            }
        } catch (error) {
            console.error(error);
            setAiError('Something went wrong. Please check your connection.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 min-h-[80vh]">
            {/* LEFT: VISUALIZER */}
            <div className="w-full lg:w-1/2">
                <div className="sticky top-24">
                    <div className="relative aspect-[3/4] bg-[#fdfdfd] rounded-sm overflow-hidden shadow-sm">
                        {/* If in AI mode and we have an image, show it. Otherwise show standard visualizer */}
                        {mode === 'ai' && generatedImage ? (
                            <img
                                src={generatedImage}
                                alt="AI Generated Design"
                                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                            />
                        ) : (
                            <>
                                {/* Dynamic Background tint based on color (Classic Mode) */}
                                {config.color && mode === 'classic' && (
                                    <div
                                        className="absolute inset-0 transition-colors duration-500 opacity-10 mix-blend-multiply"
                                        style={{ backgroundColor: config.color.hex }}
                                    />
                                )}

                                <img
                                    src={selections.category?.image || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop"}
                                    alt={selections.category?.label || "Garment"}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                {/* AI Loading Overlay */}
                                {isGenerating && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white">
                                        <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                                        <p className="text-lg font-medium">Creating your design...</p>
                                        <p className="text-sm opacity-80">This usually takes 5-10 seconds</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Overlay Gradient for premium look */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

                        {/* Mode Indicator Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-white/50">
                            {mode === 'ai' ? 'AI Studio' : 'Classic Configurator'}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: OPTIONS PANELS */}
            <div className="w-full lg:w-1/2 flex flex-col">
                {/* Mode Switcher */}
                <div className="flex p-1 mb-8 bg-muted rounded-lg w-full max-w-md self-center lg:self-start">
                    <button
                        onClick={() => setMode('classic')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'classic' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Classic
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'ai' ? 'bg-white shadow text-violet-600' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Design Studio
                    </button>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-serif font-medium mb-2">
                        {mode === 'ai' ? 'Design with AI' : 'Customizer'}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {mode === 'ai'
                            ? "Describe your vision and our AI will generate a unique design for you. Perfect for inspiration and custom requests."
                            : `Choose from our carefully curated selection of fabrics and then customize the ${initialCategoryLabel.toLowerCase()} to your preference.`
                        }
                    </p>
                </div>

                {/* CONTENT AREA */}
                {mode === 'classic' ? (
                    // --- CLASSIC MODE ---
                    <>
                        <div className="flex-1 space-y-0 border-t border-border">
                            {activeSections.map((section) => {
                                const isExpanded = expandedSection === section.id;
                                const selectedOption = config[section.id];

                                return (
                                    <div key={section.id} className="border-b border-border">
                                        <div
                                            onClick={() => toggleSection(section.id)}
                                            className="flex items-center justify-between py-5 cursor-pointer hover:bg-muted/30 transition-colors group"
                                        >
                                            <span className="font-medium text-sm text-foreground/80 group-hover:text-foreground">
                                                {section.label}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground">
                                                    {selectedOption ? selectedOption.name : 'Make a selection'}
                                                </span>
                                                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pb-6 pt-2">
                                                        {(section.type === 'color' || section.type === 'fabric') && (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                                {section.options.map(opt => (
                                                                    <div
                                                                        key={opt.id}
                                                                        onClick={() => handleSelect(section.id, opt)}
                                                                        className={`
                                                                            cursor-pointer p-3 rounded border transition-all flex items-center gap-3
                                                                            ${selectedOption?.id === opt.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/40'}
                                                                        `}
                                                                    >
                                                                        {section.type === 'color' && (
                                                                            <div className="w-6 h-6 rounded-full border border-border shadow-sm shrink-0" style={{ backgroundColor: opt.hex }} />
                                                                        )}
                                                                        {section.type === 'fabric' && (
                                                                            <div className="w-8 h-8 rounded bg-muted shrink-0 text-[10px] flex items-center justify-center text-muted-foreground font-mono">
                                                                                TEX
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate">{opt.name}</p>
                                                                            {opt.price > 0 && <p className="text-xs text-muted-foreground">+${opt.price}</p>}
                                                                        </div>
                                                                        {selectedOption?.id === opt.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {section.type === 'select' && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {section.options.map(opt => (
                                                                    <div
                                                                        key={opt.id}
                                                                        onClick={() => handleSelect(section.id, opt)}
                                                                        className={`
                                                                            cursor-pointer px-4 py-3 rounded border text-sm transition-all
                                                                            ${selectedOption?.id === opt.id ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:border-primary/40 text-muted-foreground'}
                                                                        `}
                                                                    >
                                                                        <div className="flex justify-between items-center mb-0.5">
                                                                            <span>{opt.name}</span>
                                                                            {selectedOption?.id === opt.id && <Check className="w-3.5 h-3.5" />}
                                                                        </div>
                                                                        {opt.desc && <p className="text-xs opacity-70 font-normal">{opt.desc}</p>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-border flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <span className="text-muted-foreground">Quantity: 1</span>
                                <div className="text-right">
                                    <p className="text-2xl font-serif font-medium">${calculateTotal()}</p>
                                </div>
                            </div>
                            <Button size="lg" className="w-full text-base py-6 bg-[#6B7280] hover:bg-[#4B5563] text-white">
                                {config.fabric ? `ADD TO BASKET — $${calculateTotal()}` : 'ADD TO BASKET'}
                            </Button>
                        </div>
                    </>
                ) : (
                    // --- AI MODE ---
                    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Description</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                                    placeholder={`Describe your perfect ${initialCategoryLabel.toLowerCase()} (e.g. elegant red silk with gold embroidery)...`}
                                    value={aiParams.description}
                                    onChange={(e) => setAiParams({ ...aiParams, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Model Age</label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white"
                                        value={aiParams.age}
                                        onChange={(e) => setAiParams({ ...aiParams, age: e.target.value })}
                                    >
                                        <option value="18">18-24</option>
                                        <option value="25">25-30</option>
                                        <option value="35">35-45</option>
                                        <option value="50">50+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Ethnicity</label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white"
                                        value={aiParams.ethnicity}
                                        onChange={(e) => setAiParams({ ...aiParams, ethnicity: e.target.value })}
                                    >
                                        <option value="French">European</option>
                                        <option value="Asian">Asian</option>
                                        <option value="African">African</option>
                                        <option value="Latino">Latino</option>
                                        <option value="Indian">Indian</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Background</label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white"
                                    value={aiParams.background}
                                    onChange={(e) => setAiParams({ ...aiParams, background: e.target.value })}
                                >
                                    <option value="studio">Studio Minimal</option>
                                    <option value="nature">Nature / Outdoor</option>
                                    <option value="urban">Urban Street</option>
                                    <option value="luxury">Luxury Interior</option>
                                </select>
                            </div>
                        </div>

                        {aiError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                                {aiError}
                            </div>
                        )}

                        <div className="mt-auto">
                            <Button
                                onClick={handleGenerateDesign}
                                disabled={isGenerating || !aiParams.description.trim()}
                                className="w-full h-12 text-base gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Generating Design...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        Generate Design
                                    </>
                                )}
                            </Button>

                            {generatedImage && (
                                <div className="mt-4">
                                    <Button variant="outline" className="w-full">
                                        Customize This Design Manually
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        Use this as inspiration for your custom order.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Configurator;
