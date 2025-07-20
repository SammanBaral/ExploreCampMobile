import logo from '@/assets/explore-camp-logo.png';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Search, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingScreen = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to ExploreCamp",
            subtitle: "Your gateway to unforgettable outdoor adventures",
            description: "Discover amazing camping spots, book your next adventure, and connect with nature like never before.",
            icon: <Search className="w-8 h-8 text-blue-600" />,
            color: "bg-blue-50",
            iconColor: "bg-blue-100"
        },
        {
            title: "Easy Booking Process",
            subtitle: "Book your perfect campsite in minutes",
            description: "Simple date selection, secure payment, and instant confirmation. Your adventure starts here.",
            icon: <Calendar className="w-8 h-8 text-green-600" />,
            color: "bg-green-50",
            iconColor: "bg-green-100"
        },
        {
            title: "Join the Community",
            subtitle: "Connect with fellow outdoor enthusiasts",
            description: "Share experiences, read reviews, and discover hidden gems recommended by our camping community.",
            icon: <Users className="w-8 h-8 text-purple-600" />,
            color: "bg-purple-50",
            iconColor: "bg-purple-100"
        },
        {
            title: "Explore Amazing Destinations",
            subtitle: "From mountains to lakes, forests to deserts",
            description: "Find the perfect spot for your next adventure with detailed photos, amenities, and real reviews.",
            icon: <MapPin className="w-8 h-8 text-orange-600" />,
            color: "bg-orange-50",
            iconColor: "bg-orange-100"
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        navigate('/home');
    };

    const handleComplete = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        navigate('/home');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-8"
                >
                    <motion.img
                        src={logo}
                        alt="ExploreCamp"
                        className="w-20 h-20 mx-auto mb-4"
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                        }}
                    />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">ExploreCamp</h1>
                    <p className="text-gray-600 text-lg">Discover • Book • Explore</p>
                </motion.div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md w-full"
                    >
                        <div className={`${steps[currentStep].color} rounded-2xl p-8 shadow-lg border border-white/50`}>
                            <div className={`${steps[currentStep].iconColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                                {steps[currentStep].icon}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                {steps[currentStep].title}
                            </h2>

                            <p className="text-lg text-gray-700 text-center mb-4">
                                {steps[currentStep].subtitle}
                            </p>

                            <p className="text-gray-600 text-center leading-relaxed">
                                {steps[currentStep].description}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Dots */}
                <div className="flex space-x-2 mt-8 mb-8">
                    {steps.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`w-3 h-3 rounded-full transition-colors ${index === currentStep
                                    ? 'bg-blue-600'
                                    : index < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        />
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="px-6"
                    >
                        Skip
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="px-6 flex items-center"
                    >
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-gray-500">
                        Join thousands of campers discovering amazing destinations
                    </p>
                    <div className="flex items-center justify-center mt-2 space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">4.8/5 rating</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OnboardingScreen; 