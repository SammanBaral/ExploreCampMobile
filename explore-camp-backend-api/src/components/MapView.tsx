import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

export default function MapView({ lat, lng, zoom = 13, markerText = 'Campsite Location' }: { lat?: number, lng?: number, zoom?: number, markerText?: string }) {
    const position = [lat ?? 45.5231, lng ?? -122.6765]; // Default: Portland, OR
    return (
        <MapContainer center={position} zoom={zoom} style={{ height: '250px', width: '100%', borderRadius: '12px', margin: '8px 0' }} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position as [number, number]}>
                <Popup>{markerText}</Popup>
            </Marker>
        </MapContainer>
    );
} 