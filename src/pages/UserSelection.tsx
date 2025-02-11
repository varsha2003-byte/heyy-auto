import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Truck } from 'lucide-react';

export default function UserSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">I am a...</h2>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/passenger')}
            className="w-full flex items-center justify-center space-x-4 bg-yellow-400 
                     hover:bg-yellow-500 text-yellow-900 p-6 rounded-lg transform 
                     hover:scale-105 transition-all duration-300"
          >
            <UserCircle className="w-8 h-8" />
            <span className="text-xl font-semibold">Passenger</span>
          </button>

          <button
            onClick={() => navigate('/driver/register')}
            className="w-full flex items-center justify-center space-x-4 bg-yellow-100 
                     hover:bg-yellow-200 text-yellow-900 p-6 rounded-lg transform 
                     hover:scale-105 transition-all duration-300"
          >
            <Truck className="w-8 h-8" />
            <span className="text-xl font-semibold">Driver</span>
          </button>
        </div>
      </div>
    </div>
  );
}