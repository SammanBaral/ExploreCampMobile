import { useLanguage, useTheme } from '@/App';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import apiService from '@/services/api';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showLangModal, setShowLangModal] = useState(false);

  const handleLogout = async () => {
    await apiService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-background border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-medium">{t('settings')}</span>
      </div>

      <div className="px-4 space-y-6">
        {/* Personal Information */}
        <div className="pt-4">
          <div className="text-sm text-muted-foreground uppercase tracking-wide mb-3 font-medium">
            PERSONAL INFORMATION
          </div>

          <div className="space-y-1">
            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/profile/edit')}
            >
              <div className="flex items-center gap-3">
                <span>👤</span>
                <span>Edit Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/profile/contact')}
            >
              <div className="flex items-center gap-3">
                <span>📧</span>
                <span>Contact Details</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/profile/notifications')}
            >
              <div className="flex items-center gap-3">
                <span>🔔</span>
                <span>Notification Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Bookings & Saves */}
        <div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide mb-3 font-medium">
            BOOKINGS & SAVES
          </div>

          <div className="space-y-1">
            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/bookings')}
            >
              <div className="flex items-center gap-3">
                <span>📅</span>
                <span>Booking History</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/saved')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>🔖</span>
                  <span>Saved Camping Spots</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">8</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </button>

            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/reviews')}
            >
              <div className="flex items-center gap-3">
                <span>⭐</span>
                <span>My Reviews</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Payments & Support */}
        <div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide mb-3 font-medium">
            PAYMENTS & SUPPORT
          </div>

          <div className="space-y-1">
            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/payment-methods')}
            >
              <div className="flex items-center gap-3">
                <span>💳</span>
                <span>Payment Methods</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/transactions')}
            >
              <div className="flex items-center gap-3">
                <span>💰</span>
                <span>Transaction History</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              onClick={() => navigate('/help')}
            >
              <div className="flex items-center gap-3">
                <span>❓</span>
                <span>Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('preferences')}</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <span>🔔</span>
                <span>Push Notifications</span>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <span>📧</span>
                <span>Email Notifications</span>
              </div>
              <Switch defaultChecked />
            </div>

            <button
              className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => setShowLangModal(true)}
            >
              <div className="flex items-center gap-3">
                <span>🌐</span>
                <span>{t('language')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{language === 'en' ? t('english') : t('nepali')}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
            {/* Language Modal */}
            {showLangModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-background rounded-lg p-6 w-80 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">{t('language')}</h3>
                  <button className={`w-full p-2 rounded mb-2 ${language === 'en' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={() => { setLanguage('en'); setShowLangModal(false); }}>{t('english')}</button>
                  <button className={`w-full p-2 rounded ${language === 'ne' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={() => { setLanguage('ne'); setShowLangModal(false); }}>{t('nepali')}</button>
                  <button className="w-full mt-4 text-sm text-muted-foreground" onClick={() => setShowLangModal(false)}>Close</button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <span>🌙</span>
                <span>{t('darkMode')}</span>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4 pb-4">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;