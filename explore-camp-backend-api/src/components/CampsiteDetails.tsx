import desertCamping from '@/assets/desert-camping.jpg';
import heroMountainAutumn from '@/assets/hero-mountain-autumn.jpg';
import lakeCamping from '@/assets/lake-camping.jpg';
import mountainCamp from '@/assets/mountain-camp.jpg';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import apiService from '@/services/api';
import { ArrowLeft, Bath, Calendar, ChevronLeft, ChevronRight, Droplet, MapPin, ParkingCircle, ShieldCheck, Star, Wifi, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapView from './MapView';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

// Static camping spots data (same as SearchScreen)
const staticCampingSpots = [
  {
    id: 1,
    name: "Mountain View Campground",
    location: "Rocky Mountains, Colorado",
    distance: "2.5 miles from trailhead",
    dates: "Available: June 15 - August 30",
    pricePerNight: 45,
    rating: 4.8,
    reviews: 127,
    images: [mountainCamp],
    description: "Stunning mountain views with easy access to hiking trails. Perfect for families and solo adventurers.",
    amenities: ['Fire pit', 'Drinking water', 'Parking', 'Ranger patrol', 'No WiFi', 'Restrooms'],
    about: `Nestled among towering mountains, Mountain View Campground offers a peaceful retreat in nature. Wake up to birdsong and dappled sunlight filtering through ancient trees. Perfect for hikers, photographers, and nature enthusiasts.`
  },
  {
    id: 2,
    name: "Lakeside Retreat",
    location: "Lake Tahoe, California",
    distance: "0.3 miles from lake",
    dates: "Available: May 1 - October 15",
    pricePerNight: 65,
    rating: 4.9,
    reviews: 203,
    images: [lakeCamping],
    description: "Peaceful lakeside camping with fishing and swimming opportunities. Beautiful sunset views.",
    amenities: ['Fire pit', 'Drinking water', 'Parking', 'Restrooms', 'No WiFi'],
    about: `Enjoy peaceful lakeside camping with fishing and swimming opportunities. Beautiful sunset views and tranquil mornings by the water.`
  },
  {
    id: 3,
    name: "Desert Oasis Camp",
    location: "Joshua Tree, California",
    distance: "1.2 miles from park entrance",
    dates: "Available: Year-round",
    pricePerNight: 35,
    rating: 4.6,
    reviews: 89,
    images: [desertCamping],
    description: "Unique desert camping experience with star-gazing opportunities. Minimal light pollution.",
    amenities: ['Fire pit', 'Parking', 'No WiFi'],
    about: `A unique desert camping experience with star-gazing opportunities and minimal light pollution. Perfect for adventurers and stargazers.`
  },
  {
    id: 4,
    name: "Forest Haven",
    location: "Redwood National Park, California",
    distance: "0.8 miles from visitor center",
    dates: "Available: April 1 - November 30",
    pricePerNight: 55,
    rating: 4.7,
    reviews: 156,
    images: [heroMountainAutumn],
    description: "Immersed in ancient redwood forest. Perfect for nature lovers and photography enthusiasts.",
    amenities: ['Fire pit', 'Drinking water', 'Parking', 'Restrooms', 'Ranger patrol', 'No WiFi'],
    about: `Nestled among towering redwoods, Forest Haven offers a peaceful retreat in nature. Wake up to birdsong and dappled sunlight filtering through ancient trees. Perfect for hikers, photographers, and nature enthusiasts.`
  }
];

const amenitiesIcons: Record<string, JSX.Element> = {
  'Fire pit': <Zap className="w-5 h-5" />,
  'Drinking water': <Droplet className="w-5 h-5" />,
  'Parking': <ParkingCircle className="w-5 h-5" />,
  'Ranger patrol': <ShieldCheck className="w-5 h-5" />,
  'No WiFi': <Wifi className="w-5 h-5 text-muted-foreground line-through" />,
  'Restrooms': <Bath className="w-5 h-5" />
};

const reviews = [
  {
    name: 'Emily Johnson',
    date: 'May 2025',
    rating: 5.0,
    text: 'Amazing location with easy access to hiking trails. The campsite was spacious and private. Fire pit was perfect for evening cookouts. Only minor issue was the restrooms were a bit far from our site.'
  },
  {
    name: 'Michael Roberts',
    date: 'April 2025',
    rating: 4.8,
    text: 'Great location with easy access to hiking trails. The campsite was spacious and private. Fire pit was perfect for evening cookouts. Only minor issue was the restrooms were a bit far from our site.'
  }
];

const CampsiteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campsite, setCampsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [similarSpots, setSimilarSpots] = useState<any[]>([]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [availability, setAvailability] = useState<any[]>([]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch product details
        const productResponse = await apiService.getProduct(parseInt(id));
        if (productResponse.data) {
          setCampsite(productResponse.data);

          // Fetch similar products (all products except current)
          const allProductsResponse = await apiService.getAllProducts();
          if (allProductsResponse.data) {
            const similar = allProductsResponse.data.filter((p: any) => p.id !== parseInt(id));
            setSimilarSpots(similar.slice(0, 3)); // Show max 3 similar spots
          }
        }

        // Fetch reviews
        const reviewsResponse = await apiService.getProductReviews(parseInt(id));
        if (reviewsResponse.data) {
          setReviews(reviewsResponse.data);
        }

        // Fetch availability
        const availabilityResponse = await apiService.getProductAvailability(parseInt(id));
        if (availabilityResponse.data) {
          setAvailability(availabilityResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return;

    try {
      const response = await apiService.addReview({
        productId: parseInt(id!),
        rating: newReview.rating,
        comment: newReview.comment
      });

      if (response.data) {
        setReviews([response.data, ...reviews]);
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!campsite) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Campsite not found.</div>;
  }

  let avgRating = null;
  if (Array.isArray(reviews) && reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    avgRating = sum / reviews.length;
  } else if (typeof campsite.rating === 'number') {
    avgRating = campsite.rating;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-background border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-medium">Campsite Details</span>
      </div>
      {/* Image */}
      <div className="relative w-full h-56 md:h-80 bg-muted flex items-center justify-center overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {(campsite.images || []).map((img: string, idx: number) => (
              <CarouselItem key={idx} className="h-56 md:h-80">
                <img
                  src={`http://10.0.2.2:5000/uploads/${img}`}
                  alt={campsite.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="right-2 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
        <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
          {campsite.images?.length || 0} photo{(campsite.images?.length || 0) > 1 ? 's' : ''}
        </div>
      </div>
      {/* Main Info */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-foreground">{campsite.name}</h2>
            <div className="text-sm text-muted-foreground">{campsite.location}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{campsite.location}</span>
              <Calendar className="w-4 h-4 ml-4" />
              <span>Available dates vary</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span className="font-semibold">{avgRating !== null ? avgRating.toFixed(1) : 'N/A'}</span>
              <span className="text-xs text-muted-foreground">({reviews.length})</span>
            </div>
            <div className="mt-2">
              <span className="text-lg font-bold text-foreground">Rs. {campsite.pricePerNight}</span>
              <span className="text-muted-foreground text-sm"> /night</span>
            </div>
            <Button className="mt-2 bg-green-500 hover:bg-green-600" onClick={() => navigate(`/booking/${campsite.id}`)}>
              Book Now
            </Button>
          </div>
        </div>
        {/* About */}
        <div className="mt-4">
          <h3 className="font-semibold mb-1">About this spot</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{campsite.about || 'No description available.'}</p>
        </div>
        {/* Amenities */}
        <div className="mt-4">
          <h3 className="font-semibold mb-1">Campsite amenities</h3>
          <div className="flex flex-wrap gap-4 mt-2">
            {campsite.amenities?.map((amenity: string) => (
              <div key={amenity} className="flex items-center gap-2 text-sm">
                {amenitiesIcons[amenity] || null}
                <span>{amenity}</span>
              </div>
            )) || <span className="text-muted-foreground">No amenities listed</span>}
          </div>
        </div>
        {/* Map Section */}
        <div className="mt-6">
          <h3 className="font-semibold mb-1">Location</h3>
          <MapView lat={campsite.latitude} lng={campsite.longitude} markerText={campsite.name} />
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {campsite.location}
          </div>
        </div>
        {/* Availability Calendar */}
        <div className="mt-6">
          <h3 className="font-semibold mb-1">Availability</h3>
          <div className="w-full bg-white rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentMonth(newDate);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentMonth(newDate);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Calendar header */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {(() => {
                const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                const days = [];

                // Add empty cells for days before the first day of the month
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`empty-${i}`} className="p-2"></div>);
                }

                // Add days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isAvailable = availability.some((a: any) => {
                    const availabilityDate = new Date(a.date);
                    const currentDate = new Date(date);
                    return availabilityDate.toDateString() === currentDate.toDateString() && !a.isBooked;
                  });
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = date < new Date();

                  days.push(
                    <div
                      key={day}
                      className={`text-xs p-2 rounded transition-colors ${isToday
                        ? 'bg-primary text-primary-foreground font-bold'
                        : isPast
                          ? 'text-muted-foreground/50'
                          : isAvailable
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                            : 'text-muted-foreground'
                        }`}
                    >
                      {day}
                    </div>
                  );
                }

                return days;
              })()}
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span className="text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span className="text-muted-foreground">Unavailable</span>
              </div>
            </div>
          </div>
        </div>
        {/* Reviews */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Reviews</h3>
            <Button onClick={() => setShowReviewForm(true)} size="sm">
              Add Review
            </Button>
          </div>

          {showReviewForm && (
            <div className="mb-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">Rating:</span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`text-2xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Write your review..."
                className="w-full p-2 border rounded-md"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSubmitReview} size="sm">Submit</Button>
                <Button onClick={() => setShowReviewForm(false)} variant="outline" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          {reviews.length > 0 ? (
            reviews.map((review, i) => (
              <div key={i} className="border-b border-border py-2">
                <div className="flex items-center gap-2">
                  {review.user?.profileImage ? (
                    <img
                      src={`http://10.0.2.2:5000/uploads/${review.user.profileImage.replace(/^uploads\//, '')}`}
                      alt={review.user?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border"
                      onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-lg text-primary">
                      {review.user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{review.user?.name || 'Anonymous'}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold text-sm">{review.rating}</span>
                  </div>
                </div>
                <div className="text-sm mt-1 text-muted-foreground">{review.comment}</div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
          )}
        </div>
        {/* Similar spots */}
        <div className="mt-6">
          <h3 className="font-semibold mb-1">Similar spots</h3>
          <div className="space-y-3 mt-2">
            {similarSpots.map((spot) => (
              <Card key={spot.id} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted" onClick={() => navigate(`/campsite/${spot.id}`)}>
                <img
                  src={spot.images && spot.images[0] ? `http://10.0.2.2:5000/uploads/${spot.images[0]}` : '/placeholder.svg'}
                  alt={spot.name}
                  className="w-16 h-12 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{spot.name}</div>
                  <div className="text-xs text-muted-foreground">{spot.location}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span>{spot.rating || 0}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-base">Rs. {spot.pricePerNight}</div>
                  <Button size="sm" onClick={e => { e.stopPropagation(); navigate(`/campsite/${spot.id}`); }}>View</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampsiteDetails;