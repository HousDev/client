/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { Building2, UserCircle, Users, Zap } from 'lucide-react';

// export default function Login() {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { signIn, signUp } = useAuth();

//   const quickLogin = async (userEmail: string, userPassword: string) => {
//     setError('');
//     setLoading(true);
//     try {
//       await signIn(userEmail, userPassword);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       if (isSignUp) {
//         await signUp(email, password, fullName);
//       } else {
//         await signIn(email, password);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           <div className="flex items-center justify-center mb-8">
//             <div className="bg-blue-600 p-3 rounded-xl">
//               <Building2 className="w-8 h-8 text-white" />
//             </div>
//           </div>

//           <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
//             Real Estate Developer
//           </h1>
//           <p className="text-center text-gray-600 mb-8">
//             Vendor & Purchase Management System
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {isSignUp && (
//               <div>
//                 <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Name
//                 </label>
//                 <input
//                   id="fullName"
//                   type="text"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </div>
//             )}

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 placeholder="Enter your password"
//                 required
//               />
//             </div>

//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
//                 {error}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <button
//               type="button"
//               onClick={() => {
//                 setIsSignUp(!isSignUp);
//                 setError('');
//               }}
//               className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
//             >
//               {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
//             </button>
//           </div>

//           {!isSignUp && (
//             <div className="mt-6">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-300"></div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-2 bg-white text-gray-500">Quick Login</span>
//                 </div>
//               </div>

//               <div className="mt-6 grid grid-cols-1 gap-3">
//                 <button
//                   type="button"
//                   onClick={() => quickLogin('admin@test.com', 'Test123456')}
//                   disabled={loading}
//                   className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                 >
//                   <UserCircle className="w-5 h-5 text-blue-600" />
//                   <span>Login as Admin</span>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => quickLogin('manager@test.com', 'Test123456')}
//                   disabled={loading}
//                   className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                 >
//                   <Users className="w-5 h-5 text-green-600" />
//                   <span>Login as Manager</span>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => quickLogin('demo@test.com', 'Demo123456')}
//                   disabled={loading}
//                   className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                 >
//                   <Zap className="w-5 h-5 text-orange-600" />
//                   <span>Quick Demo Login</span>
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         <p className="text-center text-white text-sm mt-6 opacity-80">
//           Manage vendors, purchase orders, payments, and services in one place
//         </p>
//       </div>
//     </div>
//   );
// }



// // src/components/Login.tsx
// import { useState } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import Logo from "../assets/images/Nayash Logo.png";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { signIn } = useAuth(); // only signIn now

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setError("");
//   //   setLoading(true);

//   //   try {
//   //     await signIn(email, password);
//   //   } catch (err: any) {
//   //     console.log(err);
//   //     if (err.status === 401) {
//   //       setError("Invalid Credentials.");
//   //     } else {
//   //       setError("Something went wrong.");
//   //     }
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setError("");
//   setLoading(true);

//   try {
//     await signIn(email, password);
//   } catch (err: any) {
//     console.log(err);
    
//     // Handle different error scenarios
//     if (err.response?.status === 403) {
//       // Account deactivated
//       setError(err.response?.data?.error || "Account is deactivated");
//     } else if (err.response?.status === 401) {
//       setError("Invalid email or password");
//     } else {
//       setError(err.response?.data?.error || "Something went wrong");
//     }
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div
//           className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-8 border-2 border-transparent"
//           style={{ boxShadow: "0 10px 30px rgba(2,6,23,0.45)" }}
//         >
//           {/* Logo block */}
//           <div className="flex items-center justify-center mb-4">
//             <div className="rounded-xl p-2 bg-white shadow-sm">
//               <img
//                 src={Logo}
//                 alt="Nayash Group"
//                 className="h-16 sm:h-18 md:h-20 object-contain"
//                 style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.12))" }}
//               />
//             </div>
//           </div>

//           <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
//             Vendor & Purchase Management System
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none transition placeholder:text-gray-400 text-sm sm:text-base
//                   focus:ring-2 focus:ring-red-400 focus:border-transparent"
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none transition placeholder:text-gray-400 text-sm sm:text-base
//                   focus:ring-2 focus:ring-red-400 focus:border-transparent"
//                 placeholder="Enter your password"
//                 required
//               />
//             </div>

//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm">
//                 {error}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium text-white shadow-md text-sm sm:text-base
//                 bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#e03b3b] hover:to-[#9a1414] transition-transform transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               {loading ? "Please wait..." : "Sign In"}
//             </button>
//           </form>

//           <div className="mt-4 text-center">
//             <span className="text-xs text-gray-500">Forgot password? </span>
//             <button
//               type="button"
//               className="text-xs font-medium text-[#b71c1c] hover:underline ml-1"
//               onClick={() => alert("Password reset flow")}
//             >
//               Reset
//             </button>
//           </div>
//         </div>

//         <p className="text-center text-white text-xs sm:text-sm mt-4 sm:mt-6 opacity-80 px-2">
//           Manage vendors, purchase orders, payments, and services in one place
//         </p>
//       </div>
//     </div>
//   );
// }


// // src/components/Login.tsx
// import { useState } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import Logo from "../assets/images/Nayash Logo.png";
// import { Eye, EyeOff } from "lucide-react"; // Add these icons

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false); // Add this state
//   const { signIn } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await signIn(email, password);
//     } catch (err: any) {
//       console.log("Login error:", err);
      
//       // Debug: Show actual password in console (remove in production)
//       console.log("Attempted login with:", { email, password });
      
//       // Handle different error scenarios
//       if (err.response?.status === 403) {
//         setError(err.response?.data?.error || "Account is deactivated");
//       } else if (err.response?.status === 401) {
//         setError("Invalid email or password");
//       } else if (err.response?.status === 400) {
//         setError(err.response?.data?.error || "Bad request - check your inputs");
//       } else if (err.response?.status === 404) {
//         setError("Login endpoint not found");
//       } else if (!err.response) {
//         setError("Network error - cannot connect to server");
//       } else {
//         setError(err.response?.data?.error || "Something went wrong");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Debug button to show password in alert (remove in production)
//   const showPasswordInAlert = () => {
//     alert(`Current password value: ${password}`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div
//           className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-8 border-2 border-transparent"
//           style={{ boxShadow: "0 10px 30px rgba(2,6,23,0.45)" }}
//         >
//           {/* Logo block */}
//           <div className="flex items-center justify-center mb-4">
//             <div className="rounded-xl p-2 bg-white shadow-sm">
//               <img
//                 src={Logo}
//                 alt="Nayash Group"
//                 className="h-16 sm:h-18 md:h-20 object-contain"
//                 style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.12))" }}
//               />
//             </div>
//           </div>

//           <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
//             Vendor & Purchase Management System
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none transition placeholder:text-gray-400 text-sm sm:text-base
//                   focus:ring-2 focus:ring-red-400 focus:border-transparent"
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none transition placeholder:text-gray-400 text-sm sm:text-base
//                     focus:ring-2 focus:ring-red-400 focus:border-transparent pr-10"
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
//                   tabIndex={-1} // Prevent tab focus on this button
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
//                   ) : (
//                     <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm">
//                 {error}
//                 {/* Debug info - remove in production */}
//                 <div className="mt-1 text-xs opacity-75">
//                   Trying: {email} / {password.length > 0 ? "••••" : "(empty)"}
//                 </div>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium text-white shadow-md text-sm sm:text-base
//                 bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] hover:from-[#e03b3b] hover:to-[#9a1414] transition-transform transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               {loading ? "Please wait..." : "Sign In"}
//             </button>

         
//           </form>

//           <div className="mt-4 text-center">
//             <span className="text-xs text-gray-500">Forgot password? </span>
//             <button
//               type="button"
//               className="text-xs font-medium text-[#b71c1c] hover:underline ml-1"
//               onClick={() => alert("Password reset flow")}
//             >
//               Reset
//             </button>
//           </div>


//         </div>

//         <p className="text-center text-white text-xs sm:text-sm mt-4 sm:mt-6 opacity-80 px-2">
//           Manage vendors, purchase orders, payments, and services in one place
//         </p>
//       </div>
//     </div>
//   );
// }



/*---------------------------------------------------1-2-26--------------------------------------------*/
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
    e.stopPropagation();
    
    // Prevent any default form behavior
    if (!identifier || !password) {
      toast.error("Please enter email/phone and password");
      return false;
    }
    
    setLoading(true);

    try {
      await signIn(identifier, password);
      toast.success("Login successful!");
    } catch (err: any) {
      console.log("Login error:", err);
      console.log("Error response:", err.response);
      console.log("Error message:", err.message);
      
      // Debug: Show actual password in console (remove in production)
      console.log("Attempted login with:", { identifier, password });
      
      // Handle different error scenarios with toast
      if (err.response?.status === 403) {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Account is deactivated");
      } else if (err.response?.status === 401) {
        toast.error(err.response?.data?.message || "Invalid email/phone or password");
      } else if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Bad request - check your inputs");
      } else if (err.response?.status === 404) {
        toast.error("Login endpoint not found");
      } else if (err.message && err.message.includes("Network Error")) {
        toast.error("Cannot connect to server. Please check your connection.");
      } else if (!err.response) {
        toast.error("Server is not responding. Please try again later.");
      } else {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
    
    return false;
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

            <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
              Vendor & Purchase Management System
            </p>

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

            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">Forgot password? </span>
              <button
                type="button"
                className="text-xs font-medium text-[#b71c1c] hover:underline ml-1"
                onClick={() => toast.info("Password reset feature coming soon!")}
              >
                Reset
              </button>
            </div>
          </div>

          <p className="text-center text-white text-xs sm:text-sm mt-4 sm:mt-6 opacity-80 px-2">
            Manage vendors, purchase orders, payments, and services in one place
          </p>
        </div>
      </div>
    
  );
}