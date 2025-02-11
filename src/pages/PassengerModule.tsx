import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, DollarSign } from "lucide-react";
import L from "leaflet";
import axios from "axios";

const center = [9.9312, 76.2673]; // Default: Kochi, Kerala

const PassengerModule = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(null);

  useEffect(() => {
    // Get the current location of the user
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupCoords([position.coords.latitude, position.coords.longitude]);
        setPickup(`${position.coords.latitude}, ${position.coords.longitude}`); // Corrected interpolation
      },
      () => console.error("Location access denied")
    );
  }, []);

  const geocodeAddress = async (address, setter) => {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: address,
          format: "json",
        },
      });
      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        setter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Geocode failed: ", error);
    }
  };

  const calculateRoute = async () => {
    if (!pickupCoords || !destinationCoords) return;
    try {
      const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson`);
      if (res.data.routes.length > 0) {
        setRoute(res.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]));
        setDistance((res.data.routes[0].distance / 1000).toFixed(2) + " km");
        setDuration((res.data.routes[0].duration / 60).toFixed(2) + " mins");
        setEstimatedFare(Math.max(30, Math.round(res.data.routes[0].distance / 1000) * 10)); // ₹10/km, min ₹30
      }
    } catch (error) {
      console.error("Route calculation failed: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Book a Ride</h1>
        
        {/* OpenStreetMap */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Check if pickupCoords is available, otherwise fallback to the default center */}
          <MapContainer center={pickupCoords || center} zoom={13} style={{ height: "300px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {pickupCoords && <Marker position={pickupCoords} icon={L.icon({ iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-green.png", iconSize: [25, 41], iconAnchor: [12, 41] })} />}
            {destinationCoords && <Marker position={destinationCoords} />}
            {route && <Polyline positions={route} color="blue" />}
          </MapContainer>
        </div>
        
        {/* Ride Booking Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* Pickup Input */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-yellow-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Pickup Location"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                geocodeAddress(e.target.value, setPickupCoords);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Destination Input */}
          <div className="relative">
            <Navigation className="absolute left-3 top-3 text-yellow-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                geocodeAddress(e.target.value, setDestinationCoords);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Estimated Distance & Fare */}
          {distance && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold">Distance: {distance} | Duration: {duration} | Estimated Fare: ₹{estimatedFare}</span>
              </div>
            </div>
          )}

          {/* Book Ride Button */}
          <button
            onClick={calculateRoute}
            disabled={!pickup || !destination}
            className="w-full py-4 rounded-lg font-semibold text-white bg-yellow-500 hover:bg-yellow-600"
          >
            Calculate Route
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerModule;
