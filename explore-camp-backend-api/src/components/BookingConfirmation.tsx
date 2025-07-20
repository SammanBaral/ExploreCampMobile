import { useLanguage } from '@/App';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { bookingService } from '@/services/bookingService';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [product, setProduct] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    cardNumber: '1234 5678 9012 3456',
    expiryDate: 'MM/YY',
    cvv: '123',
    nameOnCard: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

  // Fetch product and availability data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoadingData(true);

        // Fetch product details
        const productResponse = await apiService.getProduct(parseInt(id));
        if (productResponse.data) {
          setProduct(productResponse.data);
        }

        // Fetch availability
        const availabilityResponse = await apiService.getProductAvailability(parseInt(id));
        if (availabilityResponse.data) {
          setAvailability(availabilityResponse.data);
          console.log('Fetched availability:', availabilityResponse.data);
        } else {
          console.log('No availability data from API, using sample data');
          // Create specific sample availability data for testing - only July 25 and 26
          const sampleAvailability = [
            {
              id: 1,
              date: '2025-07-25',
              productId: parseInt(id),
              isBooked: false,
            },
            {
              id: 2,
              date: '2025-07-26',
              productId: parseInt(id),
              isBooked: false,
            }
          ];
          setAvailability(sampleAvailability);
          console.log('Created specific sample availability:', sampleAvailability);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load product information",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id, toast]);

  // Calculate nights and total based on selected dates
  const calculateNights = () => {
    if (!selectedRange.from || !selectedRange.to) return 0;
    const diffTime = selectedRange.to.getTime() - selectedRange.from.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    if (!product || nights <= 0) return 0;
    const basePrice = nights * product.pricePerNight;
    const cleaningFee = 15; // Fixed cleaning fee
    const serviceFee = Math.round(basePrice * 0.1); // 10% service fee
    return basePrice + cleaningFee + serviceFee;
  };

  const nights = calculateNights();
  const total = calculateTotal();

  // Calendar functions
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = formatDate(date);

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      console.log(`Date ${dateStr} is in the past, not available`);
      return false;
    }

    // Debug: Log availability data
    console.log('Availability data:', availability);
    console.log('Checking date:', dateStr);

    // If no availability data, create specific sample data for testing
    if (availability.length === 0) {
      console.log('No availability data, creating specific sample data for testing');
      // For testing: only allow specific dates (July 25 and 26, 2025)
      const allowedDates = [
        '2025-07-25',
        '2025-07-26'
      ];
      const isAvailable = allowedDates.includes(dateStr);
      console.log(`Specific availability for ${dateStr}: ${isAvailable}`);
      return isAvailable;
    }

    // Check availability from API
    const isAvailable = availability.some((a: any) => {
      const availabilityDate = new Date(a.date);
      const isMatch = availabilityDate.toDateString() === date.toDateString();
      const isNotBooked = !a.isBooked;
      console.log(`Date ${dateStr}: API date ${availabilityDate.toDateString()}, isMatch: ${isMatch}, isNotBooked: ${isNotBooked}`);
      return isMatch && isNotBooked;
    });

    console.log(`Date ${dateStr} is available: ${isAvailable}`);
    return isAvailable;
  };

  const handleRangeSelect = (range: { from: Date | undefined, to: Date | undefined }) => {
    if (!range.from || !range.to) {
      setSelectedRange(range);
      return;
    }

    // Check if all dates in the range are available
    let valid = true;
    let d = new Date(range.from);
    while (d <= range.to) {
      if (!isDateAvailable(d)) {
        valid = false;
        break;
      }
      d.setDate(d.getDate() + 1);
    }

    if (!valid) {
      toast({
        title: 'Unavailable Dates',
        description: 'One or more dates in the selected range are unavailable. Please select a different range.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedRange(range);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBooking = async () => {
    const errors: { [key: string]: boolean } = {};
    if (!formData.fullName) errors.fullName = true;
    if (!formData.email) errors.email = true;
    if (!formData.phone) errors.phone = true;
    setFieldErrors(errors);

    if (!product || !selectedRange.from || !selectedRange.to) {
      toast({
        title: "Error",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        productId: parseInt(id!),
        checkIn: formatDate(selectedRange.from!),
        checkOut: formatDate(selectedRange.to!),
        guestName: formData.fullName,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        specialRequest: formData.specialRequests,
        totalPrice: total,
        paymentMethod: paymentMethod,
      };

      const response = await bookingService.createBooking(bookingData);

      if (response.success) {
        setShowConfirmation(true);
        toast({
          title: "Booking Submitted",
          description: "Your booking has been submitted and is pending admin approval. You will receive an email confirmation once approved.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create booking",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate('/');
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Book Your Stay</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Product Info Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-green-500">
            <img
              src={product.images && product.images[0] ? `http://10.0.2.2:5000/uploads/${product.images[0]}` : '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
              <p className="text-lg font-bold text-gray-900">${product.pricePerNight}</p>
              <p className="text-xs text-gray-600">per night</p>
            </div>
          </div>
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h2>
            <p className="text-gray-600 mb-2">{product.location}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Check-in: {product.checkInTime}</span>
              <span>Check-out: {product.checkOutTime}</span>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Dates</h3>

          {/* Helpful Message */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Click on available dates to select your check-in and check-out.
              Unavailable dates are grayed out and cannot be selected.
            </p>
          </div>

          {/* Debug Info (remove in production) */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              🔍 <strong>Debug:</strong> Availability data count: {availability.length} |
              Available dates: {availability.filter((a: any) => !a.isBooked).map((a: any) => a.date).join(', ')} |
              Selected range: {selectedRange.from ? selectedRange.from.toDateString() : 'None'} - {selectedRange.to ? selectedRange.to.toDateString() : 'None'}
            </p>
          </div>

          <div className="mb-4 bg-gray-50 rounded-lg p-3">
            <CalendarComponent
              mode="range"
              selected={selectedRange}
              onSelect={handleRangeSelect}
              disabled={(date) => !isDateAvailable(date)}
              className="rounded-md border-0 bg-transparent"
            />
          </div>

          {/* Availability Legend */}
          <div className="mb-4 flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>

          {/* Selected Dates Summary */}
          {selectedRange.from && selectedRange.to && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Selected Dates</p>
                  <p className="text-lg font-bold text-blue-900">
                    {selectedRange.from.toLocaleDateString()} - {selectedRange.to.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {nights} nights • Check-in: {product.checkInTime} • Check-out: {product.checkOutTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">${total}</p>
                  <p className="text-xs text-blue-600">Total</p>
                </div>
              </div>
            </div>
          )}

          {/* No Dates Selected Message */}
          {!selectedRange.from && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Please select your check-in and check-out dates</p>
            </div>
          )}
        </div>

        {/* Guest Information */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className={`text-sm font-medium${fieldErrors.fullName ? ' text-red-600' : ''}`}>Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => { handleInputChange('fullName', e.target.value); setFieldErrors(f => ({ ...f, fullName: false })); }}
                placeholder="Enter your full name"
                className={`mt-1${fieldErrors.fullName ? ' border-red-600 focus:border-red-600 ring-1 ring-red-500' : ''}`}
              />
              {fieldErrors.fullName && <div className="text-xs text-red-600 mt-1">Full Name is required</div>}
            </div>
            <div>
              <Label htmlFor="email" className={`text-sm font-medium${fieldErrors.email ? ' text-red-600' : ''}`}>Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => { handleInputChange('email', e.target.value); setFieldErrors(f => ({ ...f, email: false })); }}
                placeholder="Enter your email"
                className={`mt-1${fieldErrors.email ? ' border-red-600 focus:border-red-600 ring-1 ring-red-500' : ''}`}
              />
              {fieldErrors.email && <div className="text-xs text-red-600 mt-1">Email is required</div>}
            </div>
            <div>
              <Label htmlFor="phone" className={`text-sm font-medium${fieldErrors.phone ? ' text-red-600' : ''}`}>Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => { handleInputChange('phone', e.target.value); setFieldErrors(f => ({ ...f, phone: false })); }}
                placeholder="Enter your phone number"
                className={`mt-1${fieldErrors.phone ? ' border-red-600 focus:border-red-600 ring-1 ring-red-500' : ''}`}
              />
              {fieldErrors.phone && <div className="text-xs text-red-600 mt-1">Phone Number is required</div>}
            </div>
            <div>
              <Label htmlFor="specialRequests" className="text-sm font-medium">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special requests or requirements"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">Credit/Debit Card</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex-1 cursor-pointer">PayPal</Label>
              </div>
            </div>
          </RadioGroup>

          {paymentMethod === 'card' && (
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="nameOnCard" className="text-sm font-medium">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  value={formData.nameOnCard}
                  onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                  placeholder="Enter name as it appears on card"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                I agree to the terms and conditions
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                By checking this box, you agree to our terms of service and cancellation policy.
              </p>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border p-4">
          <Button
            onClick={handleBooking}
            disabled={loading || !agreedToTerms || !selectedRange.from || !selectedRange.to}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Book Now • $${total}`
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Your booking will be pending until confirmed by admin
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Submitted!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Your booking has been submitted successfully and is pending admin approval.
              You will receive an email confirmation once your booking is approved.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Status:</strong> Pending Approval<br />
                <strong>Next Step:</strong> Wait for admin confirmation email
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmationClose} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingConfirmation;