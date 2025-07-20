import desertCamping from '@/assets/desert-camping.jpg';
import logo from '@/assets/explore-camp-logo.png';
import lakeCamping from '@/assets/lake-camping.jpg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { getBookmarkedProductIds, isProductBookmarked, toggleBookmark } from '@/lib/utils';
import apiService from '@/services/api';
import { Bookmark, Grid3X3, List, MoreVertical, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const coverImages = [
  lakeCamping,
  desertCamping,
  // Add more images as needed
];

const SavedScreen = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: '',
    description: '',
    coverImage: coverImages[0],
    private: false,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [addingSpot, setAddingSpot] = useState<{ [key: number]: boolean }>({});
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(getBookmarkedProductIds());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [viewCollection, setViewCollection] = useState<any | null>(null);
  const [removingSpot, setRemovingSpot] = useState<{ [key: number]: boolean }>({});

  const categoryColors: { [key: string]: string } = {
    'Lakeside': 'bg-blue-100 text-blue-800',
    'Beachfront': 'bg-yellow-100 text-yellow-800',
    'Forest': 'bg-green-100 text-green-800',
    'Desert': 'bg-orange-100 text-orange-800',
    'Riverside': 'bg-cyan-100 text-cyan-800',
    'Mountain': 'bg-purple-100 text-purple-800'
  };

  useEffect(() => {
    fetchAllProducts();
    fetchCollections();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAllProducts();
      if (res.data) {
        setAllProducts(res.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  };

  const fetchCollections = async () => {
    setCollectionsLoading(true);
    try {
      const res = await apiService.getUserCollections();
      if (res.data) setCollections(res.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
    setCollectionsLoading(false);
  };

  const handleBookmark = (productId: number) => {
    toggleBookmark(productId);
    setBookmarkedIds(getBookmarkedProductIds());
  };

  const savedCampsites = allProducts.filter((campsite: any) =>
    bookmarkedIds.includes(campsite.id)
  );

  const handleAddToCollection = async (productId: number, collectionId?: number) => {
    if (!collections.length) return;
    const colId = collectionId || collections[0].id;
    setAddingSpot((prev) => ({ ...prev, [productId]: true }));
    try {
      await apiService.addSpotToCollection(colId, productId);
      await fetchCollections();
    } catch (err) {
      console.error('Error adding spot to collection:', err);
    }
    setAddingSpot((prev) => ({ ...prev, [productId]: false }));
  };

  const handleViewCollection = (col: any) => {
    setViewCollection(col);
  };

  const handleRemoveFromCollection = async (productId: number, collectionId: number) => {
    setRemovingSpot((prev) => ({ ...prev, [productId]: true }));
    try {
      await apiService.removeSpotFromCollection(collectionId, productId);
      // Refetch collections to update UI
      await fetchCollections();
      // If viewing this collection, update it in modal
      const updatedCol = collections.find((c) => c.id === collectionId);
      if (updatedCol) setViewCollection(updatedCol);
    } catch (err) {
      console.error('Error removing spot from collection:', err);
    }
    setRemovingSpot((prev) => ({ ...prev, [productId]: false }));
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setNewCollection({
      title: '',
      description: '',
      coverImage: coverImages[0],
      private: false,
    });
    setError('');
  };

  const handleCreateCollection = async () => {
    if (!newCollection.title.trim()) {
      setError('Collection name is required.');
      return;
    }

    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
      setError('Please login to create collections.');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const res = await apiService.createCollection({
        title: newCollection.title,
        description: newCollection.description,
        coverImage: newCollection.coverImage,
        private: newCollection.private,
      });
      if (res.error) {
        setError(res.error);
      } else {
        setShowModal(false);
        fetchCollections();
      }
    } catch (err) {
      setError('Failed to create collection');
      console.error('Error creating collection:', err);
    }
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="ExploreCamp" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-foreground">Saved</h1>
          </div>
          <div className="flex items-center space-x-2">
            {!apiService.isAuthenticated() && (
              <Badge variant="destructive" className="text-xs">
                Not Logged In
              </Badge>
            )}
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* My Collections Section */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">My Collections</h2>
          <Button variant="link" className="text-green-700 p-0 h-auto" onClick={handleOpenModal}>
            Create New
          </Button>
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {/* Create New Card */}
          <Card
            className="min-w-[120px] h-28 flex flex-col items-center justify-center border-dashed border-2 border-gray-300 cursor-pointer hover:bg-accent/40 transition"
            onClick={handleOpenModal}
          >
            <span className="text-3xl text-gray-400 mb-1">+</span>
            <span className="text-xs text-gray-500">Create New</span>
          </Card>
          {/* Collection Cards */}
          {collectionsLoading ? (
            <div className="flex items-center text-muted-foreground text-sm">Loading...</div>
          ) : collections.length === 0 ? (
            <div className="flex items-center text-muted-foreground text-sm">No collections yet.</div>
          ) : (
            collections.map((col) => (
              <Card
                key={col.id}
                className="min-w-[120px] h-28 overflow-hidden cursor-pointer relative group"
                onClick={() => handleViewCollection(col)}
              >
                <img
                  src={col.coverImage || '/placeholder.svg'}
                  alt={col.title}
                  className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs truncate">
                  {col.title}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Saved Campsites</h2>
          <span className="text-xs text-muted-foreground">{savedCampsites.length} spots</span>
        </div>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading saved spots...</div>
        ) : savedCampsites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No bookmarked spots yet. Browse camping spots and tap the bookmark icon to save your favorites.
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            {savedCampsites.map((campsite) => {
              let avgRating = null;
              let reviewCount = 0;
              if (Array.isArray(campsite.reviews) && campsite.reviews.length > 0) {
                const sum = campsite.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
                avgRating = sum / campsite.reviews.length;
                reviewCount = campsite.reviews.length;
              } else if (typeof campsite.rating === 'number') {
                avgRating = campsite.rating;
                reviewCount = 0;
              }
              const priceFormatted = typeof campsite.pricePerNight === 'number'
                ? `Rs. ${campsite.pricePerNight} /night`
                : 'N/A';
              const distance = campsite.distance || '15 miles away';
              const dateRange = campsite.dateRange || 'May 31 - Jun 5';
              const bookmarked = isProductBookmarked(campsite.id);
              return (
                <Card
                  key={campsite.id}
                  className="overflow-hidden cursor-pointer hover:shadow-medium transition-all duration-200"
                  onClick={() => navigate(`/campsite/${campsite.id}`)}
                >
                  <div className="relative h-32">
                    <img
                      src={campsite.images && campsite.images[0] ? `http://10.0.2.2:5000/uploads/${campsite.images[0]}` : '/placeholder.svg'}
                      alt={campsite.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute top-2 right-2 z-20">
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/80 hover:bg-white"
                          onClick={e => { e.stopPropagation(); setOpenMenuId(campsite.id); }}
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </Button>
                        {openMenuId === campsite.id && (
                          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-30">
                            <div className="p-2 text-xs text-muted-foreground font-semibold">Add to Collection</div>
                            {collections.length === 0 ? (
                              <div className="p-2 text-xs text-muted-foreground">No collections</div>
                            ) : (
                              collections.map((col) => (
                                <button
                                  key={col.id}
                                  className="w-full text-left px-4 py-2 hover:bg-accent/40 text-sm disabled:opacity-50"
                                  disabled={addingSpot[campsite.id]}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleAddToCollection(campsite.id, col.id);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  {addingSpot[campsite.id] ? 'Adding...' : col.title}
                                </button>
                              ))
                            )}
                            <button
                              className="w-full text-left px-4 py-2 text-xs text-muted-foreground hover:bg-accent/40"
                              onClick={e => { e.stopPropagation(); setOpenMenuId(null); }}
                            >Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={e => { e.stopPropagation(); handleBookmark(campsite.id); }}
                    >
                      <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-primary text-primary' : ''}`} fill={bookmarked ? 'currentColor' : 'none'} />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">{campsite.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{campsite.location}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{avgRating !== null ? avgRating.toFixed(1) : (typeof campsite.rating === 'number' ? campsite.rating.toFixed(1) : 'N/A')}</span>
                        <span className="text-xs text-muted-foreground">({reviewCount})</span>
                      </div>
                      <span className="text-xs font-medium">{priceFormatted}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span role="img" aria-label="distance">📍</span> {distance}
                      <span role="img" aria-label="date" className="ml-2">📅</span> {dateRange}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {savedCampsites.map((campsite) => {
              let avgRating = null;
              let reviewCount = 0;
              if (Array.isArray(campsite.reviews) && campsite.reviews.length > 0) {
                const sum = campsite.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
                avgRating = sum / campsite.reviews.length;
                reviewCount = campsite.reviews.length;
              } else if (typeof campsite.rating === 'number') {
                avgRating = campsite.rating;
                reviewCount = 0;
              }
              const priceFormatted = typeof campsite.pricePerNight === 'number'
                ? `Rs. ${campsite.pricePerNight} /night`
                : 'N/A';
              const distance = campsite.distance || '15 miles away';
              const dateRange = campsite.dateRange || 'May 31 - Jun 5';
              const bookmarked = isProductBookmarked(campsite.id);
              return (
                <Card
                  key={campsite.id}
                  className="overflow-hidden cursor-pointer hover:shadow-medium transition-all duration-200"
                  onClick={() => navigate(`/campsite/${campsite.id}`)}
                >
                  <div className="flex">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={campsite.images && campsite.images[0] ? `http://10.0.2.2:5000/uploads/${campsite.images[0]}` : '/placeholder.svg'}
                        alt={campsite.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={e => { e.stopPropagation(); handleBookmark(campsite.id); }}
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-primary text-primary' : ''}`} fill={bookmarked ? 'currentColor' : 'none'} />
                      </Button>
                    </div>
                    <CardContent className="flex-1 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">{campsite.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{campsite.location}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{avgRating !== null ? avgRating.toFixed(1) : (typeof campsite.rating === 'number' ? campsite.rating.toFixed(1) : 'N/A')}</span>
                            <span className="text-xs text-muted-foreground">({reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span role="img" aria-label="distance">📍</span> {distance}
                            <span role="img" aria-label="date" className="ml-2">📅</span> {dateRange}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{priceFormatted}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Collection Name</label>
              <input
                type="text"
                value={newCollection.title}
                onChange={(e) => setNewCollection({ ...newCollection, title: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="e.g., Summer Adventures"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea
                value={newCollection.description}
                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Add a short description"
                rows={2}
              />
            </div>
            {/* Cover Image Picker */}
            <div>
              <label className="text-sm font-medium mb-1 block">Cover Image</label>
              <div className="flex space-x-2">
                {coverImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`cover-${idx}`}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${newCollection.coverImage === img ? 'border-green-600' : 'border-transparent'} transition`}
                    onClick={() => setNewCollection({ ...newCollection, coverImage: img })}
                  />
                ))}
              </div>
            </div>
            {/* Privacy Switch */}
            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="text-sm font-medium">Privacy</div>
                <div className="text-xs text-muted-foreground">Only you can see this collection</div>
              </div>
              <Switch
                checked={newCollection.private}
                onCheckedChange={(checked) => setNewCollection({ ...newCollection, private: checked })}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={creating}>
              {creating ? 'Creating...' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Collection Modal */}
      <Dialog open={!!viewCollection} onOpenChange={() => setViewCollection(null)}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{viewCollection?.title || 'Collection'}</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <img src={viewCollection?.coverImage || '/placeholder.svg'} alt="cover" className="w-full h-32 object-cover rounded mb-2" />
            <div className="text-sm text-muted-foreground mb-2">{viewCollection?.description}</div>
            <div className="text-xs text-muted-foreground mb-2">{viewCollection?.private ? 'Private' : 'Public'}</div>
          </div>
          <div>
            {viewCollection?.spots && viewCollection.spots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {viewCollection.spots.map((spot: any) => (
                  <Card key={spot.id} className="relative">
                    <img
                      src={spot.images && spot.images[0] ? `http://10.0.2.2:5000/uploads/${spot.images[0]}` : '/placeholder.svg'}
                      alt={spot.name}
                      className="w-full h-20 object-cover rounded-t"
                    />
                    <CardContent className="p-2">
                      <div className="font-medium text-xs mb-1 line-clamp-1">{spot.name}</div>
                      <div className="text-xs text-muted-foreground mb-1 line-clamp-1">{spot.location}</div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs"
                        disabled={removingSpot[spot.id]}
                        onClick={() => handleRemoveFromCollection(spot.id, viewCollection.id)}
                      >
                        {removingSpot[spot.id] ? 'Removing...' : 'Remove from Collection'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">No spots in this collection yet.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedScreen;