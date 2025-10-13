// "use client";

// import { useParams } from "next/navigation";
// import { useEffect, useState, JSX } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   WifiIcon,
//   UserGroupIcon,
//   ShoppingBagIcon,
//   TruckIcon,
//   HomeIcon,
//   MapPinIcon,
//   ClockIcon,
//   XMarkIcon,
//   StarIcon,
//   PencilSquareIcon,
//   TrashIcon,
// } from "@heroicons/react/24/solid";
// import Calendar from "@/components/Calendar";
// import PaymentForm from "@/components/PaymentForm";
// import BookingDetailsTab from "@/components/BookingDetailsTab";
// import BookingSummaryTab from "@/components/BookingSummaryTab";

// interface Location {
//   address: string;
//   lat: number;
//   lng: number;
// }

// interface Sport {
//   price: number;
//   name: string;
//   pricePerHour: number;
// }

// interface Ground {
//   closeTime: string | undefined;
//   openTime: string | undefined;
//   _id: string;
//   name: string;
//   location: Location | string;
//   sports: Sport[];
//   amenities: string[];
//   images: string[];
//   availableTime?: {
//     from: string;
//     to: string;
//   };
//   owner?: { name: string; email: string; role: string };
// }

// interface BookingDetails {
//   date: string;
//   times: string[];
// }

// const facilityIcons: Record<string, JSX.Element> = {
//   Parking: <TruckIcon className="w-5 h-5 text-green-500" />,
//   Lighting: <WifiIcon className="w-5 h-5 text-green-500" />,
//   Restrooms: <UserGroupIcon className="w-5 h-5 text-green-500" />,
//   Cafeteria: <ShoppingBagIcon className="w-5 h-5 text-green-500" />,
//   "Locker Room": <UserGroupIcon className="w-5 h-5" />,
//   "Wi-Fi": <WifiIcon className="w-5 h-5" />,
// };

// export default function UserGroundDetails() {
//   const params = useParams();
//   const id = Array.isArray(params.id) ? params.id[0] : params.id;

//   const [ground, setGround] = useState<Ground | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentImage, setCurrentImage] = useState(0);
//   const [selectedSport, setSelectedSport] = useState<string | null>(null);
//   const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
//     null
//   );
//   const [showCalendarModal, setShowCalendarModal] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [activeTab, setActiveTab] = useState<
//     "calendar" | "details" | "summary"
//   >("calendar");

//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   const userRole =
//     typeof window !== "undefined" ? localStorage.getItem("role") : "user";

//   useEffect(() => {
//     const fetchGround = async () => {
//       if (!id) return;
//       try {
//         setLoading(true);
//         const res = await fetch(`/api/grounds/${id}?token=${token}`);
//         const data = await res.json();
//         if (res.ok) setGround(data);
//         else console.error("Error:", data.error);
//       } catch (err) {
//         console.error("Fetch Ground Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGround();
//   }, [id]);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center min-h-[60vh] text-green-800">
//         Loading ground details...
//       </div>
//     );

//   if (!ground)
//     return (
//       <div className="flex justify-center items-center min-h-[60vh] text-red-600">
//         Ground not found.
//       </div>
//     );

//   const prevImage = () =>
//     setCurrentImage((prev) =>
//       ground && prev === 0 ? ground.images.length - 1 : prev - 1
//     );
//   const nextImage = () =>
//     setCurrentImage((prev) =>
//       ground && prev === ground.images.length - 1 ? 0 : prev + 1
//     );

//   const glassCardClasses =
//     "bg-white/10 backdrop-blur-md border border-green-900/30 rounded-2xl shadow-lg p-6";

//   const calculateAmount = () => {
//     if (!selectedSport || !bookingDetails) return 0;
//     const sport = ground.sports.find((s) => s.name === selectedSport);
//     return sport ? sport.pricePerHour * bookingDetails.times.length : 0;
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
//       {/* Image + Info Row */}
//       <div className="flex flex-col lg:flex-row gap-8">
//         {ground.images && ground.images.length > 0 && (
//           <div className="relative w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-lg">
//             <Image
//               src={ground.images[currentImage]}
//               alt={ground.name}
//               width={800}
//               height={500}
//               className="w-full h-64 sm:h-[25rem] object-cover transition-all duration-500"
//             />
//             <button
//               onClick={prevImage}
//               className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition">
//               ◀
//             </button>
//             <button
//               onClick={nextImage}
//               className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition">
//               ▶
//             </button>
//           </div>
//         )}

//         {/* Ground Info */}
//         <div
//           className={`${glassCardClasses} flex-1 flex flex-col justify-center space-y-4`}
//         >
//           <h1 className="text-2xl sm:text-3xl font-bold text-green-900 flex items-center gap-2">
//             {ground.name}
//             {userRole !== "user" && <StarIcon className="w-6 h-6 text-yellow-400" />}
//           </h1>

//           <p className="text-green-800 flex items-center gap-2">
//             <ClockIcon className="w-5 h-5 text-green-600" />
//             Open Time: {ground.availableTime?.from || ground.openTime || "N/A"} –{" "}
//             {ground.availableTime?.to || ground.closeTime || "N/A"}
//           </p>

//           {/* Facilities */}
//           {ground.amenities?.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {ground.amenities.map((facility) => (
//                 <span
//                   key={facility}
//                   className="flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 bg-green-700 text-white rounded-full text-sm sm:text-base font-medium"
//                 >
//                   {facilityIcons[facility] || <ClockIcon className="w-5 h-5" />}
//                   {facility}
//                 </span>
//               ))}
//             </div>
//           )}

//           {/* Admin Controls */}
//           {(userRole === "admin" || userRole === "super_admin") && (
//             <div className="flex gap-3 mt-4">
//               <Link
//                 href={`/admin/add-ground?id=${ground._id}`}
//                 className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
//               >
//                 <PencilSquareIcon className="w-5 h-5" />
//                 Edit
//               </Link>
//               <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
//                 <TrashIcon className="w-5 h-5" />
//                 Delete
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Sports Section */}
//       {ground.sports && ground.sports.length > 0 && (
//         <div className={glassCardClasses}>
//           <h2 className="text-xl font-semibold text-green-900 mb-4">
//             {userRole === "user"
//               ? "Select a Sport to Book"
//               : "Manage Sport Prices or Availability"}
//           </h2>
//           <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
//             {ground.sports.map((sport) => (
//               <button
//                 key={sport.name}
//                 onClick={() => {
//                   setSelectedSport(sport.name);
//                   setActiveTab("calendar");
//                   if (userRole === "user") setShowCalendarModal(true);
//                 }}
//                 className={`px-5 py-3 rounded-xl border font-semibold flex-shrink-0 transition ${
//                   selectedSport === sport.name
//                     ? "bg-green-600 text-white border-green-600 scale-105"
//                     : "bg-white text-green-900 border-green-600 hover:bg-green-100 hover:text-green-900"
//                 }`}
//               >
//                 {sport.name} – Rs {sport.pricePerHour || sport.price}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* User Booking Modals */}
//       {userRole === "user" && showCalendarModal && selectedSport && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-white rounded-2xl w-11/12 max-w-lg p-6 relative">
//             <button
//               onClick={() => setShowCalendarModal(false)}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <XMarkIcon className="w-6 h-6" />
//             </button>
//             <Calendar
//               groundId={id || ""}
//               groundName={ground.name}
//               onSlotClick={(date, times) => {
//                 setBookingDetails({ date, times });
//                 setShowCalendarModal(false);
//                 setShowPaymentModal(true);
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {userRole === "user" && showPaymentModal && bookingDetails && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-white rounded-2xl w-11/12 max-w-md p-6 relative">
//             <button
//               onClick={() => setShowPaymentModal(false)}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <XMarkIcon className="w-6 h-6" />
//             </button>
//             <PaymentForm
//               bookingDetails={{
//                 groundName: ground.name,
//                 location:
//                   typeof ground.location === "string"
//                     ? ground.location
//                     : ground.location.address,
//                 date: bookingDetails.date,
//                 times: bookingDetails.times,
//               }}
//               amount={calculateAmount()}
//               onPaymentSuccess={() => {
//                 setBookingDetails(null);
//                 setSelectedSport(null);
//                 setShowPaymentModal(false);
//                 alert("Booking completed successfully!");
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Admin Tabs */}
//       {userRole !== "user" && selectedSport && (
//         <div className={glassCardClasses}>
//           {/* Tab Navigation */}
//           <div className="flex gap-4 mb-6 border-b border-green-700 pb-2 justify-center overflow-x-auto">
//             {[
//               { key: "calendar", label: "Booking Calendar" },
//               { key: "summary", label: "Total Bookings" },
//               { key: "details", label: "Booking Details" },
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() =>
//                   setActiveTab(tab.key as "calendar" | "summary" | "details")
//                 }
//                 className={`px-4 py-2 rounded-t-lg font-medium transition whitespace-nowrap ${
//                   activeTab === tab.key
//                     ? "text-green-900 border-b-2 border-green-600"
//                     : "text-green-700 hover:text-green-900"
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           {/* Tab Content */}
//           <div className="transition-all duration-300">
//             {activeTab === "calendar" && (
//               <Calendar
//                 groundId={ground._id}
//                 groundName={`${ground.name} - ${selectedSport}`}
//               />
//             )}
//             {activeTab === "summary" && (
//               <BookingSummaryTab selectedSport={selectedSport || undefined} />
//             )}
//             {activeTab === "details" && (
//               <BookingDetailsTab selectedSport={selectedSport || undefined} />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
