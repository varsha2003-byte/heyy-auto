import React, { useState } from 'react';
import { Bell, User, MapPin, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

export default function DriverDashboard() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAtStand, setIsAtStand] = useState(false);

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
              <h2 className="font-semibold text-lg">John Doe</h2>
              <p className="text-gray-600">KA-01-AB-1234</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-yellow-600" />
                <span>At Auto Stand</span>
              </div>
              <button
                onClick={() => setIsAtStand(!isAtStand)}
                className={`p-2 rounded-full ${
                  isAtStand ? 'bg-green-500' : 'bg-gray-300'
                } transition-colors duration-300`}
              >
                {isAtStand ? (
                  <ToggleRight className="w-6 h-6 text-white" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span>Available for Rides</span>
              </div>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`p-2 rounded-full ${
                  isAvailable ? 'bg-green-500' : 'bg-gray-300'
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Rides</h2>
          <div className="space-y-4">
            {/* Placeholder for ride history */}
            <div className="border-b pb-4">
              <p className="font-medium">City Center → Airport</p>
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹250</span>
                <span>2:30 PM</span>
              </div>
            </div>
            <div className="border-b pb-4">
              <p className="font-medium">Mall → Railway Station</p>
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹150</span>
                <span>11:15 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}