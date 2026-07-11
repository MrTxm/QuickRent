// import React, { useState } from "react";
// import axios from "axios";


// const AuthModal = () => {
//   const [isSignup, setIsSignup] = useState(false);
//   const [loginData, setLoginData] = useState({
//   email: "",
//   password: "",
// });

// const handleLogin = async (e) => {
//   e.preventDefault();

//   try {
//     const response = await axios.post(
//       `${API_URL}/api/auth/login`,
//       loginData
//     );

//     alert(response.data.message);

//     // Save logged in user
//     localStorage.setItem("userEmail", response.data.user.email);
//     localStorage.setItem("isLoggedIn", "true");

//     // Close login modal or redirect
//     window.location.reload();

//   } catch (error) {
//     alert(error.response?.data?.message || "Login failed");
//   }
// };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-[90%] max-w-5xl flex">
        
//         {/* Left Side */}
//         <div className="w-1/2 bg-blue-600 text-white p-10 flex flex-col justify-center items-center">
//           <img
//             src="/logo.png"
//             alt="Logo"
//             className="w-28 h-28 object-contain mb-6"
//           />

//           <h1 className="text-4xl font-bold mb-4">
//             QuickRent
//           </h1>

//           <p className="text-center text-lg">
//             Welcome to QuickRent.
//             Rent anything you need with ease and convenience.
//           </p>
//         </div>

//         {/* Right Side */}
//         <div className="w-1/2 p-10">
//           {!isSignup ? (
//             <>
//               <h2 className="text-3xl font-bold mb-8">
//                 Login
//               </h2>

//               <form onSubmit={handleLogin} className="space-y-5">
//                 <input
//                 type="email"
//                 placeholder="Gmail Address"
//                 value={loginData.email}
//                 onChange={(e) =>
//                   setLoginData({
//                     ...loginData,
//                     email: e.target.value,
//                   })
//                 }
//                 className="w-full border rounded-lg p-3"
//               />

//                 <input
//                   type="password"
//                   placeholder="Password"
//                   value={loginData.password}
//                   onChange={(e) =>
//                     setLoginData({
//                       ...loginData,
//                       password: e.target.value,
//                     })
//                   }
//                   className="w-full border rounded-lg p-3"
//                 />

//                 <button
//                   type="submit"
//                   className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Login
//                 </button>
//               </form>

//               <p className="text-center mt-6">
//                 Don't have an account?{" "}
//                 <button
//                   onClick={() => setIsSignup(true)}
//                   className="text-blue-600 font-semibold"
//                 >
//                   Sign Up
//                 </button>
//               </p>
//             </>
//           ) : (
//             <>
//               <h2 className="text-3xl font-bold mb-8">
//                 Sign Up
//               </h2>

//               <form className="space-y-4">
//                 <input
//                   type="text"
//                   placeholder="Full Name"
//                   className="w-full border rounded-lg p-3"
//                 />

//                 <input
//                   type="email"
//                   placeholder="Gmail Address"
//                   className="w-full border rounded-lg p-3"
//                 />

//                 <input
//                   type="tel"
//                   placeholder="Contact Number"
//                   className="w-full border rounded-lg p-3"
//                 />

//                 <input
//                   type="text"
//                   placeholder="NIC Number"
//                   className="w-full border rounded-lg p-3"
//                 />

//                 <input
//                   type="password"
//                   placeholder="Password"
//                   className="w-full border rounded-lg p-3"
//                 />

//                 <input
//                   type="password"
//                   placeholder="Confirm Password"
//                   className="w-full border rounded-lg p-3"
//                 />

//                 <button
//                   type="submit"
//                   className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
//                 >
//                   Create Account
//                 </button>
//               </form>

//               <p className="text-center mt-6">
//                 Already have an account?{" "}
//                 <button
//                   onClick={() => setIsSignup(false)}
//                   className="text-blue-600 font-semibold"
//                 >
//                   Login
//                 </button>
//               </p>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthModal;