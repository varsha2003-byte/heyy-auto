import React, { useState, useEffect } from "react";
import { Bell, User, MapPin, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function DriverDashboard() {
  const [driver, setDriver] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAtStand, setIsAtStand] = useState(false);

  const driverLicense = localStorage.getItem("driverLicense");

  // Fetch driver data from Supabase
  useEffect(() => {
    const fetchDriver = async () => {
      if (!driverLicense) return;

      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("license_number", driverLicense)
        .single();

      if (error) console.error("Error fetching driver:", error.message);
      else {
        setDriver(data);
        setIsAvailable(data.is_available);
        setIsAtStand(data.is_at_stand);
      }
    };

    fetchDriver();
  }, [driverLicense]);

  // Update driver status in Supabase
  const updateStatus = async (field, value, location = null) => {
    if (!driver) return;

    // Build update payload
    const updateData = { [field]: value };

    if (field === "is_at_stand" && value && location) {
      updateData.latitude = location.latitude;
      updateData.longitude = location.longitude;
    }

    const { error } = await supabase
      .from("drivers")
      .update(updateData)
      .eq("license_number", driver.license_number);

    if (error) {
      console.error(`Error updating ${field}:`, error.message);
    } else {
      console.log(`Successfully updated ${field} to:`, value);
    }
  };

  // Get driver's current location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation not supported"));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        (error) => reject(error)
      );
    });
  };

  // Handle "At Auto Stand" toggle
  const handleStandToggle = async () => {
    try {
      const newStatus = !isAtStand;
      setIsAtStand(newStatus);

      if (newStatus) {
        // Get driver's current location
        const location = await getLocation();
        console.log("Driver is at stand - Location:", location);

        // Update driver's `is_at_stand` status and location
        await updateStatus("is_at_stand", true, location);

        // Fetch the driver's auto stand ID
        const { data: autoStand, error: autoStandError } = await supabase
          .from("autostands")
          .select("*")
          .eq("id", driver.auto_stand_id)
          .single();

        if (autoStandError) {
          console.error("Error fetching auto stand:", autoStandError.message);
          return;
        }

        // Update the auto stand's latitude & longitude with driver's location
        const { error: updateStandError } = await supabase
          .from("autostands")
          .update({
            latitude: location.latitude,
            longitude: location.longitude
          })
          .eq("id", driver.auto_stand_id);

        if (updateStandError) {
          console.error("Error updating auto stand location:", updateStandError.message);
        } else {
          console.log("Auto stand location updated successfully!");
        }
      } else {
        // If driver leaves the stand, just update their `is_at_stand` status
        await updateStatus("is_at_stand", false);
      }
    } catch (error) {
      console.error("Error handling stand toggle:", error.message);
    }
  };

  if (!driver) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
          <Bell className="w-6 h-6 text-gray-600" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-yellow-100 p-3 rounded-full">
              <User className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{driver.name}</h2>
              <p className="text-gray-600">{driver.vehicle_number}</p>
            </div>
          </div>

          {/* At Auto Stand Toggle */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-yellow-600" />
              <span>At Auto Stand</span>
            </div>
            <button
              onClick={handleStandToggle}
              className={`p-2 rounded-full ${
                isAtStand ? "bg-green-500" : "bg-gray-300"
              } transition-colors duration-300`}
            >
              {isAtStand ? (
                <ToggleRight className="w-6 h-6 text-white" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Available for Rides Toggle */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span>Available for Rides</span>
            </div>
            <button
              onClick={() => {
                const newAvailability = !isAvailable;
                setIsAvailable(newAvailability);
                updateStatus("is_available", newAvailability);
              }}
              className={`p-2 rounded-full ${
                isAvailable ? "bg-green-500" : "bg-gray-300"
              } transition-colors duration-300`}
            >
              {isAvailable ? (
                <ToggleRight className="w-6 h-6 text-white" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
