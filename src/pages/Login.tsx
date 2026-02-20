import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/images/Nayash Logo.png";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // Can be email or phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent any default form behavior
    if (!identifier || !password) {
      toast.error("Please enter email/phone and password");
      return false;
    }

    setLoading(true);

    try {
      await signIn(identifier, password);
    } catch (err: any) {
      e.preventDefault();
      console.log("Login error:", err);
      console.log("Error response:", err.response);
      console.log("Error message:", err.message);

      // Debug: Show actual password in console (remove in production)
      console.log("Attempted login with:", { identifier, password });

      // Handle different error scenarios with toast
      if (err.response?.status === 403) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Account is deactivated",
        );
      } else if (err.response?.status === 401) {
        toast.error(
          err.response?.data?.message || "Invalid email/phone or password",
        );
      } else if (err.response?.status === 400) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Bad request - check your inputs",
        );
      } else if (err.response?.status === 404) {
        toast.error("Login endpoint not found");
      } else if (err.message && err.message.includes("Network Error")) {
        toast.error("Cannot connect to server. Please check your connection.");
      } else if (!err.response) {
        toast.error("Server is not responding. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Login failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-8 border-2 border-transparent"
          style={{ boxShadow: "0 10px 30px rgba(2,6,23,0.45)" }}
        >
          {/* Logo block */}
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-xl p-2 bg-white shadow-sm">
              <img
                src={Logo}
                alt="Nayash Group"
                className="h-16 sm:h-18 md:h-20 object-contain"
                style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.12))" }}
              />
            </div>
          </div>
         <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email or Phone Number
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none transition placeholder:text-gray-400 text-sm sm:text-base
                    focus:ring-2 focus:ring-red-400 focus:border-transparent"
                placeholder="Enter your email or phone"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none transition placeholder:text-gray-400 text-sm sm:text-base
                      focus:ring-2 focus:ring-red-400 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1} // Prevent tab focus on this button
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium text-white shadow-md text-sm sm:text-base
                  bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#e03b3b] hover:to-[#9a1414] transition-transform transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </form>

          {/* <div className="mt-4 text-center">
            <span className="text-xs text-gray-500">Forgot password? </span>
            <button
              type="button"
              className="text-xs font-medium text-[#b71c1c] hover:underline ml-1"
              onClick={() => toast.info("Password reset feature coming soon!")}
            >
              Reset
            </button>
          </div> */}
        </div>

      </div>
    </div>
  );
}
