import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

export default function MapPicker({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number) => void }) {
    const position = [lat, lng];
    function LocationMarker() {
        useMapEvents({
            click(e) {
                onChange(e.latlng.lat, e.latlng.lng);
            },
        });
        return <Marker position={position as [number, number]} />;
    }
    return (
        <MapContainer center={position} zoom={13} style={{ height: '250px', width: '100%', borderRadius: '12px', margin: '8px 0' }} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
        </MapContainer>
    );
} 