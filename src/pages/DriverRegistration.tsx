import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, User, MapPin, FileText, Car } from 'lucide-react';

export default function DriverRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    autoStand: '',
    licenseNumber: '',
    vehicleNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    navigate('/driver/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Truck className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Driver Registration</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-yellow-600 w-5 h-5" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-yellow-600 w-5 h-5" />
              <input
                type="text"
                name="autoStand"
                placeholder="Auto Stand Location"
                value={formData.autoStand}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <FileText className="absolute left-3 top-3 text-yellow-600 w-5 h-5" />
              <input
                type="text"
                name="licenseNumber"
                placeholder="License Number"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Car className="absolute left-3 top-3 text-yellow-600 w-5 h-5" />
              <input
                type="text"
                name="vehicleNumber"
                placeholder="Vehicle Number"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg 
                     font-semibold transition-colors duration-300"
          >
            Register as Driver
          </button>
        </form>
      </div>
    </div>
  );
}