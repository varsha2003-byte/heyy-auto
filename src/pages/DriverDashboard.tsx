import React, { useState, useEffect } from "react";
import { Bell, User, MapPin, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "../supabaseClient";
import { joinQueue, leaveQueue, fetchQueuePosition } from "../queueSystem";

export default function DriverDashboard() {
  const [driver, setDriver] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAtStand, setIsAtStand] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const driverLicense = localStorage.getItem("driverLicense");
    if (driverLicense) fetchDriver(driverLicense);
    else setLoading(false);
  }, []);

  const fetchDriver = async (driverLicense) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("license_number", driverLicense)
      .single();

    if (error) console.error("Error fetching driver:", error.message);
    else if (data) {
      setDriver(data);
      setIsAvailable(data.is_available);
      setIsAtStand(data.is_at_stand);
      if (data.is_at_stand) {
        const position = await fetchQueuePosition(data.id, data.auto_stand_id);
        setQueuePosition(position);
      }
    }
    setLoading(false);
  };

  const updateStatus = async (field, value) => {
    if (!driver) return false;
    const { error } = await supabase
      .from("drivers")
      .update({ [field]: value })
      .eq("id", driver.id);
    return !error;
  };

  const handleStandToggle = async () => {
    if (!driver || !driver.id || !driver.auto_stand_id) return;
    const newStatus = !isAtStand;

    if (newStatus) {
      try {
        const result = await joinQueue(driver.id, driver.auto_stand_id);
        if (!result.error) setQueuePosition(result.position);
        await updateStatus("is_at_stand", true);
      } catch (error) {
        console.error("Error joining queue:", error.message);
      }
    } else {
      await leaveQueue(driver.id, driver.auto_stand_id);
      await updateStatus("is_at_stand", false);
      setQueuePosition(null);
    }

    setIsAtStand(newStatus);
  };

  const handleAvailabilityToggle = async () => {
    const newAvailability = !isAvailable;
    if (await updateStatus("is_available", newAvailability)) {
      setIsAvailable(newAvailability);
    }
  };

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (!driver) return <p className="text-center p-4">No driver found. Please log in again.</p>;

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

          {isAtStand && queuePosition !== null && (
            <div className="p-4 mb-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-yellow-800 font-medium">Queue Position:</span>
                <span className="text-yellow-800 font-bold">{queuePosition}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-yellow-600" />
              <span>At Auto Stand</span>
            </div>
            <button
              onClick={handleStandToggle}
              className={`p-2 rounded-full transition-colors duration-300 ${isAtStand ? "bg-green-500" : "bg-gray-300"}`}
            >
              {isAtStand ? <ToggleRight className="w-6 h-6 text-white" /> : <ToggleLeft className="w-6 h-6 text-white" />}
            </button>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span>Available for Rides</span>
            </div>
            <button
              onClick={handleAvailabilityToggle}
              className={`p-2 rounded-full transition-colors duration-300 ${isAvailable ? "bg-green-500" : "bg-gray-300"}`}
            >
              {isAvailable ? <ToggleRight className="w-6 h-6 text-white" /> : <ToggleLeft className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
