import { useLanguage } from '@/App';
import logo from '@/assets/explore-camp-logo.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import { Booking, bookingService } from '@/services/bookingService';
import { Calendar, ChevronRight, DollarSign, MapPin, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactDetailsModal from './ContactDetailsModal';
import EditProfileModal from './EditProfileModal';
import NotificationSettingsModal from './NotificationSettingsModal';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [bookingCounts, setBookingCounts] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0, upcoming: 0 });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Load bookings from backend API
    const fetchBookings = async () => {
      try {
        const response = await apiService.getUserBookings();
        if (response.data) {
          const mappedBookings = (response.data || []).map((booking: any) => ({
            ...booking,
            campsiteName: booking.product?.name || 'Campsite',
            image: booking.product?.images?.[0]
              ? `http://10.0.2.2:5000/uploads/${booking.product.images[0]}`
              : '/placeholder.svg',
            location: booking.product?.location || '',
            campsiteId: booking.product?.id,
            pricePerNight: booking.product?.pricePerNight,
            checkInTime: booking.product?.checkInTime,
            checkOutTime: booking.product?.checkOutTime,
          }));
          setUserBookings(mappedBookings);
          // Calculate booking counts
          const counts = {
            total: response.data.length,
            confirmed: response.data.filter((b: any) => b.status === 'confirmed').length,
            pending: response.data.filter((b: any) => b.status === 'pending').length,
            cancelled: response.data.filter((b: any) => b.status === 'cancelled').length,
            upcoming: response.data.filter((b: any) =>
              b.status !== 'cancelled' && new Date(b.checkIn) > new Date()
            ).length
          };
          setBookingCounts(counts);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        // Fallback to localStorage if API fails
        const bookings = bookingService.getUserBookings();
        setUserBookings(bookings);
        setBookingCounts(bookingService.getBookingCounts());
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await apiService.getCurrentUser();
        if (userResponse.data) {
          setUser(userResponse.data);
          localStorage.setItem('userData', JSON.stringify(userResponse.data));
        } else if (userResponse.error) {
          console.log('Profile fetch error:', userResponse.error);
          // Fallback to localStorage for any error
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser({
              name: 'John Doe',
              email: 'john.doe@example.com',
              location: 'New York, NY'
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to localStorage for any error
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({
            name: 'John Doe',
            email: 'john.doe@example.com',
            location: 'New York, NY'
          });
        }
      }
    };
    // Always check localStorage first
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await apiService.logout();
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    if (bookingToCancel) {
      try {
        // Call backend API to cancel booking
        const response = await apiService.cancelBooking(bookingToCancel.id);
        if (response.data) {
          // Show cancellation details
          const { cancellationCharge, refundAmount, totalPaid } = response.data;
          toast({
            title: "Booking Cancelled",
            description: `Cancellation charge: $${cancellationCharge}. Refund: $${refundAmount}`,
            variant: "default",
          });

          // Refresh bookings from API
          const bookingsResponse = await apiService.getUserBookings();
          if (bookingsResponse.data) {
            const mappedBookings = (bookingsResponse.data || []).map((booking: any) => ({
              ...booking,
              campsiteName: booking.product?.name || 'Campsite',
              image: booking.product?.images?.[0]
                ? `http://10.0.2.2:5000/uploads/${booking.product.images[0]}`
                : '/placeholder.svg',
              location: booking.product?.location || '',
              campsiteId: booking.product?.id,
              pricePerNight: booking.product?.pricePerNight,
              checkInTime: booking.product?.checkInTime,
              checkOutTime: booking.product?.checkOutTime,
            }));
            setUserBookings(mappedBookings);
            const counts = {
              total: bookingsResponse.data.length,
              confirmed: bookingsResponse.data.filter((b: any) => b.status === 'confirmed').length,
              pending: bookingsResponse.data.filter((b: any) => b.status === 'pending').length,
              cancelled: bookingsResponse.data.filter((b: any) => b.status === 'cancelled').length,
              upcoming: bookingsResponse.data.filter((b: any) =>
                b.status !== 'cancelled' && new Date(b.checkIn) > new Date()
              ).length
            };
            setBookingCounts(counts);
          }
          setShowCancelDialog(false);
          setBookingToCancel(null);
        }
      } catch (error: any) {
        console.error('Failed to cancel booking:', error);
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to cancel booking",
          variant: "destructive",
        });
        // Fallback to localStorage
        const success = bookingService.cancelBooking(bookingToCancel.id);
        if (success) {
          const updatedBookings = bookingService.getUserBookings();
          setUserBookings(updatedBookings);
          setBookingCounts(bookingService.getBookingCounts());
          setShowCancelDialog(false);
          setBookingToCancel(null);
        }
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const upcomingBookings = userBookings.filter(booking => {
    const isUpcoming = booking.status !== 'cancelled' && new Date(booking.checkIn) > new Date();
    console.log(`Booking ${booking.campsiteName}: status=${booking.status}, checkIn=${booking.checkIn}, isUpcoming=${isUpcoming}`);
    return isUpcoming;
  });

  const pendingBookings = userBookings.filter(booking => booking.status === 'pending');
  const confirmedBookings = userBookings.filter(booking => booking.status === 'confirmed');

  const displayedBookings = showAllBookings ? userBookings.filter(b => b.status !== 'cancelled') : upcomingBookings;

  console.log('upcomingBookings count:', upcomingBookings.length);
  console.log('pendingBookings count:', pendingBookings.length);
  console.log('confirmedBookings count:', confirmedBookings.length);
  console.log('displayedBookings count:', displayedBookings.length);
  console.log('displayedBookings:', displayedBookings);

  // Add update handlers
  const handleProfileUpdated = (updatedUser: any) => {
    // Always fetch the latest user data from backend after update
    apiService.getCurrentUser().then(res => {
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('userData', JSON.stringify(res.data));
      } else {
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    });
  };
  const handleContactUpdated = (updatedUser: any) => {
    setUser(updatedUser);
  };
  const handleNotificationsUpdated = (updatedUser: any) => {
    setUser(updatedUser);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Replace with <Spinner /> if you have a spinner component */}
        <div className="text-muted-foreground text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="ExploreCamp"
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold">Profile</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile/settings')}>
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-4 space-y-6">
        {/* User Info */}
        <div className="pt-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={`http://10.0.2.2:5000/uploads/${user.profileImage}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold">{user ? user.name : 'User'}</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            📧 {user ? user.email : 'user@example.com'}
          </p>
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            📍 {user ? user.location : 'Unknown'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{bookingCounts.total}</div>
            <div className="text-xs text-muted-foreground">Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{bookingCounts.upcoming}</div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{bookingCounts.confirmed}</div>
            <div className="text-xs text-muted-foreground">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">4.9</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {showAllBookings ? 'All Bookings' : 'Upcoming Bookings'}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllBookings(!showAllBookings)}
            >
              {showAllBookings ? 'Show Upcoming' : 'Show All'}
            </Button>
          </div>
          {displayedBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{showAllBookings ? 'No bookings found' : 'No upcoming bookings'}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/search')}
              >
                Browse Campsites
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedBookings.map((booking) => (
                <div key={booking.id} className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex gap-3">
                    <img
                      src={booking.image}
                      alt={booking.campsiteName}
                      className="w-16 h-16 bg-muted rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{booking.campsiteName}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.location}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-3 h-3" />
                        <span>{booking.dates}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <DollarSign className="w-3 h-3" />
                        <span>${booking.total ? booking.total.toFixed(2) : '0.00'} total</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/campsite/${booking.campsiteId}`)}
                        >
                          View Details
                        </Button>
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelBooking(booking)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">{t('account')}</h3>
          <div className="bg-white rounded-lg shadow divide-y">
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between" onClick={() => setShowEditProfile(true)}>
              <span>{t('editProfile')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between" onClick={() => setShowContactDetails(true)}>
              <span>{t('contactDetails')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between" onClick={() => setShowNotificationSettings(true)}>
              <span>{t('notificationSettings')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Booking Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Are you sure you want to cancel your booking at <span className="font-semibold">{bookingToCancel?.campsiteName}</span>?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. You may be subject to cancellation fees depending on the campsite's policy.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelBooking}
                className="flex-1"
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modals */}
      <EditProfileModal open={showEditProfile && !!user} onOpenChange={setShowEditProfile} user={user} onProfileUpdated={handleProfileUpdated} />
      <ContactDetailsModal open={showContactDetails} onOpenChange={setShowContactDetails} user={user} onContactUpdated={handleContactUpdated} />
      <NotificationSettingsModal open={showNotificationSettings} onOpenChange={setShowNotificationSettings} user={user} onNotificationsUpdated={handleNotificationsUpdated} />
    </div>
  );
};

export default ProfileScreen;