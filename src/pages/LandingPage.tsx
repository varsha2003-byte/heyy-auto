import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-200 p-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Car className="w-16 h-16 text-yellow-700" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-yellow-900">
          Hey Auto
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-yellow-800">
          Your ride, your way
        </p>
        <button
          onClick={() => navigate('/select-user')}
          className="bg-yellow-900 text-white px-8 py-4 rounded-full text-xl font-semibold 
                   hover:bg-yellow-800 transform hover:scale-105 transition-all duration-300
                   shadow-lg hover:shadow-xl"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}