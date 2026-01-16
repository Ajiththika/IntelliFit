import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import GenderSelector from '../components/customizer/GenderSelector';
import CategorySelector from '../components/customizer/CategorySelector';
import Configurator from '../components/customizer/Configurator';

const CustomizerPage = () => {
    const [step, setStep] = useState(1);
    const [selections, setSelections] = useState({
        gender: null,
        category: null,
        options: {}
    });

    const handleGenderSelect = (gender) => {
        setSelections({ ...selections, gender });
        setStep(2);
    };

    const handleCategorySelect = (category) => {
        setSelections({ ...selections, category });
        setStep(3);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-10">
            <div className="container mx-auto px-4">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {step > 1 && (
                            <Button variant="ghost" size="icon" onClick={handleBack}>
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">IntelliFit Studio</h1>
                            <p className="text-muted-foreground">Design your perfect garment</p>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        Step {step} of 3
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <GenderSelector onSelect={handleGenderSelect} />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <CategorySelector
                                gender={selections.gender}
                                onSelect={handleCategorySelect}
                            />
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Configurator
                                selections={selections}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CustomizerPage;
