import AdminDashboard from "@/components/AdminDashboard";
import BookingConfirmation from "@/components/BookingConfirmation";
import BottomNavigation from "@/components/BottomNavigation";
import CampsiteDetails from "@/components/CampsiteDetails";
import HelpSupportScreen from "@/components/HelpSupportScreen";
import HomeScreen from "@/components/HomeScreen";
import LoadingScreen from "@/components/LoadingScreen";
import LoginScreen from "@/components/LoginScreen";
import MyReviews from "@/components/MyReviews";
import PaymentMethods from "@/components/PaymentMethods";
import ProfileScreen from "@/components/ProfileScreen";
import ProfileSettings from "@/components/ProfileSettings";
import RegisterScreen from "@/components/RegisterScreen";
import SavedScreen from "@/components/SavedScreen";
import SearchScreen from "@/components/SearchScreen";
import TransactionHistory from "@/components/TransactionHistory";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple translations for demo (expand as needed)
const translations = {
  en: {
    settings: 'Settings',
    editProfile: 'Edit Profile',
    contactDetails: 'Contact Details',
    notificationSettings: 'Notification Settings',
    bookingHistory: 'Booking History',
    savedCampingSpots: 'Saved Camping Spots',
    myReviews: 'My Reviews',
    paymentMethods: 'Payment Methods',
    transactionHistory: 'Transaction History',
    helpSupport: 'Help & Support',
    preferences: 'Preferences',
    pushNotifications: 'Push Notifications',
    emailNotifications: 'Email Notifications',
    language: 'Language',
    darkMode: 'Dark Mode',
    logout: 'Log Out',
    english: 'English',
    nepali: 'नेपाली',
    // ...add more as needed
  },
  ne: {
    settings: 'सेटिङ',
    editProfile: 'प्रोफाइल सम्पादन',
    contactDetails: 'सम्पर्क विवरण',
    notificationSettings: 'सूचना सेटिङ',
    bookingHistory: 'बुकिङ इतिहास',
    savedCampingSpots: 'सेभ गरिएका क्याम्पिङ स्थानहरू',
    myReviews: 'मेरो समीक्षा',
    paymentMethods: 'भुक्तानी विधिहरू',
    transactionHistory: 'लेनदेन इतिहास',
    helpSupport: 'मद्दत र समर्थन',
    preferences: 'प्राथमिकताहरू',
    pushNotifications: 'पुष सूचना',
    emailNotifications: 'इमेल सूचना',
    language: 'भाषा',
    darkMode: 'डार्क मोड',
    logout: 'लगआउट',
    english: 'अंग्रेजी',
    nepali: 'नेपाली',
    // ...add more as needed
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: (lang: string) => { },
  t: (key: string) => key
});

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => { }
});

export const useLanguage = () => useContext(LanguageContext);
export const useTheme = () => useContext(ThemeContext);

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang) setLanguage(storedLang);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) setTheme(storedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }}>
        {children}
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const hideNavigation = ['/login', '/register', '/profile/settings'].includes(location.pathname) ||
    location.pathname.startsWith('/campsite/') ||
    location.pathname.startsWith('/booking/');

  useEffect(() => {
    // Simulate app startup loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Show loading for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen
        message="Starting your camping adventure..."
        showProgress={true}
        onComplete={() => setIsLoading(false)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/saved" element={<SavedScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/profile/settings" element={<ProfileSettings />} />
        <Route path="/campsite/:id" element={<CampsiteDetails />} />
        <Route path="/booking/:id" element={<BookingConfirmation />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/help" element={<HelpSupportScreen />} />
        <Route path="/reviews" element={<MyReviews />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route path="/transactions" element={<TransactionHistory />} />
      </Routes>
      {!hideNavigation && <BottomNavigation />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProviders>
          <div className="mobile-container">
            <AppContent />
          </div>
        </AppProviders>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
