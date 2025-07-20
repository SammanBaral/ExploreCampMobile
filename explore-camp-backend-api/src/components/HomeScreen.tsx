import logo from '@/assets/explore-camp-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import apiService from '@/services/api';
import { MapPin, Search, Star, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingScreen from './OnboardingScreen';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [trendingIds, setTrendingIds] = useState<number[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const fetchTrendingAndProducts = async () => {
      setLoading(true);
      const trendingRes = await apiService.adminGetTrending();
      const productsRes = await apiService.adminGetProducts();
      setTrendingIds(trendingRes.data || []);
      setProducts(productsRes.data || []);
      setLoading(false);
    };
    fetchTrendingAndProducts();

    // Check if first time user
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const categories = [
    { name: 'Cabins', icon: '🏘️', color: 'bg-orange-100', count: '45 spots' },
    { name: 'RV Sites', icon: '🚐', color: 'bg-blue-100', count: '32 spots' },
    { name: 'Tents', icon: '⛺', color: 'bg-green-100', count: '78 spots' }
  ];

  const experiences = [
    {
      name: 'Guided Hiking Tours',
      description: 'Explore hidden trails with expert guides',
      price: 'From $35 / person',
      image: '🥾',
      rating: 4.8
    },
    {
      name: 'Wilderness Cooking Class',
      description: 'Learn to prepare delicious meals outdoors',
      price: 'From $45 / person',
      image: '🔥',
      rating: 4.6
    }
  ];

  const trendingProducts = products.filter((p) => trendingIds.includes(p.id));

  if (showOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="flex flex-col items-center pt-8 pb-6">
          <img src={logo} alt="ExploreCamp" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold mb-1">Welcome to ExploreCamp</h2>
          <p className="text-blue-100 mb-4 text-center max-w-xs">
            Your gateway to outdoor adventures and memorable camping experiences.
          </p>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="flex justify-center gap-4 mb-6 px-4 -mt-4">
        <div className="flex-1 max-w-[160px] bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border border-gray-100">
          <TrendingUp className="w-6 h-6 text-blue-600 mb-1" />
          <span className="text-2xl font-bold text-primary">150+</span>
          <span className="text-xs text-muted-foreground mt-1">Camping Sites</span>
        </div>
        <div className="flex-1 max-w-[160px] bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border border-gray-100">
          <Users className="w-6 h-6 text-green-600 mb-1" />
          <span className="text-2xl font-bold text-primary">2.5K+</span>
          <span className="text-xs text-muted-foreground mt-1">Happy Campers</span>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative mb-6 px-4">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search for camping spots"
          className="pl-12 bg-white border-2 border-gray-200 rounded-xl h-12 text-base shadow-sm focus:border-blue-500 transition-colors"
          onClick={() => navigate('/search')}
        />
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
          <button
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => navigate('/search')}
          >
            Advanced Search
          </button>
        </div>
      </div>

      {/* Enhanced Categories */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Popular Categories</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category.name}
              className={`${category.color} rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => navigate('/search')}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="font-semibold text-sm">{category.name}</div>
              <div className="text-xs text-gray-600 mt-1">{category.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Trending Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Trending Destinations</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {trendingProducts.slice(0, 2).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/campsite/${product.id}`)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={product.images && product.images[0] ? `http://10.0.2.2:5000/uploads/${product.images[0]}` : '/placeholder.svg'}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.location}
                  </p>
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-xs text-gray-500 ml-1">(127 reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">Rs. {product.pricePerNight}</div>
                  <div className="text-xs text-gray-500">per night</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Experiences Section */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Experiences</h3>
        <div className="space-y-3">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{experience.image}</div>
                <div className="flex-1">
                  <h4 className="font-semibold">{experience.name}</h4>
                  <p className="text-sm text-gray-600">{experience.description}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{experience.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{experience.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;