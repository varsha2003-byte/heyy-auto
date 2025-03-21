import React, { useEffect, useState } from 'react';
import { supabase } from "../supabaseClient";
import { TicketSlash as AutoRickshaw, ArrowLeft } from 'lucide-react';

interface AutoStand {
  id: string;
  name: string;
  address?: string;
  available_autos: number;
  distance: number;
  location?: string; // Location attribute from autostands table
}

interface NearbyStandsProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  onBack: () => void;
  fareEstimate: number; // Keep the original prop
  pickupAddress: string;
  destinationAddress: string;
}

// Unified fare calculation function to be used throughout the app
const calculateFare = (distance: number) => {
  // Base fare of 30 rupees + 10 rupees per kilometer (rounded)
  // Ensure the distance is a valid number
  if (isNaN(distance) || distance === undefined) {
    return 50; // Default minimum fare
  }
  return Math.max(50, 30 + (Math.round(distance) * 10));
};

export default function NearbyStands({
  userLocation,
  onBack,
  fareEstimate, // Keep the original prop
  pickupAddress,
  destinationAddress,
}: NearbyStandsProps) {
  const [stands, setStands] = useState<AutoStand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStand, setSelectedStand] = useState<AutoStand | null>(null);
  const [radius] = useState(5); // Adjustable search radius (in km)

  useEffect(() => {
    const fetchNearbyStands = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_nearby_stands', {
          user_lat: userLocation.latitude,
          user_lng: userLocation.longitude,
          radius_km: radius,
        });

        if (error) throw error;
        setStands(data || []);
      } catch (error) {
        console.error('Error fetching nearby stands:', error);
        setStands([]);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation.latitude && userLocation.longitude) {
      fetchNearbyStands();
    }
  }, [userLocation, radius]);

  const handleSelectStand = (stand: AutoStand) => {
    setSelectedStand(stand);
  };

  const confirmBooking = () => {
    if (selectedStand) {
      alert(`Auto booked from ${selectedStand.name} (${selectedStand.id})`);
      setSelectedStand(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-3 p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold">Choose a ride</h1>
        </div>

        {/* Trip details */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm truncate">{pickupAddress}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-sm truncate">{destinationAddress}</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-right text-orange-600 font-semibold">
            Estimated fare: ₹{fareEstimate || 50}
          </div>
        </div>

        {/* Auto Stands List */}
        {stands.length > 0 ? (
          <div className="space-y-4">
            {stands.map((stand) => (
              <div
                key={stand.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => handleSelectStand(stand)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AutoRickshaw className="h-8 w-8 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{stand.name}</h3>
                      {stand.location && (
                        <p className="text-sm font-semibold text-gray-800">{stand.location}</p>
                      )}
                      <p className="text-sm text-gray-500">{stand.address}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <span>{Math.round(stand.distance * 10) / 10} km away</span>
                        <span className="mx-2">•</span>
                        <span>{stand.available_autos} autos available</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-orange-500">
                    ₹{fareEstimate || 50}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No nearby auto stands found.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Booking Confirmation Modal */}
        {selectedStand && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Confirm Booking</h2>
              <p className="mt-2">Do you want to book an auto from <strong>{selectedStand.name}</strong>?</p>
              {selectedStand.location && (
                <p className="mt-1 font-semibold text-gray-800">{selectedStand.location}</p>
              )}
              <p className="mt-1 text-orange-600 font-semibold">Fare: ₹{fareEstimate || 50}</p>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedStand(null)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}