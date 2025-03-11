import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, DollarSign } from "lucide-react";
import L from "leaflet";
import axios from "axios";

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom pickup and destination icons
const pickupIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const destinationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Component to recenter map when coordinates change
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
}

const PassengerModule = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [mapCenter, setMapCenter] = useState([9.9312, 76.2673]); // Default: Kochi, Kerala
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get the current location of the user
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentCoords = [latitude, longitude];
        setPickupCoords(currentCoords);
        setMapCenter(currentCoords);
        
        // Get address for current location
        reverseGeocode(latitude, longitude);
      },
      (error) => console.error("Location access denied: ", error)
    );
  }, []);

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: {
          lat,
          lon,
          format: "json",
        },
        headers: {
          'User-Agent': 'CabBookingApp/1.0'
        }
      });
      
      if (res.data && res.data.display_name) {
        setPickup(res.data.display_name);
      } else {
        setPickup(`${lat}, ${lon}`);
      }
    } catch (error) {
      console.error("Reverse geocode failed: ", error);
      setPickup(`${lat}, ${lon}`);
    }
  };

  const geocodeAddress = async (address, setter) => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: address,
          format: "json",
        },
        headers: {
          'User-Agent': 'CabBookingApp/1.0'
        }
      });
      
      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        const coords = [parseFloat(lat), parseFloat(lon)];
        setter(coords);
        
        // If setting destination, update map center
        if (setter === setDestinationCoords) {
          setMapCenter(coords);
        }
        
        // Clear previous route when either pickup or destination changes
        setRoute(null);
        setDistance("");
        setDuration("");
        setEstimatedFare(null);
      } else {
        console.error("Invalid address: ", address);
      }
    } catch (error) {
      console.error("Geocode failed: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!pickupCoords || !destinationCoords) return;
    
    setIsLoading(true);
    try {
      // Ensure correct longitude-latitude order for OSRM API
      const [pickupLat, pickupLon] = pickupCoords;
      const [destLat, destLon] = destinationCoords;
      
      const res = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${pickupLon},${pickupLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`
      );
      
      if (res.data.routes && res.data.routes.length > 0) {
        // OSRM returns coordinates in [longitude, latitude] format, so we need to swap for Leaflet
        const routeCoordinates = res.data.routes[0].geometry.coordinates.map(
          ([lon, lat]) => [lat, lon]
        );
        
        setRoute(routeCoordinates);
        
        // Calculate center point of route for map positioning
        if (routeCoordinates.length > 0) {
          const mid = Math.floor(routeCoordinates.length / 2);
          setMapCenter(routeCoordinates[mid]);
        }
        
        // Set distance, duration and fare
        const distanceInKm = (res.data.routes[0].distance / 1000).toFixed(2);
        const durationInMins = (res.data.routes[0].duration / 60).toFixed(2);
        
        setDistance(distanceInKm + " km");
        setDuration(durationInMins + " mins");
        
        // Fare calculation: Base fare ₹30 + ₹10/km, minimum ₹50
        const calculatedFare = Math.max(50, 30 + Math.round(distanceInKm) * 10);
        setEstimatedFare(calculatedFare);
      } else {
        console.error("No route found.");
      }
    } catch (error) {
      console.error("Route calculation failed: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Book a Ride</h1>
        
        {/* OpenStreetMap */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Recenter map when coordinates change */}
            <MapRecenter coords={mapCenter} />
            
            {/* Pickup marker with custom icon */}
            {pickupCoords && (
              <Marker 
                position={pickupCoords} 
                icon={pickupIcon}
              >
              </Marker>
            )}
            
            {/* Destination marker with custom icon */}
            {destinationCoords && (
              <Marker 
                position={destinationCoords} 
                icon={destinationIcon}
              >
              </Marker>
            )}
            
            {/* Route polyline */}
            {route && (
              <Polyline 
                positions={route} 
                color="blue" 
                weight={4} 
                opacity={0.7}
              />
            )}
          </MapContainer>
        </div>
        
        {/* Ride Booking Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* Pickup Input */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-green-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Pickup Location"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
              }}
              onBlur={(e) => geocodeAddress(e.target.value, setPickupCoords)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
          
          {/* Destination Input */}
          <div className="relative">
            <Navigation className="absolute left-3 top-3 text-red-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
              }}
              onBlur={(e) => geocodeAddress(e.target.value, setDestinationCoords)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
          
          {/* Estimated Distance & Fare */}
          {distance && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold">
                  Distance: {distance} | Duration: {duration} | Estimated Fare: ₹{estimatedFare}
                </span>
              </div>
            </div>
          )}
          
          {/* Calculate Route Button */}
          <button
            onClick={calculateRoute}
            disabled={!pickup || !destination || isLoading}
            className={`w-full py-4 rounded-lg font-semibold text-white ${
              isLoading || !pickup || !destination 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {isLoading ? "Calculating..." : "Calculate Route"}
          </button>
          
          {/* Book Ride Button - Only shown when route is calculated */}
          {route && (
            <button
              className="w-full py-4 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerModule;