import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Truck, User, MapPin, FileText, Car, Lock } from "lucide-react";

const DriverRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    autoStand: "",
    licenseNumber: "",
    vehicleNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data: autoStand, error: autoStandError } = await supabase
        .from("autostands")
        .select("*")
        .eq("location", formData.autoStand)
        .single();

      let autoStandId = autoStand?.id;

      if (!autoStand) {
        const { data: newStand, error: insertError } = await supabase
          .from("autostands")
          .insert([{ location: formData.autoStand }])
          .select()
          .single();

        if (insertError) throw insertError;
        autoStandId = newStand.id;
      }

      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .insert([
          {
            name: formData.name,
            auto_stand_id: autoStandId,
            license_number: formData.licenseNumber,
            vehicle_number: formData.vehicleNumber,
            password: formData.password, // ✅ Add password to database
            is_available: false,
            is_at_stand: false,
            ride_history: [],
          },
        ])
        .select()
        .single();

      if (driverError) throw driverError;

      // ✅ Store license number in localStorage for identification
      localStorage.setItem("driverLicense", formData.licenseNumber);

      alert("Driver registered successfully!");
      navigate("/driver/dashboard");
    } catch (error) {
      console.error("Error registering driver: ", error);
      alert("Registration failed. Please try again.");
    }
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
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-yellow-600 w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors duration-300"
          >
            Register as Driver
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-700">
            Already registered?{' '}
            <button
              onClick={() => navigate("/driver/login")}
              className="text-yellow-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistration;
