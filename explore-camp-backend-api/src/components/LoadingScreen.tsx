import logo from '@/assets/explore-camp-logo.png';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
    message?: string;
    showProgress?: boolean;
    onComplete?: () => void;
}

const LoadingScreen = ({
    message = "Loading your adventure...",
    showProgress = false,
    onComplete
}: LoadingScreenProps) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (showProgress) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        onComplete?.();
                        return 100;
                    }
                    return prev + Math.random() * 15;
                });
            }, 200);
            return () => clearInterval(interval);
        }
    }, [showProgress, onComplete]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
                {/* Animated Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8"
                >
                    <motion.img
                        src={logo}
                        alt="ExploreCamp"
                        className="w-24 h-24 mx-auto mb-4"
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                            y: [0, -10, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-2xl font-bold text-gray-900 mb-2"
                    >
                        ExploreCamp
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-gray-600"
                    >
                        Discovering amazing camping spots...
                    </motion.p>
                </motion.div>

                {/* Loading Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="mb-6"
                >
                    <p className="text-gray-700 font-medium">{message}</p>
                </motion.div>

                {/* Progress Bar */}
                {showProgress && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="w-64 mx-auto mb-4"
                    >
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
                    </motion.div>
                )}

                {/* Loading Dots */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="flex justify-center space-x-2"
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-3 bg-blue-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </motion.div>

                {/* Camping Icons Animation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 0.8 }}
                    className="mt-8 flex justify-center space-x-4"
                >
                    {['🏕️', '🏔️', '🌲', '🏖️', '🏜️'].map((icon, i) => (
                        <motion.div
                            key={i}
                            className="text-2xl"
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        >
                            {icon}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Loading Tips */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.8 }}
                    className="mt-8 text-center"
                >
                    <p className="text-xs text-gray-500">
                        💡 Tip: You can bookmark campsites to save them for later
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoadingScreen; 