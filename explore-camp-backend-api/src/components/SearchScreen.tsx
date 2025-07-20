import logo from '@/assets/explore-camp-logo.png';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  getBookmarkedProductIds,
  isProductBookmarked,
  toggleBookmark,
} from '@/lib/utils';
import apiService from '@/services/api';
import { Bookmark, Search, SlidersHorizontal, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import SearchFiltersModal from './SearchFiltersModal';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(getBookmarkedProductIds());
  const [filters, setFilters] = useState<any>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filterPills = [
    { label: 'Location', active: false },
    { label: 'Dates', active: false },
    { label: 'Guests', active: false },
    { label: 'Price', active: false },
    { label: 'Amenities', active: false }
  ];

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.getAllProducts();
        if (res.data) {
          setProducts(res.data);
        } else {
          setError(res.error || 'Failed to fetch products');
        }
      } catch (e) {
        setError('Failed to fetch products');
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Apply filters from modal
  const handleApplyFilters = async (appliedFilters: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.searchProducts(appliedFilters);
      if (res.data) {
        setProducts(res.data);
        setFilters(appliedFilters);
      } else {
        setError(res.error || 'Failed to fetch products');
      }
    } catch (e) {
      setError('Failed to fetch products');
    }
    setLoading(false);
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookNow = (spotId: number) => {
    navigate(`/booking/${spotId}`);
  };

  // When a bookmark is toggled, update state
  const handleBookmark = (productId: number) => {
    toggleBookmark(productId);
    setBookmarkedIds(getBookmarkedProductIds());
  };

  if (loading) {
    return (
      <LoadingScreen
        message="Discovering amazing camping spots..."
        showProgress={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="ExploreCamp" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-foreground">Search</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search camping spots, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-muted"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {filterPills.map((pill, index) => (
              <Button
                key={index}
                variant={pill.active ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => {
                  setActiveSection(pill.label.toLowerCase());
                  setFiltersOpen(true);
                }}
              >
                {pill.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="text-sm text-muted-foreground mb-2">
          {loading ? 'Loading...' : `${filteredProducts.length} camping spots found`}
        </div>
        {error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load camping spots</h3>
            <p className="text-gray-600 mb-4">
              {error.includes('network') ?
                'Please check your internet connection and try again.' :
                error.includes('server') ?
                  'Our servers are temporarily unavailable. Please try again in a few minutes.' :
                  'We encountered an issue loading the camping spots. Please try again.'
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => setError('')}>
                Clear Error
              </Button>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No camping spots found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? `No results found for "${searchQuery}". Try adjusting your search or filters.`
                    : 'Try adjusting your search criteria or browse our featured spots.'
                  }
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                    className="mr-2"
                  >
                    Clear Search
                  </Button>
                )}
                <Button onClick={() => setFiltersOpen(true)}>
                  Adjust Filters
                </Button>
              </div>
            ) : (
              filteredProducts.map((product) => {
                let avgRating = null;
                let reviewCount = 0;
                if (Array.isArray(product.reviews) && product.reviews.length > 0) {
                  const sum = product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
                  avgRating = sum / product.reviews.length;
                  reviewCount = product.reviews.length;
                } else if (typeof product.rating === 'number') {
                  avgRating = product.rating;
                  reviewCount = 0;
                }
                const priceFormatted = typeof product.pricePerNight === 'number'
                  ? `Rs. ${product.pricePerNight} /night`
                  : 'N/A';
                // Placeholder for distance and date range
                const distance = product.distance || '15 miles away';
                const dateRange = product.dateRange || 'May 31 - Jun 5';
                const bookmarked = isProductBookmarked(product.id);
                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/campsite/${product.id}`)}
                  >
                    {/* Image Carousel */}
                    <div className="relative h-48">
                      <Carousel className="h-full">
                        <CarouselContent>
                          {(product.images || []).map((img: string, idx: number) => (
                            <CarouselItem key={idx} className="h-48">
                              <img
                                src={`http://10.0.2.2:5000/uploads/${img}`}
                                alt={product.name}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => { e.stopPropagation(); handleBookmark(product.id); }}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{product.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{avgRating ? avgRating.toFixed(1) : 'N/A'}</span>
                          <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.about?.slice(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{distance}</span>
                        </div>
                        <span className="font-semibold">{priceFormatted}</span>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        ) : null}
      </div>
      <SearchFiltersModal
        open={filtersOpen}
        onOpenChange={(open) => {
          setFiltersOpen(open);
          if (!open) setActiveSection(null);
        }}
        onApply={(appliedFilters) => {
          handleApplyFilters({ ...filters, ...appliedFilters });
          setActiveSection(null);
        }}
        initialFilters={filters}
        initialSection={activeSection}
      />
    </div>
  );
};

export default SearchScreen;
