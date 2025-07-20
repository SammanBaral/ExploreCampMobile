import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Drawer, DrawerContent } from './ui/drawer';
import { Input } from './ui/input';
import { Switch } from './ui/switch';

// Placeholder icons for amenities/types
const icons: Record<string, string> = {
    'Campfire Allowed': '🔥',
    'Parking On Site': '🚗',
    'Potable Water': '💧',
    'Toilets': '🚻',
    'WiFi': '📶',
    'Electricity': '⚡',
    'Showers': '🚿',
    'Camp Store': '🏪',
    'Hiking': '🥾',
    'Water Activities': '🏄',
    'Biking Trails': '🚴',
    'Fishing': '🎣',
    'Tent Camping': '⛺',
    'RV Sites': '🚐',
    'Cabins': '🏠',
    'Glamping': '🌟',
};

const amenitiesList = [
    { group: 'Essentials', items: ['Campfire Allowed', 'Parking On Site', 'Potable Water', 'Toilets'] },
    { group: 'Features', items: ['WiFi', 'Electricity', 'Showers', 'Camp Store'] },
    { group: 'Activities', items: ['Hiking', 'Water Activities', 'Biking Trails', 'Fishing'] },
];

const campsiteTypes = ['Tent Camping', 'RV Sites', 'Cabins', 'Glamping'];

const popularDestinations = [
    'Yellowstone National Park',
    'Grand Canyon National Park',
    'Yosemite National Park',
];

export default function SearchFiltersModal({ open, onOpenChange, onApply, initialFilters, initialSection }: any) {
    // Filter state
    const [location, setLocation] = useState(initialFilters?.location || '');
    const [dates, setDates] = useState(initialFilters?.dates || { from: '', to: '' });
    const [guests, setGuests] = useState(initialFilters?.guests || 1);
    const [price, setPrice] = useState(initialFilters?.price || { min: 50, max: 175 });
    const [amenities, setAmenities] = useState<string[]>(initialFilters?.amenities || []);
    const [type, setType] = useState<string[]>(initialFilters?.type || []);
    const [bookingOptions, setBookingOptions] = useState(initialFilters?.bookingOptions || { instantBook: false, freeCancellation: false });
    const [rating, setRating] = useState(initialFilters?.rating || 0);

    // UI state for which section is open (for mobile drawer style)
    const [section, setSection] = useState<'main' | 'location' | 'dates' | 'guests' | 'price' | 'amenities' | 'type' | 'bookingOptions' | 'rating' | 'all'>(initialSection || 'main');
    // Open to the correct section when initialSection changes
    useEffect(() => {
        if (open && initialSection) setSection(initialSection.toLowerCase());
    }, [open, initialSection]);

    // Handlers
    const handleAmenityToggle = (item: string) => {
        setAmenities(a => a.includes(item) ? a.filter(x => x !== item) : [...a, item]);
    };
    const handleTypeToggle = (item: string) => {
        setType(t => t.includes(item) ? t.filter(x => x !== item) : [...t, item]);
    };
    const handleBookingOptionToggle = (key: string) => {
        setBookingOptions((opts: any) => ({ ...opts, [key]: !opts[key] }));
    };
    const handleReset = () => {
        setLocation('');
        setDates({ from: '', to: '' });
        setGuests(1);
        setPrice({ min: 50, max: 175 });
        setAmenities([]);
        setType([]);
        setBookingOptions({ instantBook: false, freeCancellation: false });
        setRating(0);
    };
    const handleApply = () => {
        onApply({ location, dates, guests, price, amenities, type, bookingOptions, rating });
        onOpenChange(false);
    };

    // Main filter modal UI
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className="p-4 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-lg font-bold mb-4">Filters</h2>
                    {/* Location */}
                    <div className="mb-4">
                        <Button variant="outline" className="w-full justify-between" onClick={() => setSection('location')}>
                            <span>Location</span>
                            <span className="text-muted-foreground">{location || 'Any'}</span>
                        </Button>
                    </div>
                    {/* Dates */}
                    <div className="mb-4">
                        <Button variant="outline" className="w-full justify-between" onClick={() => setSection('dates')}>
                            <span>Dates</span>
                            <span className="text-muted-foreground">{dates.from && dates.to ? `${dates.from} - ${dates.to}` : 'Any'}</span>
                        </Button>
                    </div>
                    {/* Guests */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Guests</label>
                        <Input type="number" min={1} value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-24" />
                    </div>
                    {/* Price Range */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Price Range</label>
                        <div className="flex items-center gap-2">
                            <Input type="number" min={0} value={price.min} onChange={e => setPrice(p => ({ ...p, min: Number(e.target.value) }))} className="w-20" />
                            <span>-</span>
                            <Input type="number" min={0} value={price.max} onChange={e => setPrice(p => ({ ...p, max: Number(e.target.value) }))} className="w-20" />
                        </div>
                    </div>
                    {/* Amenities */}
                    <div className="mb-4">
                        <Button variant="outline" className="w-full justify-between" onClick={() => setSection('amenities')}>
                            <span>Amenities</span>
                            <span className="text-muted-foreground">{amenities.length ? `${amenities.length} selected` : 'Any'}</span>
                        </Button>
                    </div>
                    {/* Campsite Type */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Campsite Type</label>
                        <div className="flex flex-wrap gap-2">
                            {campsiteTypes.map(t => (
                                <Button key={t} variant={type.includes(t) ? 'default' : 'outline'} onClick={() => handleTypeToggle(t)}>
                                    <span className="mr-1">{icons[t]}</span> {t}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {/* Booking Options */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Booking Options</label>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Switch checked={bookingOptions.instantBook} onCheckedChange={() => handleBookingOptionToggle('instantBook')} />
                                <span>Instant Book</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={bookingOptions.freeCancellation} onCheckedChange={() => handleBookingOptionToggle('freeCancellation')} />
                                <span>Free Cancellation</span>
                            </div>
                        </div>
                    </div>
                    {/* Ratings */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Ratings</label>
                        <div className="flex gap-2">
                            {[5, 4, 3].map(star => (
                                <Button key={star} variant={rating === star ? 'default' : 'outline'} onClick={() => setRating(star)}>
                                    {'★'.repeat(star)}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {/* Reset/Apply */}
                    <div className="flex gap-2 mt-6">
                        <Button variant="outline" className="flex-1" onClick={handleReset}>Reset</Button>
                        <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={handleApply}>Apply Filters</Button>
                    </div>
                </div>
                {/* Section overlays for location, dates, amenities */}
                {section === 'location' && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Location</h3>
                            <Button variant="ghost" onClick={() => setSection('main')}>✕</Button>
                        </div>
                        <Input placeholder="Search for a location" value={location} onChange={e => setLocation(e.target.value)} className="mb-4" />
                        <div className="mb-2">
                            <div className="font-medium mb-1">Current Location</div>
                            <Button variant="outline" className="w-full mb-2">Use current location <span className="ml-2 text-muted-foreground">Portland, Oregon</span></Button>
                        </div>
                        <div className="mb-2">
                            <div className="font-medium mb-1">Recent Locations</div>
                            <Button variant="ghost" className="w-full justify-start mb-1">Rocky Mountain National Park, CO</Button>
                            <Button variant="ghost" className="w-full justify-start mb-1">Redwood National Park, CA</Button>
                            <Button variant="ghost" className="w-full justify-start mb-1">Oregon Coast</Button>
                        </div>
                        <div className="mb-2">
                            <div className="font-medium mb-1">Popular Destinations</div>
                            {popularDestinations.map(dest => (
                                <Button key={dest} variant="outline" className="w-full mb-1">{dest}</Button>
                            ))}
                        </div>
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" onClick={() => { onApply({ location }); onOpenChange(false); }}>Apply Location Filter</Button>
                    </div>
                )}
                {section === 'dates' && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Select Dates</h3>
                            <Button variant="ghost" onClick={() => setSection('main')}>✕</Button>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <div>
                                <label className="block text-xs mb-1">Check-in</label>
                                <Input type="date" value={dates.from} onChange={e => setDates(d => ({ ...d, from: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-xs mb-1">Check-out</label>
                                <Input type="date" value={dates.to} onChange={e => setDates(d => ({ ...d, to: e.target.value }))} />
                            </div>
                        </div>
                        {/* Quick selections and length of stay can be added here */}
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" onClick={() => { onApply({ dates }); onOpenChange(false); }}>Apply Dates Filter</Button>
                    </div>
                )}
                {section === 'amenities' && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Amenities</h3>
                            <Button variant="ghost" onClick={() => setSection('main')}>✕</Button>
                        </div>
                        {amenitiesList.map(group => (
                            <div key={group.group} className="mb-3">
                                <div className="font-medium mb-1">{group.group}</div>
                                {group.items.map(item => (
                                    <div key={item} className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{icons[item]}</span>
                                        <span className="flex-1">{item}</span>
                                        <Switch checked={amenities.includes(item)} onCheckedChange={() => handleAmenityToggle(item)} />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" onClick={() => { onApply({ amenities }); onOpenChange(false); }}>Apply Amenities Filter</Button>
                    </div>
                )}
                {section === 'guests' && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Guests</h3>
                            <Button variant="ghost" onClick={() => setSection('main')}>✕</Button>
                        </div>
                        <Input type="number" min={1} value={guests} onChange={e => setGuests(Number(e.target.value))} className="mb-4 w-24" />
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" onClick={() => { onApply({ guests }); onOpenChange(false); }}>Apply Guests Filter</Button>
                    </div>
                )}
                {section === 'price' && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Price Range</h3>
                            <Button variant="ghost" onClick={() => setSection('main')}>✕</Button>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <Input type="number" min={0} value={price.min} onChange={e => setPrice(p => ({ ...p, min: Number(e.target.value) }))} className="w-20" />
                            <span>-</span>
                            <Input type="number" min={0} value={price.max} onChange={e => setPrice(p => ({ ...p, max: Number(e.target.value) }))} className="w-20" />
                        </div>
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" onClick={() => { onApply({ price }); onOpenChange(false); }}>Apply Price Filter</Button>
                    </div>
                )}
                {section === 'type' && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Campsite Type</h3>
                            <Button variant="ghost" onClick={() => setSection('main')}>✕</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {campsiteTypes.map(t => (
                                <Button key={t} variant={type.includes(t) ? 'default' : 'outline'} onClick={() => handleTypeToggle(t)}>
                                    <span className="mr-1">{icons[t]}</span> {t}
                                </Button>
                            ))}
                        </div>
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" onClick={() => { onApply({ type }); onOpenChange(false); }}>Apply Type Filter</Button>
                    </div>
                )}
                {section === 'bookingOptions' && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Booking Options</h3>
                            <Button variant="ghost" onClick={() => setSection('main')}>✕</Button>
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                            <div className="flex items-center gap-2">
                                <Switch checked={bookingOptions.instantBook} onCheckedChange={() => handleBookingOptionToggle('instantBook')} />
                                <span>Instant Book</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={bookingOptions.freeCancellation} onCheckedChange={() => handleBookingOptionToggle('freeCancellation')} />
                                <span>Free Cancellation</span>
                            </div>
                        </div>
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" onClick={() => { onApply({ bookingOptions }); onOpenChange(false); }}>Apply Booking Options Filter</Button>
                    </div>
                )}
                {section === 'rating' && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Ratings</h3>
                            <Button variant="ghost" onClick={() => setSection('main')}>✕</Button>
                        </div>
                        <div className="flex gap-2 mb-4">
                            {[5, 4, 3].map(star => (
                                <Button key={star} variant={rating === star ? 'default' : 'outline'} onClick={() => setRating(star)}>
                                    {'★'.repeat(star)}
                                </Button>
                            ))}
                        </div>
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" onClick={() => { onApply({ rating }); onOpenChange(false); }}>Apply Rating Filter</Button>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
} 