import { useState, useCallback, useRef, useEffect } from "react";
import { Input, Card } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

interface AddressPickerProps {
  value?: string;
  onChange?: (address: string) => void;
  onLocationChange?: (location: { address: string; lat: number; lng: number } | null) => void;
  placeholder?: string;
}

const defaultCenter: [number, number] = [24.7136, 46.6753]; // Riyadh, Saudi Arabia

// Lazy load Leaflet components
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let useMapEvents: any = null;
let L: any = null;

// Component to handle map clicks
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  if (!useMapEvents) return null;
  
  useMapEvents({
    click: (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function AddressPicker({
  value,
  onChange,
  onLocationChange,
  placeholder = "ابحث عن العنوان أو انقر على الخريطة",
}: AddressPickerProps) {
  const [address, setAddress] = useState(value || "");
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load Leaflet only when map is needed
  useEffect(() => {
    if (isMounted && isMapVisible && !mapLoaded) {
      import("react-leaflet").then((leaflet) => {
        MapContainer = leaflet.MapContainer;
        TileLayer = leaflet.TileLayer;
        Marker = leaflet.Marker;
        useMapEvents = leaflet.useMapEvents;
        
        import("leaflet").then((leafletCore) => {
          L = leafletCore.default;
          
          // Fix for default marker icon
          if (L && typeof window !== "undefined") {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            });
          }
          
          setMapLoaded(true);
        }).catch((err) => {
          console.error("Failed to load Leaflet:", err);
        });
      }).catch((err) => {
        console.error("Failed to load react-leaflet:", err);
      });
    }
  }, [isMounted, isMapVisible, mapLoaded]);

  // Geocode coordinates to address using Nominatim (OpenStreetMap)
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar,en`
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          const addressText = data.display_name;
          setAddress(addressText);
          onChange?.(addressText);
          onLocationChange?.({ address: addressText, lat, lng });
        } else {
          // Fallback to coordinates
          const addressText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setAddress(addressText);
          onChange?.(addressText);
          onLocationChange?.({ address: addressText, lat, lng });
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        // Fallback to coordinates
        const addressText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(addressText);
        onChange?.(addressText);
      } finally {
        setIsSearching(false);
      }
    },
    [onChange]
  );

  // Search for address using Nominatim
  const searchAddress = useCallback(
    async (query: string) => {
      if (!query || query.length < 3) return;

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSearching(true);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=sa&accept-language=ar,en`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            const firstResult = data[0];
            const lat = parseFloat(firstResult.lat);
            const lng = parseFloat(firstResult.lon);
            const addressText = firstResult.display_name;

            setAddress(addressText);
            setSelectedLocation([lat, lng]);
            setMapCenter([lat, lng]);
            setIsMapVisible(true);
            onChange?.(addressText);
            onLocationChange?.({ address: addressText, lat, lng });
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    },
    [onChange]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setSelectedLocation([lat, lng]);
      setMapCenter([lat, lng]);
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAddress(newValue);
    onChange?.(newValue);
    
    // Clear location if address is cleared
    if (!newValue) {
      setSelectedLocation(null);
      onLocationChange?.(null);
    }
    
    // Trigger search if user is typing
    if (newValue.length >= 3) {
      searchAddress(newValue);
    }
  };

  const handleInputFocus = () => {
    if (isMounted) {
      setIsMapVisible(true);
    }
  };

  useEffect(() => {
    if (value !== undefined && value !== address) {
      setAddress(value);
    }
  }, [value, address]);

  return (
    <div>
      <Input
        size="large"
        className="rounded-lg"
        placeholder={placeholder}
        value={address}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        prefix={<EnvironmentOutlined />}
        suffix={isSearching ? <span className="text-xs text-gray-400">جاري البحث...</span> : null}
      />
      
      {isMounted && isMapVisible && mapLoaded && MapContainer && TileLayer && (
        <Card className="mt-3 rounded-lg" bodyStyle={{ padding: 0 }}>
          <MapContainer
            center={mapCenter}
            zoom={selectedLocation ? 15 : 10}
            style={{ height: "300px", width: "100%", borderRadius: "8px" }}
            scrollWheelZoom={true}
            key={selectedLocation ? `${selectedLocation[0]}-${selectedLocation[1]}` : "map"}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {selectedLocation && Marker && (
              <Marker
                position={selectedLocation}
                draggable={true}
                eventHandlers={{
                  dragend: (e: any) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    handleMapClick(position.lat, position.lng);
                  },
                }}
              />
            )}
          </MapContainer>
        </Card>
      )}
      
      {isMounted && isMapVisible && !mapLoaded && (
        <div className="mt-3 p-4 bg-gray-100 rounded-lg text-center text-gray-500">
          جاري تحميل الخريطة...
        </div>
      )}
    </div>
  );
}
