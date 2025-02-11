import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UserSelection from './pages/UserSelection';
import PassengerModule from './pages/PassengerModule';
import DriverRegistration from './pages/DriverRegistration';
import DriverDashboard from './pages/DriverDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-user" element={<UserSelection />} />
          <Route path="/passenger/*" element={<PassengerModule />} />
          <Route path="/driver/register" element={<DriverRegistration />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;