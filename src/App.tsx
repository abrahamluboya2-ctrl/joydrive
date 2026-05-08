/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete, OverlayView, Polyline, TrafficLayer } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Search, 
  MapPin, 
  Clock, 
  CreditCard, 
  User, 
  Settings, 
  Star, 
  ChevronRight, 
  Car, 
  ShieldCheck, 
  TrendingUp,
  Zap,
  Menu,
  X,
  History,
  Gift,
  Plus,
  HelpCircle,
  LogOut,
  Globe,
  Info,
  Users,
  FileText,
  Briefcase,
  Facebook,
  Mail,
  Lock,
  Phone,
  MessageSquare,
  Truck,
  Package,
  Shield,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Flag,
  AlertTriangle,
  BarChart2,
  Sun,
  Moon,
  Bell,
  Wallet,
  Banknote,
  FileCheck,
  Smartphone,
  ChevronLeft,
  Palette,
  Upload,
  Minus,
  Heart,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Sparkles,
  PhoneCall,
  Share2,
  Edit2,
  Maximize,
  Minimize,
  Square
} from 'lucide-react';
import { cn } from './lib/utils';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';

const GOOGLE_MAPS_API_KEY = "AIzaSyAIDgwaN4MvVo6Fbs_XXlZTBjeu6vhNhzA";

const mapContainerStyle = {
  width: '100%',
  height: '100dvh',
  backgroundColor: '#000000'
};

const center = {
  lat: -26.2041,
  lng: 28.0473, // Johannesburg, South Africa
};

const darkMapOptions = {
  disableDefaultUI: true,
  mapTypeId: 'roadmap',
  backgroundColor: '#000000',
  styles: [
    { "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }, { "weight": 2 }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "weight": 0.1 }] },
    { "featureType": "poi", "stylers": [{ "visibility": "simplified" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }, { "weight": 1 }] },
    { "featureType": "poi.business", "stylers": [{ "visibility": "on" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#010801" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#111111" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#222222" }, { "weight": 0.5 }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#222222" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#444444" }, { "weight": 1 }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000810" }] }
  ]
};

const futuristicMapOptions = {
  disableDefaultUI: true,
  mapTypeId: 'roadmap',
  backgroundColor: '#0d1117',
  styles: [
    { "stylers": [{ "saturation": -100 }, { "invert_lightness": true }] },
    { "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#111111" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "weight": 0.1 }] }
  ]
};

const minimalistMapOptions = {
  disableDefaultUI: true,
  mapTypeId: 'roadmap',
  backgroundColor: '#000000',
  styles: [
    { "stylers": [{ "saturation": -100 }, { "lightness": -100 }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#222222" }] }
  ]
};

const satelliteMapOptions = {
  disableDefaultUI: true,
  mapTypeId: 'satellite',
  backgroundColor: '#000000'
};

const lightMapOptions = darkMapOptions; 

const polylineOptions = {
  strokeColor: '#00FF88',
  strokeWeight: 7,
  strokeOpacity: 0.95,
};

function getNavCenter(pos: google.maps.LatLngLiteral | null, bearing: number, distance: number = 0.001) {
  if (!pos) return center;
  // Move center BEHIND the car to push the car UP on the map (making it visible above info panels)
  // High distance offset for 3D view visibility - Increased for lighter following (pas trop près)
  const effectiveDistance = distance * 6.3; 
  const lat = pos.lat - effectiveDistance * Math.cos((bearing * Math.PI) / 180);
  const lng = pos.lng - effectiveDistance * Math.sin((bearing * Math.PI) / 180);
  return { lat, lng };
}

function Vehicle3D({ heading = 0, ride }: { heading?: number, ride: any }) {
  const isLarge = ride?.id === 'joy_xl' || ride?.id === 'joy_xxl' || ride?.id === 'joy_moving';
  const isSport = ride?.id === 'joy_vip';
  const carColor = ride?.color === '#000000' || !ride?.color ? "#121212" : ride.color;

  return (
    <div className="relative pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
      <motion.div
        animate={{ 
          rotate: heading,
          y: [0, -4, 0] // Floating with class
        }}
        transition={{ 
          rotate: { type: 'spring', stiffness: 200, damping: 25 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        }}
        className={cn("relative flex items-center justify-center", isLarge ? "w-36 h-36" : "w-32 h-32")}
      >
        {/* Sonar Beacon for extreme visibility */}
        <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center -z-20">
          <div className="w-24 h-24 bg-[#D4AF37]/20 rounded-full animate-sonar" />
          <div className="absolute w-16 h-16 bg-[#D4AF37]/10 rounded-full animate-sonar-2" />
        </div>

        {/* Realistic Shadow */}
        <div className={cn(
          "absolute top-[60%] left-1/2 -translate-x-1/2 bg-black/50 blur-xl rounded-[40%] transform scale-x-75",
          isLarge ? "w-24 h-32" : "w-20 h-28"
        )} />
        
        {/* Glow under car */}
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-20 h-20 bg-[#D4AF37]/40 blur-lg rounded-full" />

        <svg width={isLarge ? "100" : "80"} height={isLarge ? "150" : "120"} viewBox="0 0 100 150" className="drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
          {/* Main Body */}
          <path 
            d={isLarge 
              ? "M50 5 C30 5 15 15 10 40 L10 125 C10 142 20 148 50 148 C80 148 90 142 90 125 L90 40 C85 15 70 5 50 5Z" 
              : isSport 
                ? "M50 15 C30 15 12 25 8 50 L8 105 C8 125 20 135 50 135 C80 135 92 125 92 105 L92 50 C88 25 70 15 50 15Z"
                : "M50 10 C35 10 20 20 15 45 L15 110 C15 130 25 140 50 140 C75 140 85 130 85 110 L85 45 C80 20 65 10 50 10Z"
            } 
            fill={carColor === "#121212" ? "#D4AF37" : carColor}
          />
          
          {/* Windshield */}
          <path d={isLarge ? "M20 40 C20 25 35 15 50 15 C65 15 80 25 80 40 L75 55 L25 55 Z" : "M25 50 C25 35 35 25 50 25 C65 25 75 35 75 50 L70 65 L30 65 Z"} fill="#000000" fillOpacity="0.8" />
          
          {/* Rear Window */}
          <path d={isLarge ? "M25 120 L75 120 L80 135 C80 140 65 145 50 145 C35 145 20 140 20 135 Z" : "M30 110 L70 110 L75 125 C75 130 65 135 50 135 C35 135 25 130 25 125 Z"} fill="#000000" fillOpacity="0.8" />
          
          {/* Roof Line Detail */}
          <path 
            d={isLarge ? "M25 55 C25 55 35 25 50 25 C65 25 75 55 75 55" : "M30 65 C30 65 35 35 50 35 C65 35 70 65 70 65"} 
            fill="none" 
            stroke="white" 
            strokeWidth="0.5" 
            opacity="0.1"
          />
          
          {/* Tail Lights */}
          <rect x={isLarge ? "18" : "22"} y={isLarge ? "130" : "115"} width="12" height="6" rx="2" fill="#8B0000" stroke="#FF0000" strokeWidth="0.5" className="animate-pulse" />
          <rect x={isLarge ? "70" : "66"} y={isLarge ? "130" : "115"} width="12" height="6" rx="2" fill="#8B0000" stroke="#FF0000" strokeWidth="0.5" className="animate-pulse" />
        </svg>
      </motion.div>
    </div>
  );
}

function NavArrow({ heading = 0, ride }: { heading?: number, ride?: any }) {
  // Always use the arrow during navigation as requested - Reduced size by 25% (60x60 instead of 80x80)
  return (
    <div style={{ transform: `rotate(${heading}deg)` }} className="relative drop-shadow-[0_10px_30px_rgba(0,240,255,0.5)] transition-transform duration-300 ease-linear">
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" className="filter drop-shadow-2xl">
          <defs>
            <linearGradient id="navArrowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#00FF88" />
              <stop offset="100%" stopColor="#05FF91" />
            </linearGradient>
            <filter id="navGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path d="M50 15 L95 95 L50 80 L5 95 Z" fill="black" fillOpacity="0.6" transform="translate(0, 8)" />
          <path 
            d="M50 5 L90 90 L50 75 L10 90 Z" 
            fill="url(#navArrowGrad)" 
            stroke="white" 
            strokeWidth="4" 
            strokeLinejoin="round"
            filter="url(#navGlow)"
          />
          <path d="M50 5 L50 75" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
          <path d="M50 8 L82 85 L50 68 Z" fill="white" fillOpacity="0.3" />
        </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#00FF88]/25 blur-3xl rounded-full animate-sonar" />
    </div>
  );
}

const RIDE_TYPES = [
  { 
    id: 'joy_lite', 
    name: 'Joy Lite', 
    icon: Car, 
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663367102035/fx4yy5bytvxiWjowDVwE5a/vehicle-white-3d-heBGoPcJPF2XFkucumc4h3.webp", 
    vehicleModel: null,
    capacity: 1,
    basePrice: 8,
    pricePerKm: 3.0,
    price: 45, 
    time: '2 min', 
    description: 'Quick & Efficient', 
    color: '#FFFFFF',
    path: "M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" 
  },
  { 
    id: 'joy_economy', 
    name: 'Joy Economy', 
    icon: Zap, 
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663367102035/fx4yy5bytvxiWjowDVwE5a/vehicle-blue-3d-Hr33HuNChuknP6u42oLJGb.webp",
    vehicleModel: null,
    capacity: 2,
    basePrice: 10,
    pricePerKm: 4.7,
    price: 85, 
    time: '4 min', 
    description: 'Comfortable & Affordable', 
    color: '#3B82F6',
    path: "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z"
  },
  { 
    id: 'joy_express', 
    name: 'Joy Comfort', 
    icon: Briefcase, 
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663367102035/fx4yy5bytvxiWjowDVwE5a/vehicle-silver-3d-Kpxy96JPcGcB9Ery23wrgL.webp",
    vehicleModel: null,
    capacity: 3,
    basePrice: 15,
    pricePerKm: 6.0,
    price: 125, 
    time: '3 min', 
    description: 'Premium & Fast', 
    color: '#10B981',
    path: "M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"
  },
  { 
    id: 'joy_vip', 
    name: 'Joy Premium', 
    icon: Shield, 
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663367102035/fx4yy5bytvxiWjowDVwE5a/vehicle-black-3d-5iBC98oj4RRaoD5RLMzRXR.webp",
    vehicleModel: null,
    capacity: 3,
    basePrice: 30,
    pricePerKm: 11.0,
    price: 350, 
    time: '5 min', 
    description: 'Luxury & Style', 
    color: '#8B5CF6',
    path: "M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"
  },
  { 
    id: 'joy_women', 
    name: 'Joy Women for Women', 
    icon: User, 
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663367102035/fx4yy5bytvxiWjowDVwE5a/vehicle-red-3d-6fMG2VY4QxWC8GThGVQwh8.webp",
    vehicleModel: null,
    capacity: 2,
    basePrice: 11,
    pricePerKm: 5.0,
    price: 95, 
    time: '4 min', 
    description: 'Safe rides for women by women', 
    color: '#EC4899',
    path: "M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"
  },
  { 
    id: 'joy_xl', 
    name: 'Joy XL', 
    icon: Car, 
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663367102035/fx4yy5bytvxiWjowDVwE5a/vehicle-white-3d-heBGoPcJPF2XFkucumc4h3.webp",
    vehicleModel: null,
    capacity: 4,
    basePrice: 40,
    pricePerKm: 15.0,
    price: 450, 
    time: '6 min', 
    description: 'Large SUV for families', 
    color: '#FFFFFF',
    path: "M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"
  },
  { 
    id: 'joy_xxl', 
    name: 'Joy XXL', 
    icon: Truck, 
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663367102035/fx4yy5bytvxiWjowDVwE5a/truck-white-3d-NvvGZusXzsPtF52j23UHgY.webp",
    vehicleModel: null,
    capacity: 6,
    basePrice: 60,
    pricePerKm: 20.0,
    price: 650, 
    time: '8 min', 
    description: 'Maximum capacity & space', 
    color: '#FFFFFF',
    path: "M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"
  },
  { 
    id: 'joy_parcels', 
    name: 'Joy Send', 
    icon: Package, 
    image: "https://pngimg.com/uploads/box/box_PNG137.png",
    vehicleModel: null,
    capacity: 0,
    basePrice: 10,
    pricePerKm: 4.4,
    price: 65, 
    time: '10 min', 
    description: 'Safe & Secure Delivery with Secret Code', 
    color: '#F97316',
    path: "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z"
  },
  { 
    id: 'joy_moving', 
    name: 'Joy Moving', 
    icon: Truck, 
    image: "https://pngimg.com/uploads/truck/truck_PNG16246.png",
    vehicleModel: null,
    capacity: 2,
    basePrice: 209,
    pricePerKm: 12.0,
    price: 0, 
    time: '15 min', 
    description: 'Large Capacity Moving', 
    color: '#EF4444',
    path: "M20,8H17V4H3C1.9,4 1,4.9 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8M6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5M17,8H19L21.25,11H17V8M18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5Z"
  }
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'af', name: 'Afrikaans' },
];

const TRANSLATIONS: Record<string, any> = {
  en: {
    welcome: "Welcome to JoyDrive",
    tagline: "Intelligence & Prestige",
    getStarted: "Get Started",
    whereTo: "Where to?",
    from: "Pickup point",
    search: "Search Ride",
    order: "Order",
    cancel: "Cancel",
    confirm: "Confirm",
    confirmRegistration: "Confirm Registration",
    submitReg: "Confirm driver registration",
    becomeDriver: "Become a Driver",
    profile: "Profile",
    history: "History",
    payment: "Payment",
    promos: "Promotions",
    help: "Help",
    settings: "Settings",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    theme: "Theme",
    about: "About",
    privacy: "Privacy Policy",
    language: "Language",
    logout: "Logout",
    driverArriving: "Your JoyDrive is arriving",
    driverInfo: "Your driver is on the way.",
    paymentRequired: "Payment Verification",
    payNow: "Pay & Search",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    register: "Register",
    socialLogin: "Or continue with",
    deleteAccount: "Delete Account",
    deleteConfirm: "Are you sure you want to delete your account?",
    saveChanges: "Save Changes",
    selectLanguage: "Select Language",
    emergency: "Emergency Call",
    searchingDriver: "Searching for your pilot...",
    driverFound: "Pilot Found!",
    driverArrived: "Your pilot has arrived!",
    message: "Message",
    call: "Call",
    eta: "ETA",
    min: "min",
    tripArriving: "Driver arriving in",
    tripDestination: "Arriving at destination in",
    tripStatus: "Live Trip Status",
    deleteAccountPerm: "Delete Account Permanently",
    paymentMethod: "Payment Method",
    forgotSomething: "Forgot something in the vehicle?",
    callDriverManual: "Call Driver",
    driverDashboard: "Driver Dashboard",
    accept: "Accept",
    decline: "Decline",
    incomingRequest: "Incoming Request",
    customer: "Customer",
    destination: "Destination",
    startTrip: "Start Trip",
    completeTrip: "Complete Trip",
    driverRegSuccess: "Registration Successful!",
    driverRegReview: "Your application is under review. We will contact you soon.",
    noRequests: "No active requests nearby.",
    newRequest: "New request received!",
    navigatingToCustomer: "Navigating to customer...",
    navigatingToDestination: "Navigating to destination...",
    tripCompleted: "Trip completed successfully!",
    policeSA: "SA Police (10111)",
    emergency112: "Emergency (112)",
    baseFare: "Base Fare",
    pricePerKm: "Price per km",
    totalEstimated: "Total Estimated",
    distance: "Distance",
    earnings: "Earnings",
    cash: "Cash",
    card: "Credit Card",
    notifications: "Notifications",
    becomeDriverTitle: "Join the Fleet",
    driverPhone: "Phone Number",
    phone: "Phone Number",
    vehicleColor: "Vehicle Color",
    carModel: "Car Model (e.g. Toyota Corolla)",
    plateNumber: "Plate Number",
    uploadDocs: "Upload Documents (PDF/Image)",
    license: "Driver's License",
    vehicleDocs: "Vehicle Registration",
    rateDriver: "Rate your Driver",
    driverFeedback: "How was your driver?",
    vehicleFeedback: "How was the vehicle?",
    tripFeedback: "How was the trip?",
    priceFeedback: "How was the price?",
    feedbackPlaceholder: "Tell us more about your journey...",
    submitFeedback: "Submit Review",
    downloading: "Downloading intelligence...",
    addStop: "Add Stop",
    favorites: "Favorites",
    saveAddress: "Save Address",
    saveDriver: "Save Driver",
    favoriteDrivers: "Favorite Drivers",
    favoriteAddresses: "Favorite Addresses",
    addCard: "Add New Card",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cvv: "CVV",
    paymentSuccess: "Payment Successful!",
    noCards: "No cards saved yet",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    wallets: "Wallets",
    methods: "Methods",
    addWallet: "Link Wallet",
    liveLocation: "Live Location",
    movingDetails: "Moving Details",
    furnitureName: "Furniture Name",
    addFurniture: "Add Furniture",
    truckSize: "Truck Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    estimatedPrice: "Estimated Price",
    negotiatePrice: "Negotiate Price",
    acceptPrice: "Accept Price",
    driverOffer: "Driver Offer",
    takePhoto: "Take Photo",
    furnitureList: "Furniture List",
    dimensions: "Dimensions",
    offerPrice: "Offer your price",
    yourOffer: "Your Offer",
    driverAccepted: "Driver accepted your offer!",
    negotiating: "Negotiating with driver...",
    takePhotoReal: "Take Real-time Photo",
    stopCamera: "Stop Camera",
    capture: "Capture", 
    mallEntranceTitle: "Mall Entrance", 
    mallEntrancePrompt: "Please specify the entrance for this mall:", 
    selectEntrance: "Select Entrance", 
    entrance: "Entrance",
    connect: "Connect",
    liveSpeed: "Live Speed",
    left: "Left",
    currentRoadLabel: "Current Road",
    status: "Status",
    track: "Track",
    start: "Start",
    enRoute: "En Route",
    vehicleDetails: "Vehicle Details",
    liveView: "Live View",
    verifiedDriver: "Verified Driver",
    online: "Online",
    encryptedComm: "Encrypted Communication",
    privacyShield: "JoyDrive Privacy Shield Active",
    socialConnect: "Social Connect",
    recommended: "Recommended",
    fastest: "Fastest",
    cheapest: "Cheapest",
    departure: "Departure",
    destinationLabel: "Destination",
    navigatingMainRoute: "Navigating Main Route...",
    liveGps: "Live GPS",
    startVoiceCall: "Start Voice Call",
    voiceConnectivity: "Voice Connectivity",
    chat: "Chat",
    typeMessage: "Type a message...",
    inTransitTo: "In transit to",
    postName: "Post-Name",
    boardVehicle: "Board Vehicle",
    liveTrip: "Live Trip",
    rideCancelled: "Ride Cancelled",
    cancelReason: "Reason for cancellation:",
  },
  fr: {
    welcome: "Bienvenue sur JoyDrive",
    tagline: "Intelligence & Prestige",
    getStarted: "Commencer",
    whereTo: "Où allez-vous ?",
    from: "Point de départ",
    search: "Rechercher",
    order: "Commander",
    cancel: "Annuler",
    confirm: "Confirmer",
    confirmRegistration: "Confirmer l'inscription",
    submitReg: "Confirmer l'inscription du chauffeur",
    becomeDriver: "Devenir Chauffeur",
    profile: "Profil",
    history: "Trajets",
    payment: "Paiement",
    promos: "Promotions",
    help: "Aide",
    settings: "Paramètres",
    about: "À propos",
    privacy: "Confidentialité",
    language: "Langue",
    logout: "Déconnexion",
    driverArriving: "Votre JoyDrive arrive",
    driverInfo: "Votre chauffeur est en route.",
    paymentRequired: "Vérification du paiement",
    payNow: "Payer & Rechercher",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    register: "S'enregistrer",
    socialLogin: "Ou continuer avec",
    deleteAccount: "Supprimer le compte",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer votre compte ?",
    saveChanges: "Enregistrer",
    selectLanguage: "Choisir la langue",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    theme: "Thème",
    emergency: "Appel d'Urgence",
    searchingDriver: "Recherche de votre pilote...",
    driverFound: "Pilote Trouvé !",
    driverArrived: "Votre pilote est arrivé !",
    message: "Message",
    call: "Appel",
    eta: "Arrivée",
    min: "min",
    tripArriving: "Le chauffeur arrive dans",
    tripDestination: "Arrivée à destination dans",
    tripStatus: "Statut du trajet",
    deleteAccountPerm: "Supprimer définitivement",
    paymentMethod: "Mode de Paiement",
    cash: "Espèces",
    card: "Carte Bancaire",
    notifications: "Notifications",
    becomeDriverTitle: "Rejoindre la Flotte",
    driverPhone: "Numéro de Téléphone",
    phone: "Numéro de Téléphone",
    vehicleColor: "Couleur du Véhicule",
    carModel: "Modèle du Véhicule (ex: Toyota Corolla)",
    plateNumber: "Numéro de Plaque",
    uploadDocs: "Télécharger Documents (PDF/Image)",
    license: "Permis de Conduire",
    vehicleDocs: "Carte Grise",
    rateDriver: "Notez votre chauffeur",
    driverFeedback: "Comment était le chauffeur ?",
    vehicleFeedback: "Comment était le véhicule ?",
    tripFeedback: "Comment était le trajet ?",
    priceFeedback: "Comment était le prix ?",
    feedbackPlaceholder: "Dites-nous en plus sur votre voyage...",
    submitFeedback: "Envoyer l'avis",
    downloading: "Téléchargement de l'intelligence...",
    addStop: "Ajouter un arrêt",
    favorites: "Favoris",
    saveAddress: "Enregistrer l'adresse",
    saveDriver: "Enregistrer le chauffeur",
    favoriteDrivers: "Chauffeurs favoris",
    favoriteAddresses: "Adresses favorites",
    addCard: "Ajouter une Carte",
    cardNumber: "Numéro de Carte",
    expiryDate: "Date d'Expiration",
    cvv: "CVV",
    paymentSuccess: "Paiement Réussi !",
    noCards: "Aucune carte enregistrée",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    wallets: "Portefeuilles",
    methods: "Méthodes",
    mallEntranceTitle: "Entrée du Centre Commercial",
    mallEntrancePrompt: "Veuillez spécifier l'entrée pour ce centre :",
    selectEntrance: "Choisir l'entrée",
    entrance: "Entrée",
    addWallet: "Lier Portefeuille",
    forgotSomething: "Oublié quelque chose dans le véhicule ?",
    callDriverManual: "Appeler le chauffeur",
    driverDashboard: "Tableau de Bord Chauffeur",
    accept: "Accepter",
    decline: "Refuser",
    incomingRequest: "Nouvelle Demande",
    customer: "Client",
    destination: "Destination",
    startTrip: "Démarrer le trajet",
    completeTrip: "Terminer le trajet",
    driverRegSuccess: "Inscription Réussie !",
    driverRegReview: "Votre demande est en cours d'examen. Nous vous contacterons bientôt.",
    noRequests: "Aucune demande à proximité.",
    newRequest: "Nouvelle demande reçue !",
    navigatingToCustomer: "Navigation vers le client...",
    navigatingToDestination: "Navigation vers la destination...",
    tripCompleted: "Trajet terminé avec succès !",
    policeSA: "Police SA (10111)",
    emergency112: "Urgences (112)",
    baseFare: "Prix de base",
    pricePerKm: "Prix par km",
    totalEstimated: "Total Estimé",
    distance: "Distance",
    earnings: "Gains",
    liveLocation: "Position en Direct",
    movingDetails: "Détails du déménagement",
    furnitureName: "Nom du meuble",
    addFurniture: "Ajouter un meuble",
    truckSize: "Taille du camion",
    small: "Petit",
    medium: "Moyen",
    large: "Grand",
    estimatedPrice: "Prix estimé",
    negotiatePrice: "Négocier le prix",
    acceptPrice: "Accepter le prix",
    driverOffer: "Offre du chauffeur",
    takePhoto: "Prendre une photo",
    furnitureList: "Liste des meubles",
    dimensions: "Dimensions",
    offerPrice: "Proposez votre prix",
    yourOffer: "Votre Offre",
    driverAccepted: "Le chauffeur a accepté votre offre !",
    negotiating: "Négociation avec le chauffeur...",
    takePhotoReal: "Prendre une photo en temps réel",
    stopCamera: "Arrêter la caméra",
    capture: "Capturer",
    connect: "Contacter",
    liveSpeed: "Vitesse réelle",
    left: "Restant",
    currentRoadLabel: "Route actuelle",
    status: "Statut",
    track: "Suivre",
    start: "Démarrer",
    enRoute: "En route",
    vehicleDetails: "Détails du véhicule",
    liveView: "Vue en direct",
    verifiedDriver: "Chauffeur vérifié",
    online: "En ligne",
    encryptedComm: "Communication chiffrée",
    privacyShield: "Bouclier de confidentialité JoyDrive actif",
    socialConnect: "Connexion Sociale",
    recommended: "Recommandé",
    fastest: "Plus rapide",
    cheapest: "Moins cher",
    departure: "Départ",
    destinationLabel: "Destination",
    navigatingMainRoute: "Navigation sur la route principale...",
    liveGps: "GPS en direct",
    startVoiceCall: "Lancer l'appel vocal",
    voiceConnectivity: "Connectivité vocale",
    chat: "Chat",
    typeMessage: "Écrivez un message...",
    inTransitTo: "En transit vers",
    postName: "Post-Nom",
    boardVehicle: "Monter à bord",
    liveTrip: "Trajet en direct",
    rideCancelled: "Trajet annulé",
    cancelReason: "Raison de l'annulation :",
  },
  zu: {
    welcome: "Siyakwamukela ku-JoyDrive",
    tagline: "Ubuhlakani Nokuhlonishwa",
    getStarted: "Qala",
    whereTo: "Uyaphi?",
    from: "Indawo yokulanda",
    search: "Sesha Uhambo",
    order: "Oda",
    cancel: "Khansela",
    confirm: "Qinisekisa",
    becomeDriver: "Yiba Umshayeli",
    profile: "Iphrofayili",
    history: "Umlando",
    payment: "Inkokhelo",
    promos: "Amaphromoshini",
    help: "Usizo",
    settings: "Izilungiselelo",
    logout: "Phuma",
    eta: "ETA",
    min: "imizuzu",
    searchingDriver: "Ufuna umshayeli...",
    driverFound: "Umshayeli utholakele!",
    driverArrived: "Umshayeli ufikile!",
    message: "Thumela umlayezo",
    call: "Shaya ucingo",
    shareLocation: "Yabelana ngendawo",
    liveLocation: "Indawo Ebukhoma",
    confirmRegistration: "Qinisekisa Ukubhalisa",
    submitReg: "Qinisekisa ukubhalisa komshayeli",
  },
  xh: {
    welcome: "Wamkelekile eJoyDrive",
    tagline: "Ubukrelekrele kunye nePrestige",
    getStarted: "Qala",
    whereTo: "Uya phi?",
    from: "Indawo yokulanda",
    search: "Khangela uHambo",
    order: "Oda",
    cancel: "Rhoxisa",
    confirm: "Qinisekisa",
    becomeDriver: "Yiba nguMqhubi",
    profile: "Iprofayile",
    history: "Imbali",
    payment: "Intlawulo",
    promos: "Iintengiso",
    help: "Uncedo",
    settings: "Izicwangciso",
    logout: "Phuma",
    eta: "ETA",
    min: "imizuzu",
    searchingDriver: "Khangela umqhubi...",
    driverFound: "Umqhubi ufunyenwe!",
    driverArrived: "Umqhubi ufikile!",
    message: "Thumela umyalezo",
    call: "Fowuna",
    shareLocation: "Yabelana ngendawo",
    liveLocation: "Indawo Ebukhoma",
    confirmRegistration: "Qinisekisa ubhaliso",
    submitReg: "Qinisekisa ukubhaliswa komqhubi",
  },
  af: {
    welcome: "Welkom by JoyDrive",
    tagline: "Intelligensie en Prestige",
    getStarted: "Begin",
    whereTo: "Waarheen?",
    from: "Oplaai punt",
    search: "Soek Rit",
    order: "Bestel",
    cancel: "Kanselleer",
    confirm: "Bevestig",
    becomeDriver: "Word 'n Bestuurder",
    profile: "Profiel",
    history: "Geskiedenis",
    payment: "Betaling",
    promos: "Promosies",
    help: "Hulp",
    settings: "Instellings",
    logout: "Teken uit",
    eta: "ETA",
    min: "min",
    searchingDriver: "Soek vir 'n bestuurder...",
    driverFound: "Bestuurder gevind!",
    driverArrived: "Bestuurder het gearriveer!",
    message: "Boodskap",
    call: "Bel",
    shareLocation: "Deel ligging",
    confirmRegistration: "Bevestig Registrasie",
    submitReg: "Bevestig bestuurder registrasie",
  },
};

const ABOUT_CONTENT = `JoyDrive is the world's most advanced transport intelligence platform, dedicated to revolutionizing urban mobility through innovation and safety. Born from the fusion of cutting-edge AI and premium logistics, we provide an unparalleled travel experience that is as reliable as it is efficient.

Our mission is to create a seamless connection between people and their destinations, reducing congestion and environmental impact while maximizing comfort. We leverage real-time data analysis and predictive modeling to ensure our drivers are always where they need to be, providing you with the fastest possible ETAs.

Our Commitment:
• Continuous Safety Audits: Every driver and vehicle undergoes regular vetting and inspection.
• AI Hub: Proprietary algorithms optimize routes every second to save you time and money.
• Seamless Integration: Connecting you with premium services through a single, intuitive interface.
• Global Standards: Operating with the highest level of professionalism across all serviced regions.

With JoyDrive, you're not just booking a ride; you're joining a community committed to the future of transportation. For support or inquiries, contact our elite support team at +27788002462.`;

const PRIVACY_POLICY = `At JoyDrive, your privacy is our top priority. We are committed to protecting your personal data and being transparent about how we use it to provide you with the best experience.

1. Information We Collect: 
• Identity Data: Name, email, and verified phone number.
• Connectivity Data: Real-time location during active trips to facilitate navigation and safety.
• Payment Data: Handled strictly by PCI-compliant tier-1 processors; we never store your full card details.
• Behavioral Data: Minimal usage statistics to improve app performance and user experience.

2. How We Use Information:
• Service Delivery: To connect you with drivers and facilitate your transportation.
• Safety & Security: To verify identities, detect fraud, and ensure the safety of all platform users.
• Customer Support: To resolve issues and respond to your inquiries effectively.

3. Sharing of Information:
• We do not sell your personal data. 
• Information is only shared with drivers to facilitate trips and with trusted third-party service providers.

4. Your Rights & Control:
• Access & Correction: You can view and update your profile information at any time.
• Deletion: You have the "Right to be Forgotten" and can request full account deletion through the app settings.
• Preferences: Manage your notification and privacy settings directly in the interface.

By using JoyDrive, you agree to the collection and use of information in accordance with this comprehensive policy. We comply with international data protection regulations, including GDPR and POPIA. For privacy concerns, contact +27788002462.`;

// Components
const SplashScreen = ({ theme }: { theme: string }) => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
    className={cn(
      "fixed inset-0 z-[1000] flex flex-col items-center justify-center p-8 overflow-hidden",
      "bg-black" // Consistently black to avoid flashes
    )}
  >
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="absolute top-16 flex flex-col items-center z-20"
    >
      <Car className="w-24 h-24 text-[#D4AF37] drop-shadow-[0_0_20px_rgba(212,175,55,0.6)] animate-float" />
      <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-3 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
    </motion.div>

    {/* Animated Mesh Background for Splash Only */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#D4AF37_0%,transparent_70%)] blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#D4AF37_0%,transparent_70%)] blur-[120px]" 
      />
    </div>

    <div className="relative mb-8 w-48 h-60 flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-center z-10"
      >
        <div className="relative flex items-end translate-x-4">
          {/* Flag Pole - Rigid and premium base */}
          <div className="w-1.5 h-32 bg-gradient-to-b from-[#D4AF37] via-[#B8860B] to-[#5c4a1e] rounded-full relative z-0">
             {/* Gleam on pole */}
             <div className="absolute inset-x-0 top-0 h-1/2 bg-white/40 blur-[0.5px] rounded-full" />
          </div>

          {/* Flag - Firmly attached, horizontal wind wave */}
          <motion.div 
            animate={{ 
              skewX: [-2, 4, -2],
              scaleX: [1, 1.05, 1],
              rotateZ: [-1, 1, -1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ originX: 0, originY: "15%" }}
            className="text-[5.5rem] leading-none drop-shadow-[20px_10px_40px_rgba(212,175,55,0.3)] select-none -ml-1.5 mb-[108px] relative z-20"
          >
            🇿🇦
          </motion.div>
          
          {/* Base Shadow */}
          <div className="w-24 h-6 bg-[#D4AF37]/10 blur-2xl rounded-[100%] absolute -bottom-4 translate-x-[-20%]" />
        </div>
      </motion.div>
      
      {/* Dynamic Rings - Slightly smaller too */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-20px] border border-[#D4AF37]/10 rounded-full"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-40px] border border-[#D4AF37]/5 rounded-full"
      />
    </div>
    
    <div className="relative z-10 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="flex items-center justify-center gap-4"
      >
        <div className="w-8 h-[1px] bg-[#D4AF37]/40" />
        <p className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.6em]">
          PREMIUM
        </p>
        <div className="w-8 h-[1px] bg-[#D4AF37]/40" />
      </motion.div>
    </div>

    <div className={cn("absolute bottom-16 left-0 right-0 flex flex-col items-center gap-2")}>
      <p className="text-[9px] uppercase tracking-[0.8em] font-light text-white">THE ART OF TRAVEL</p>
    </div>
  </motion.div>
);

const LandingPage = ({ theme, loadingProgress, t, setAppState }: { theme: string, loadingProgress: number, t: (key: string) => string, setAppState: (s: AppState) => void }) => (
  <motion.div 
    key="landing"
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center", theme === 'dark' ? "bg-black" : "bg-white")}
  >
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none"
    >
      <h1 className="joy-brand text-4xl sm:text-5xl">JoyDrive</h1>
    </motion.div>

    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>

    <motion.div 
      initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 1.5 }}
      className="mb-8 relative flex flex-col items-center"
    >
      <div className={cn("absolute inset-0 blur-[100px] rounded-full", theme === 'dark' ? "bg-[#D4AF37]/30" : "bg-[#D4AF37]/10")} />
      
      <Car className="w-[116px] h-[116px] relative z-10 animate-float text-[#D4AF37] drop-shadow-[0_0_30px_rgba(212,175,55,0.6)]" />
      
      <div className="absolute -inset-8 border border-[#D4AF37]/20 rounded-full animate-pulse-ring" />
    </motion.div>

    <div className="w-full max-w-xs space-y-6 mt-12">
      <div className="space-y-4">
        <div className={cn("h-1.5 rounded-full overflow-hidden", theme === 'dark' ? "bg-white/10" : "bg-black/10")}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${loadingProgress}%` }}
            className={cn("h-full bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,1)]")}
          />
        </div>
        <p className="text-[12px] uppercase tracking-[0.5em] font-bold opacity-40 text-[#D4AF37]">{t('initializingSystem')}</p>
      </div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => setAppState('auth')}
        className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] opacity-60 hover:opacity-100 transition-opacity underline underline-offset-4"
      >
        Skip Loading
      </motion.button>
    </div>
  </motion.div>
);

const AuthPage = ({ theme, t, lang, handleSocialLogin, setAppState, isRegistering, setIsRegistering, onAuthSuccess, setNotification }: { 
  theme: string, 
  t: (key: string) => string, 
  lang: string, 
  handleSocialLogin: (p: string) => void, 
  setAppState: (s: AppState) => void, 
  isRegistering: boolean, 
  setIsRegistering: (v: boolean) => void, 
  onAuthSuccess?: (data: any) => void,
  setNotification: (n: { type: 'error' | 'success' | 'info', message: string } | null) => void
}) => {
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authStep, setAuthStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const finishAuth = () => {
    if (isRegistering) {
      // For testing and making it "operational", provide defaults if fields are empty
      const finalFirstName = firstName || "Abraham";
      const finalLastName = lastName || "King";
      const finalPhone = phone || "081 000 0000";
      const finalEmail = email || "user@joydrive.com";

      if (onAuthSuccess) {
        onAuthSuccess({
          firstName: finalFirstName,
          lastName: finalLastName,
          phone: finalPhone,
          email: finalEmail,
          photo: profilePreview || `https://picsum.photos/seed/${finalFirstName}/200/200`
        });
      }
    } else {
      if (!email || !password) {
        setNotification({ 
          type: 'error', 
          message: lang === 'fr' ? 'Veuillez entrer votre email et mot de passe' : 'Please enter your email and password' 
        });
        return;
      }
      if (onAuthSuccess) {
        onAuthSuccess({
          firstName: "Abraham",
          lastName: "King",
          phone: "+27 73 123 4567",
          email: email,
          photo: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200"
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={cn("fixed inset-0 z-[100] p-8 flex flex-col justify-center overflow-hidden", theme === 'dark' ? "bg-black" : "bg-white")}
    >
      <div className="max-w-md mx-auto w-full h-full flex flex-col px-6 py-12 overflow-y-auto custom-scrollbar relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-[#D4AF37]/10 mb-4">
            <Car className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h2 className={cn(
            "font-black mb-2 uppercase",
            isRegistering && authStep === 1 ? "text-4xl text-[#D4AF37] font-brand tracking-[0.1em]" : 
            isRegistering && authStep === 2 ? "text-[20px] text-[#D4AF37]" : // Explicitly 20px (reduced from 40px/4xl)
            "text-4xl text-white tracking-tight italic"
          )}>
            {isRegistering ? (authStep === 1 ? "JoyDrive" : t('profile')) : "Welcome Back"}
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
            {isRegistering ? "Elite Mobility Network" : "Access your premium account"}
          </p>
        </div>

        <div className="flex-1 space-y-6">
          {isRegistering && authStep === 1 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => setAuthStep(2)}
                className="group relative py-4 rounded-2xl overflow-hidden transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 border border-white/20 active:border-purple-400/50 active:shadow-[0_0_15px_rgba(168,85,247,0.3)] focus:border-purple-400/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] outline-none"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00FF88] to-[#FFD700] opacity-90 group-hover:opacity-100" />
                <div className="relative flex items-center justify-center gap-2 text-black">
                  <ChevronRight className="w-4 h-4" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Passenger</span>
                </div>
              </button>
              <button 
                onClick={() => setAppState('driver_reg')}
                className="group relative py-4 rounded-2xl overflow-hidden transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 border border-white/20 active:border-purple-400/50 active:shadow-[0_0_15px_rgba(168,85,247,0.3)] focus:border-purple-400/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] outline-none"
              >
                <div className="absolute inset-0 bg-gradient-to-bl from-[#FFD700] to-[#00FF88] opacity-90 group-hover:opacity-100" />
                <div className="relative flex items-center justify-center gap-2 text-white">
                  <Car className="w-4 h-4" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Driver</span>
                </div>
              </button>
            </div>
          )}

          {isRegistering && authStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div onClick={handlePhotoClick} className="relative group cursor-pointer active:scale-95 transition-transform">
                  <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-red-500 to-blue-600 shadow-xl transition-all group-hover:scale-105">
                    <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center overflow-hidden">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-white/20" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-[#D4AF37] p-2 rounded-full shadow-lg border-2 border-black">
                    <Plus className="w-3 h-3 text-black" />
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('firstName')}</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full glass p-4 rounded-[20px] text-sm font-bold border border-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('lastName')}</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full glass p-4 rounded-[20px] text-sm font-bold border border-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Contact (+243)</label>
                  <div className="flex gap-2">
                    <div className="glass px-4 rounded-[20px] flex items-center font-bold text-purple-500 text-xs border border-white/5">+243</div>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="flex-1 glass p-4 rounded-[20px] text-sm font-bold border border-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Gmail Account</label>
                  <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full glass p-4 rounded-[20px] text-sm font-bold border border-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">JoyDrive Password</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full glass p-4 rounded-[20px] text-sm font-bold border border-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none" />
                </div>
              </div>

              <button onClick={finishAuth} className="w-full p-5 rounded-[22px] bg-gradient-to-r from-[#00FF88] to-[#01BE66] text-black font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all shadow-[#00FF88]/20 border border-white/10">
                Join JoyDrive Now
              </button>
              
              <button onClick={() => setAuthStep(1)} className="w-full text-[10px] font-black uppercase tracking-widest opacity-30 mt-4 text-center">
                Back to selection
              </button>
            </motion.div>
          )}

          {!isRegistering && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Gmail Account</label>
                <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full glass p-4 rounded-[20px] text-sm font-bold border border-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">JoyDrive Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full glass p-4 rounded-[20px] text-sm font-bold border border-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none" />
              </div>
              <button onClick={finishAuth} className="w-full p-5 rounded-[22px] bg-gradient-to-r from-purple-500 to-purple-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all shadow-purple-500/20">
                {t('login')}
              </button>
            </div>
          )}

          {(isRegistering && authStep === 1 || !isRegistering) && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className={cn("px-4 text-[#D4AF37]", theme === 'dark' ? "bg-black" : "bg-white")}>{t('socialLogin')}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSocialLogin('Google')} className="glass py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all border border-white/5 active:border-purple-500/50 focus:border-purple-500/50 outline-none">
                  <Mail className="w-5 h-5 text-red-500" /> <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Google</span>
                </button>
                <button onClick={() => handleSocialLogin('Facebook')} className="glass py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all border border-white/5 active:border-purple-500/50 focus:border-purple-500/50 outline-none">
                  <Facebook className="w-5 h-5 text-blue-600" /> <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Facebook</span>
                </button>
              </div>

              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all mt-4 flex items-center justify-center gap-2"
              >
                {isRegistering ? "Access existing account" : "Join JoyDrive network"}
                <ChevronRight className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DriverRegPage = ({ theme, t, setAppState, driverRegData, setDriverRegData, handlePhotoUpload }: { theme: string, t: (key: string) => string, setAppState: (s: AppState) => void, driverRegData: any, setDriverRegData: any, handlePhotoUpload: any }) => (
  <motion.div 
    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
    className={cn("fixed inset-0 z-[110] p-8 overflow-y-auto custom-scrollbar", theme === 'dark' ? "bg-black" : "bg-white")}
  >
    <div className="max-w-md md:max-w-2xl mx-auto py-12 w-full">
      <button onClick={() => setAppState('auth')} className="mb-8 opacity-50 flex items-center gap-2"><ArrowRight className="w-5 h-5 rotate-180" /> Back</button>
      
      <div className="flex items-center gap-4 mb-12">
        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)]">
          <Car className="w-8 h-8 text-black" />
        </div>
        <div>
          <h2 className="text-4xl font-display joy-gradient leading-tight">{t('becomeDriverTitle')}</h2>
          <p className="text-sm opacity-40">Complete the elite partner application</p>
        </div>
      </div>

      <div className="space-y-12 pb-24">
        {/* Personal Details */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Information
          </h3>
          
          <div className={cn("w-32 h-32 glass rounded-[32px] mx-auto flex flex-col items-center justify-center gap-2 border-dashed relative overflow-hidden group border-2", theme === 'dark' ? "border-[#E9D5FF]/30 shadow-[0_0_20px_rgba(233,213,255,0.2)]" : "border-[#E9D5FF]/20 shadow-[0_0_10px_rgba(233,213,255,0.1)]")}>
            <Camera className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity text-[#A855F7]" />
            <span className="text-[9px] uppercase font-bold text-[#A855F7]/70">Profil Photo</span>
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">{t('firstName')}</label>
              <input type="text" placeholder="John" className="w-full glass p-4 rounded-2xl focus:border-[#6B21A8]/60 focus:shadow-[0_0_20px_rgba(107,33,168,0.3)] focus:outline-none transition-all shadow-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">{t('lastName')}</label>
              <input type="text" placeholder="Doe" className="w-full glass p-4 rounded-2xl focus:border-[#6B21A8]/60 focus:shadow-[0_0_20px_rgba(107,33,168,0.3)] focus:outline-none transition-all shadow-xl" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">ID Type</label>
              <select className={cn("w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all appearance-none", theme === 'dark' ? "bg-black" : "bg-white")}>
                <option>National ID</option>
                <option>Passport</option>
                <option>Refugee ID</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">ID Number</label>
              <input type="text" placeholder="9001010000081" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">{t('driverPhone')}</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
              <input 
                type="tel" 
                placeholder="+27 00 000 0000" 
                className="w-full glass p-4 pl-12 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all"
                value={driverRegData.phone}
                onChange={(e) => setDriverRegData({...driverRegData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Residential Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 opacity-30" />
              <textarea placeholder="Street Name, Area, City, Code" className="w-full glass p-4 pl-12 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all min-h-[100px]"></textarea>
            </div>
          </div>
        </section>

        {/* Vehicle Details */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Vehicle Registration
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Vehicle Make</label>
              <input type="text" placeholder="Toyota" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Vehicle Model</label>
              <input type="text" placeholder="Quantum" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Vehicle Year</label>
              <input type="number" placeholder="2024" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">{t('vehicleColor')}</label>
              <input type="text" placeholder="Obsidian Black" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">License Plate</label>
              <input type="text" placeholder="JOY-001-GP" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">License Number</label>
              <input type="text" placeholder="DL-123456789" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
          </div>
        </section>

        {/* Bank Details */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Payout Settings (Bank Info)
          </h3>
          <div className="space-y-4 glass p-6 rounded-[32px]">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Bank Name</label>
              <input type="text" placeholder="e.g. FNB, Standard Bank" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Account Holder Name</label>
              <input type="text" placeholder="John Doe" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Account Number</label>
                <input type="text" placeholder="1234567890" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Branch Code</label>
                <input type="text" placeholder="250655" className="w-full glass p-4 rounded-2xl focus:border-[#D4AF37]/50 focus:outline-none transition-all" />
              </div>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
            <FileCheck className="w-4 h-4" /> {t('uploadDocs')}
          </h3>
          <div className="space-y-4">
            {[
              { id: 'license', label: t('license') },
              { id: 'vehicleDocs', label: t('vehicleDocs') },
              { id: 'insurance', label: 'Insurance Policy' },
              { id: 'idDoc', label: 'Identity Document Copy' }
            ].map((doc) => (
              <div key={doc.id} className="flex flex-col gap-2">
                <span className="text-sm opacity-70 px-2 font-bold">{doc.label}</span>
                <label className={cn("flex items-center justify-between p-4 rounded-[24px] border-2 border-dashed cursor-pointer hover:bg-white/5 transition-all group", theme === 'dark' ? "border-white/10" : "border-black/5")}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Upload className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:text-[#D4AF37] transition-all" />
                    </div>
                    <span className="text-xs opacity-50 font-bold">{driverRegData[doc.id] ? driverRegData[doc.id].name : "Upload Image/PDF"}</span>
                  </div>
                  <CheckCircle2 className={cn("w-5 h-5 transition-all", driverRegData[doc.id] ? "text-green-500 opacity-100" : "opacity-0")} />
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setDriverRegData({...driverRegData, [doc.id]: e.target.files?.[0] || null})} />
                </label>
              </div>
            ))}
          </div>
        </section>
        
        {/* Consent */}
        <section className="glass p-6 rounded-[32px] border border-[#D4AF37]/20 space-y-4">
          <div className="flex gap-4">
            <input type="checkbox" className="w-6 h-6 rounded-lg accent-[#D4AF37] mt-1" id="bg-check" />
            <label htmlFor="bg-check" className="text-[11px] opacity-70 leading-relaxed">
              I hereby authorize <b>JoyDrive</b> to perform a comprehensive background check, including criminal record verification and driving history audit.
            </label>
          </div>
          <div className="flex gap-4">
            <input type="checkbox" className="w-6 h-6 rounded-lg accent-[#D4AF37] mt-1" id="terms-driver" />
            <label htmlFor="terms-driver" className="text-[11px] opacity-70 leading-relaxed">
              I agree to the Partner Terms of Service and understand that my account is subject to a 72-hour vetting process before activation.
            </label>
          </div>
        </section>

        <button onClick={() => { confetti(); setAppState('map'); }} className="w-full font-black py-6 rounded-[24px] shadow-2xl transition-all active:scale-[0.98] bg-[linear-gradient(135deg,_#00FF88_0%,_#D4AF37_50%,_#00FF88_100%)] text-black shadow-[0_0_30px_rgba(0,255,136,0.4)] border border-white/20 text-lg uppercase tracking-widest animate-pulse-slow">
          {t('confirmRegistration')}
        </button>
      </div>
    </div>
  </motion.div>
);

type AppState = 'landing' | 'onboarding' | 'auth' | 'map' | 'vehicle-selection' | 'searching' | 'driver-found' | 'simulation' | 'driver_reg' | 'driver-dashboard' | 'driver-navigation';

const OnboardingPage = ({ theme, t, setAppState, setUser }: { theme: string, t: (key: string) => string, setAppState: (s: AppState) => void, setUser: (u: any) => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    photo: "https://picsum.photos/seed/joy/100/100"
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setFormData(prev => ({ ...prev, photo: photoUrl }));
        // Also update the global user state so it reflects immediately
        if (typeof setUser === 'function') {
          setUser((prev: any) => ({ ...prev, photo: photoUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    const updatedUser = {
      name: (formData.firstName || formData.lastName) ? `${formData.firstName} ${formData.lastName}`.trim() : "Joy Guest",
      email: formData.email || "guest@joydrive.com",
      phone: formData.phone || "+27 00 000 0000",
      photo: formData.photo
    };
    setUser(updatedUser);
    localStorage.setItem('joydrive_user', JSON.stringify(updatedUser));
    confetti();
    setAppState('map');
  };

  const handleSocialConnect = (provider: string) => {
    setUser({
      name: `Elite ${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      phone: "+27 00 000 0000",
      photo: `https://picsum.photos/seed/${provider}/100/100`
    });
    confetti();
    setAppState('map');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("fixed inset-0 z-[120] flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar transition-colors duration-200", theme === 'dark' ? "bg-black" : "bg-white")}
    >
      <div className="w-full max-w-md space-y-8 py-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
             <label className="cursor-pointer group relative">
                <div className="relative w-20 h-20 flex items-center justify-center rounded-full glass border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] overflow-hidden">
                   {formData.photo ? (
                     <img src={formData.photo} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-10 h-10 text-[#D4AF37]" />
                   )}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-[#D4AF37]" />
                   </div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-1 -right-1 bg-[#D4AF37] p-1.5 rounded-full border-2 border-black"
                >
                  <Plus className="w-3 h-3 text-black" />
                </motion.div>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
             </label>
          </div>
          <h2 className="text-3xl font-display joy-gradient">{t('register')}</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">{t('tagline')}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 ml-2">{t('firstName')}</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  placeholder="John" 
                  className="w-full glass p-4 rounded-2xl outline-none focus:border-[#D4AF37]/50 transition-all text-sm" 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 ml-2">{t('postName')}</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Doe" 
                  className="w-full glass p-4 rounded-2xl outline-none focus:border-[#D4AF37]/50 transition-all text-sm" 
                />
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 ml-2">Phone Number</label>
             <input 
               type="tel" 
               value={formData.phone}
               onChange={e => setFormData({...formData, phone: e.target.value})}
               placeholder="+27 00 000 0000" 
               className="w-full glass p-4 rounded-2xl outline-none focus:border-[#D4AF37]/50 transition-all text-sm" 
             />
          </div>

          <div className="space-y-1">
             <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 ml-2">Gmail Address</label>
             <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="example@gmail.com" 
                  className="w-full glass p-4 rounded-2xl outline-none focus:border-[#D4AF37]/50 transition-all text-sm" 
                />
             </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleComplete}
              className="w-full bg-[#D4AF37] text-white font-bold py-5 rounded-2xl shadow-xl shadow-[#D4AF37]/20 border border-[#D4AF37]/50 active:scale-[0.98] transition-all brightness-90 hover:brightness-100"
            >
              Enter JoyDrive
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-white/30"><span className={cn("px-4", theme === 'dark' ? "bg-black" : "bg-white")}>Social Connect</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleSocialConnect('Gmail')} className="glass py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
               <Mail className="w-4 h-4 text-red-500" /> Gmail
            </button>
            <button onClick={() => handleSocialConnect('Facebook')} className="glass py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
               <Facebook className="w-4 h-4 text-blue-600" /> Facebook
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places", "geometry"];

export default function App() {
  const [mapViewPreference, setMapViewPreference] = useState<'close' | 'far'>('close');
  const [showMapViewPreference, setShowMapViewPreference] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('joydrive_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'dark';
  });

  const handlePreferenceSelection = (pref: 'close' | 'far') => {
    setMapViewPreference(pref);
    setZoom(pref === 'close' ? 18 : 14);
    setShowMapViewPreference(false);
    setAppState('landing');
  };

  const [lang, setLang] = useState('en');
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

  useEffect(() => {
    localStorage.setItem('joydrive_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);
  
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<{ name: string, email: string, phone: string, photo: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(RIDE_TYPES[0]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [stopAddress, setStopAddress] = useState('');
  const [showStopInput, setShowStopInput] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [tripDirections, setTripDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [pickupDirections, setPickupDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [remainingPath, setRemainingPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [remainingPickupPath, setRemainingPickupPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [vehiclePos, setVehiclePos] = useState<google.maps.LatLngLiteral | null>(null);
  const [driverInitialPos, setDriverInitialPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [driverPos, setDriverPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [aiInsight, setAiInsight] = useState("");
  const [heading, setHeading] = useState(0);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [mallEntrancePrompt, setMallEntrancePrompt] = useState<{show: boolean, type: "origin" | "dest" | "stop"}>({show: false, type: "origin"});
  const [selectedEntrance, setSelectedEntrance] = useState<string | null>(null);
  const [showInAppCall, setShowInAppCall] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected' | 'ended'>('idle');

  const isMallAddress = (address: string) => {
    const mallKeywords = ['mall', 'shopping center', 'centre commercial', 'plaza', 'boulevard mall', 'sandton city', 'mall of africa', 'galleria', 'arcade', 'hypermarket', 'supermarket', 'mart', 'emporium'];
    return mallKeywords.some(keyword => address.toLowerCase().includes(keyword));
  };

  const handleEntranceSelect = (entrance: string) => {
    setSelectedEntrance(entrance);
    if (mallEntrancePrompt.type === 'origin') {
      setOrigin(prev => `${prev} (${t('entrance')} ${entrance})`);
    } else if (mallEntrancePrompt.type === 'stop') {
      setStopAddress(prev => `${prev} (${t('entrance')} ${entrance})`);
    } else {
      setDestination(prev => `${prev} (${t('entrance')} ${entrance})`);
    }
    setMallEntrancePrompt(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    if (mapRef.current) {
      // Force darkMapOptions always as requested
      const currentOptions = darkMapOptions;
      mapRef.current.setOptions({
        ...currentOptions,
        styles: currentOptions.styles,
        mapId: '8ece9711e1c0c45c',
        backgroundColor: '#000000',
      });
    }
  }, [theme]);

  useEffect(() => {
    if (appState === 'vehicle-selection') {
      if (isMallAddress(origin) && !origin.includes(`(${t('entrance')}`)) {
        setMallEntrancePrompt({ show: true, type: 'origin' });
      } else if (showStopInput && isMallAddress(stopAddress) && !stopAddress.includes(`(${t('entrance')}`)) {
        setMallEntrancePrompt({ show: true, type: 'stop' });
      } else if (isMallAddress(destination) && !destination.includes(`(${t('entrance')}`)) {
        setMallEntrancePrompt({ show: true, type: 'dest' });
      }
    }
  }, [appState, origin, destination, stopAddress, showStopInput]);

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [showInAppMessage, setShowInAppMessage] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [history, setHistory] = useState<{id: string, from: string, to: string, date: string, price: number, rideType: string, status?: string, cancelReason?: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [favoriteDrivers, setFavoriteDrivers] = useState<{id: string, name: string}[]>([]);
  const [favoriteAddresses, setFavoriteAddresses] = useState<{id: string, name: string, address: string}[]>([]);
  const [frequentAddresses, setFrequentAddresses] = useState<{address: string, count: number}[]>(() => {
    const saved = localStorage.getItem('joydrive_frequent_addresses');
    return saved ? JSON.parse(saved) : [
      { address: "Sandton City Mall, Sandton", count: 1 },
      { address: "Mall of Africa, Waterfall City", count: 1 },
      { address: "Rosebank Mall, Johannesburg", count: 1 }
    ];
  });
  const [suggestedAddresses, setSuggestedAddresses] = useState<string[]>([]);
  const [isInputExpanded, setIsInputExpanded] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showDriverTripSummary, setShowDriverTripSummary] = useState(false);
  const [showRateClient, setShowRateClient] = useState(false);
  const [ratingToClient, setRatingToClient] = useState(0);
  const [driverCommentToClient, setDriverCommentToClient] = useState('');
  const [driverCity, setDriverCity] = useState('Johannesburg');
  const [lastCompletedTrip, setLastCompletedTrip] = useState<any>(null);
  const [showDriverRating, setShowDriverRating] = useState(false);
  const [driverRatingToUser, setDriverRatingToUser] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [showCardEntry, setShowCardEntry] = useState(false);
  const [showWalletEntry, setShowWalletEntry] = useState(false);
  const [savedCards, setSavedCards] = useState<{id: string, number: string, expiry: string, brand: string}[]>([
    { id: 'joy_1', number: '4242 4242 4242 4242', expiry: '12/28', brand: 'Joy Guest' }
  ]);
  const [digitalWallets, setDigitalWallets] = useState<{id: string, name: string, type: 'apple' | 'google', details: string}[]>([
    { id: 'google_1', name: 'Google Pay', type: 'google', details: 'abraham... @gmail.com' }
  ]);
  const [ratingData, setRatingData] = useState({ driver: 0, vehicle: 0, trip: 0, price: 0, comment: '' });
  const [showSplash, setShowSplash] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Keep splash disabled
    setShowSplash(false);
  }, []);
  const [eta, setEta] = useState(5);
  const [driverInfo, setDriverInfo] = useState({ 
    name: "Sibusiso", 
    rating: 4.9, 
    car: "Quantum X-1", 
    brand: "Toyota",
    model: "Quantum X-1",
    plate: "JOY-001-GP", 
    phone: "+27 78 800 2462", 
    color: "Obsidian Black",
    photo: "https://picsum.photos/seed/driver/100/100"
  });
  const [showChat, setShowChat] = useState(false);

  const [chatMessages, setChatMessages] = useState<{id: string, text: string, sender: 'user' | 'driver', time: string, status?: 'sent' | 'delivered' | 'read'}[]>([
    { id: 'initial-1', text: "Hello! I'm on my way.", sender: 'driver', time: '14:30', status: 'read' }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isDriverTyping, setIsDriverTyping] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);

  // Status simulation for own messages
  useEffect(() => {
    const lastMsgIdx = chatMessages.length - 1;
    const lastMsg = chatMessages[lastMsgIdx];
    
    if (!lastMsg) return;

    // If it's your own message and doesn't have a status or is just sent
    const isOwnerMessage = (lastMsg.sender === 'user' && appState !== 'driver-navigation') || 
                          (lastMsg.sender === 'driver' && appState === 'driver-navigation');

    if (isOwnerMessage) {
      if (!lastMsg.status) {
        setChatMessages(prev => {
          const next = [...prev];
          const idx = next.findIndex(m => m.id === lastMsg.id);
          if (idx !== -1) next[idx] = { ...lastMsg, status: 'sent' };
          return next;
        });
      } else if (lastMsg.status === 'sent') {
        const timer = setTimeout(() => {
          setChatMessages(prev => {
            const next = [...prev];
            const idx = next.findIndex(m => m.id === lastMsg.id);
            if (idx !== -1) next[idx].status = 'delivered';
            return next;
          });
        }, 1000);
        return () => clearTimeout(timer);
      } else if (lastMsg.status === 'delivered') {
        const timer = setTimeout(() => {
          setChatMessages(prev => {
            const next = [...prev];
            const idx = next.findIndex(m => m.id === lastMsg.id);
            if (idx !== -1) next[idx].status = 'read';
            return next;
          });
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [chatMessages, appState]);

  useEffect(() => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    const isOwnerMessage = lastMessage && ((lastMessage.sender === 'user' && appState !== 'driver-navigation') || 
                                           (lastMessage.sender === 'driver' && appState === 'driver-navigation'));

    if (lastMessage && isOwnerMessage) {
      const typeStartTimer = setTimeout(() => {
        setIsDriverTyping(true);
      }, 2000);

      const replyTimer = setTimeout(() => {
        setIsDriverTyping(false);
        const responses = [
          "I'm almost there!",
          "On my way, traffic is a bit heavy.",
          "I've arrived at the pickup point.",
          "Got it, see you soon!",
          "I'm following the GPS, will be there in a few minutes.",
          "Confirmed!",
          "Perfect, thanks."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const sender = appState === 'driver-navigation' ? 'user' : 'driver';
        setChatMessages(prev => [...prev, { 
          id: 'sim-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          text: randomResponse, 
          sender, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }]);
      }, 5000);

      return () => {
        clearTimeout(typeStartTimer);
        clearTimeout(replyTimer);
      };
    }
  }, [chatMessages, appState]);
  const [paymentMethod, setPaymentMethod] = useState<string>('joy_1');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, text: string, time: string}[]>([
    { id: '1', text: 'Welcome to JoyDrive! Enjoy your first ride.', time: 'Just now' }
  ]);
  const [zoom, setZoom] = useState(19);
  const [isTrafficJam, setIsTrafficJam] = useState(false);
  const [polylineKey, setPolylineKey] = useState(Date.now());
  const [showMovingDetails, setShowMovingDetails] = useState(false);
  const [movingDetails, setMovingDetails] = useState<{
    furniture: { id: string, name: string, photo: string | null }[],
    truckSize: 'Small' | 'Medium' | 'Large',
    estimatedPrice: number
  }>({
    furniture: [],
    truckSize: 'Medium',
    estimatedPrice: 0
  });
  const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
  const [showMovingNegotiation, setShowMovingNegotiation] = useState(false);
  const [showCommunication, setShowCommunication] = useState(false);
  const [commTab, setCommTab] = useState<'chat' | 'call'>('chat');
  const [predictedDestination, setPredictedDestination] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [tempFurnitureName, setTempFurnitureName] = useState("");
  const [driverOfferPrice, setDriverOfferPrice] = useState<string>("");
  const [userOfferPrice, setUserOfferPrice] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showDriverCamera, setShowDriverCamera] = useState(false);
  const [examiningDriversCount, setExaminingDriversCount] = useState(0);
  const [driverProposedPrice, setDriverProposedPrice] = useState<number | null>(null);
  const [offerCountdown, setOfferCountdown] = useState(15);
  const [isDriverAtPickup, setIsDriverAtPickup] = useState(false);
  const [waitTimer, setWaitTimer] = useState(300); // 5 minutes in seconds
  const [waitingPenalty, setWaitingPenalty] = useState(0);
  const [consecutiveDeclines, setConsecutiveDeclines] = useState(0);
  const [driverSimulationStartTime, setDriverSimulationStartTime] = useState<number | null>(null);
  const [pendingJoyMovingAcceptance, setPendingJoyMovingAcceptance] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' | 'info' } | null>(null);
  const [isManualMapControl, setIsManualMapControl] = useState(false);
  const [showDriverTermsModal, setShowDriverTermsModal] = useState(false);
  const [parcelSecretCode, setParcelSecretCode] = useState<string>("");
  const [isVerifyingParcelCode, setIsVerifyingParcelCode] = useState(false);
  const [userInputParcelCode, setUserInputParcelCode] = useState("");
  const [showParcelCodeSetup, setShowParcelCodeSetup] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [currentRoad, setCurrentRoad] = useState<string>("");

  useEffect(() => {
    if (mapRef.current && appState === 'driver-navigation' && !isManualMapControl) {
      const gMap = mapRef.current as any;
      const navCenter = getNavCenter(userLocation, heading, 0.005);
      gMap.setOptions({
        center: navCenter,
        heading: heading,
        tilt: 65, // Increased tilt for 3D navigation
        zoom: 16.5,
        gestureHandling: 'greedy'
      });
      setMapCenter(navCenter);
    }
  }, [heading, appState, userLocation, isManualMapControl]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDriverAtPickup && appState === 'driver-found') {
      interval = setInterval(() => {
        setWaitTimer(prev => {
          if (prev <= 0) {
            // After 5 mins, add penalty
            const secondsOver = Math.abs(prev);
            if (secondsOver > 0 && secondsOver % 60 === 0) {
              setWaitingPenalty(p => p + 1);
            }
            return prev - 1;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setWaitingPenalty(0);
    }
    return () => clearInterval(interval);
  }, [isDriverAtPickup, appState]);

  useEffect(() => {
    let interval: any;
    if (showInAppCall && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [showInAppCall, callStatus]);

  useEffect(() => {
    if (showInAppCall && callStatus === 'calling') {
      const timeout = setTimeout(() => {
        setCallStatus('ringing');
      }, 2000);
      return () => clearTimeout(timeout);
    }
    if (showInAppCall && callStatus === 'ringing') {
      const timeout = setTimeout(() => {
        setCallStatus('connected');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [showInAppCall, callStatus]);

  const requestOrientationPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          console.log("Device orientation permission granted");
        }
      } catch (e) {
        console.error("Error requesting orientation permission:", e);
      }
    }
  };

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Prioritize webkitCompassHeading for high-accuracy iOS magnetic north
      const compass = (e as any).webkitCompassHeading;
      if (compass !== undefined) {
        setHeading(compass);
      } else if (e.alpha !== null) {
        // Handle standard alpha (degrees around z-axis)
        // Reversing alpha for Android consistency (0 is north, incrementing counter-clockwise usually)
        setHeading(360 - e.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    // Fallback for newer device orientation absolute
    window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
    };
  }, []);

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setCallStatus('calling');
    setShowInAppCall(true);
    setShowContactModal(false);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movingVideoRef = useRef<HTMLVideoElement>(null);
  const movingCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);

  const speak = (text: string, forceLang?: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Play a subtle navigation chime before speaking
    const chime = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    chime.volume = 0.4;
    chime.play().catch(() => {});

    const utterance = new SpeechSynthesisUtterance(text);
    // User requested female voice in English specifically for navigation
    const targetLang = forceLang || (lang === 'fr' ? 'fr-FR' : 'en-US');
    utterance.lang = targetLang;
    
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // More aggressive search for high-quality female English voices
      const femaleVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const genderTerms = ['female', 'zira', 'samantha', 'victoria', 'premium', 'google us english'];
        const isEnglish = v.lang.startsWith('en');
        const isFeminine = genderTerms.some(term => name.includes(term));
        
        if (targetLang.startsWith('en')) {
          return isEnglish && isFeminine;
        }
        return v.lang.startsWith(targetLang.split('-')[0]) && isFeminine;
      }) || voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google'))) || voices[0];
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.pitch = 1.15; // Feminine tone
      utterance.rate = 1.0; 
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  };

  const shareLocation = () => {
    if (userLocation || vehiclePos) {
      const pos = vehiclePos || userLocation;
      const mapUrl = `https://www.google.com/maps?q=${pos?.lat},${pos?.lng}`;
      const text = lang === 'fr' 
        ? `Suivez mon trajet JoyDrive en temps réel ici : ${mapUrl}`
        : `Track my JoyDrive ride in real-time here: ${mapUrl}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'JoyDrive Tracking',
          text: text,
          url: mapUrl,
        }).catch(() => {
          // Fallback if sharing was cancelled or failed
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        speak(lang === 'fr' ? "Lien de suivi copié dans le presse-papier" : "Tracking link copied to clipboard");
      }
    }
  };

  const toggleFavoriteDriver = (driverName: string) => {
    setFavoriteDrivers(prev => {
      const exists = prev.find(d => d.name === driverName);
      if (exists) {
        return prev.filter(d => d.name !== driverName);
      } else {
        confetti();
        return [...prev, { id: 'driver-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5), name: driverName }];
      }
    });
  };

  const [countryInfo, setCountryInfo] = useState({
    code: 'ZA',
    currency: 'R',
    flag: '🇿🇦',
    name: 'South Africa'
  });

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
          const currencyMap: { [key: string]: { currency: string, flag: string, name: string } } = {
            'ZA': { currency: 'R', flag: '🇿🇦', name: 'South Africa' },
            'FR': { currency: '€', flag: '🇫🇷', name: 'France' },
            'US': { currency: '$', flag: '🇺🇸', name: 'USA' },
            'GB': { currency: '£', flag: '🇬🇧', name: 'UK' },
            'CD': { currency: '$', flag: '🇨🇩', name: 'DR Congo' },
            'NG': { currency: '₦', flag: '🇳🇬', name: 'Nigeria' },
            'KE': { currency: 'KSh', flag: '🇰🇪', name: 'Kenya' }
          };
          
          const info = currencyMap[data.country_code] || { 
            currency: data.currency || '$', 
            flag: ``, // Fallback flag logic could be added
            name: data.country_name || 'Unknown' 
          };
          
          setCountryInfo({
            code: data.country_code,
            currency: info.currency,
            flag: info.flag || '🌐',
            name: info.name
          });
        }
      } catch (error) {
        // Silently fallback to timezone detection if API is blocked or offline
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes('Paris') || tz.includes('Europe/')) {
          setCountryInfo({ code: 'FR', currency: '€', flag: '🇫🇷', name: 'France' });
        } else if (tz.includes('Johannesburg') || tz.includes('Africa/')) {
          setCountryInfo({ code: 'ZA', currency: 'R', flag: '🇿🇦', name: 'South Africa' });
        } else if (tz.includes('America/')) {
          setCountryInfo({ code: 'US', currency: '$', flag: '🇺🇸', name: 'USA' });
        } else if (tz.includes('London')) {
          setCountryInfo({ code: 'GB', currency: '£', flag: '🇬🇧', name: 'UK' });
        }
      }
    };
    detectCountry();
  }, []);

  const [mapStyle, setMapStyle] = useState<'dark' | 'futuristic' | 'minimalist' | 'satellite'>('dark');
  const [showMapStyles, setShowMapStyles] = useState(false);

  const getMapOptions = () => {
    // Force light style for driver
    if (appState === 'driver-navigation' || appState === 'driver-dashboard' || appState === 'driver_reg') {
      return {}; 
    }
    
    switch (mapStyle) {
      case 'futuristic': return futuristicMapOptions;
      case 'minimalist': return minimalistMapOptions;
      case 'satellite': return satelliteMapOptions;
      default: return (theme === 'dark' || mapStyle === 'dark') ? darkMapOptions : {};
    }
  };

  const [driverRegData, setDriverRegData] = useState({ 
    firstName: '',
    lastName: '',
    email: '',
    phone: '', 
    carModel: '',
    plateNumber: '',
    color: '', 
    license: null as File | null, 
    vehicleDocs: null as File | null,
    profilePhoto: null as string | null,
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: '',
    acceptedTerms: false
  });
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const CANCEL_REASONS = [
    { id: 'too_long', en: "Wait time too long", fr: "Temps d'attente trop long" },
    { id: 'wrong_address', en: "Wrong address entered", fr: "Mauvaise adresse saisie" },
    { id: 'changed_mind', en: "Changed my mind", fr: "J'ai changé d'avis" },
    { id: 'found_other', en: "Found another ride", fr: "J'ai trouvé un autre trajet" },
    { id: 'other', en: "Other", fr: "Autre" }
  ];

  const handleCancelTrip = (reason: string) => {
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    setCancelReason(reason);
    setAppState('map');
    setShowCancelModal(false);
    setDirections(null);
    setTripDirections(null);
    setPickupDirections(null);
    setRemainingPath([]);
    setRemainingPickupPath([]);
    setPickupStarted(false);
    setIsDriverAtPickup(false);
    setVehiclePos(null);
    setDriverInitialPos(null);
    setNotifications(prev => [{ id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5), text: lang === 'fr' ? "Trajet annulé" : "Trip cancelled", time: 'Just now' }, ...prev]);
    setShowNotifications(true);
  };

  const [showDriverSuccess, setShowDriverSuccess] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);
  const [showPromos, setShowPromos] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [rideFilter, setRideFilter] = useState<'recommended' | 'fastest' | 'cheapest'>('recommended');

  useEffect(() => {
    if (appState === 'vehicle-selection' && tripDirections) {
      const distanceKm = tripDirections.routes[0].legs[0].distance.value / 1000;
      const durationMin = Math.ceil(tripDirections.routes[0].legs[0].duration.value / 60);
      
      const enhancedRides = RIDE_TYPES.map(ride => {
        const serviceFee = 5;
        const calculatedPrice = ride.id === 'joy_moving' ? 0 : Math.ceil(ride.basePrice + (distanceKm * ride.pricePerKm) + serviceFee + waitingPenalty);
        const calculatedTime = `${Math.max(1, Math.ceil(durationMin * (ride.id === 'joy_lite' ? 1.2 : ride.id === 'joy_express' ? 0.8 : 1)))} min`;
        return { ...ride, calculatedPrice, calculatedTime };
      });

      const sortedRides = [...enhancedRides].sort((a, b) => {
        if (rideFilter === 'cheapest') return a.calculatedPrice - b.calculatedPrice;
        if (rideFilter === 'fastest') return parseInt(a.calculatedTime) - parseInt(b.calculatedTime);
        return 0;
      });

      setSelectedRide(sortedRides[0]);
    }
  }, [appState, tripDirections, rideFilter]);
  const [driverRequests, setDriverRequests] = useState<{
    id: string, 
    customer: string, 
    from: string, 
    to: string, 
    price: number, 
    distance: string, 
    city?: string,
    type?: string,
    movingDetails?: {
      furniture: { id: string, name: string, photo: string | null }[],
      truckSize: string,
      estimatedPrice: number
    }
  }[]>([]);
  const [activeDriverRequest, setActiveDriverRequest] = useState<any>(null);
  const [driverEarnings, setDriverEarnings] = useState(1250.50); // Initial balance for demo
  const [driverTripHistory, setDriverTripHistory] = useState<any[]>([
    {
      id: 'trip-prev-1',
      customer: 'Sarah M.',
      from: 'Sandton City',
      to: 'OR Tambo Airport',
      date: 'Today, 10:30 AM',
      rideType: 'JoyDrive Premium',
      breakdown: {
        baseFare: "45.00",
        perKm: "8.50",
        distance: 12.4,
        surge: "15.00",
        bonuses: "0.00",
        penalties: "0.00",
        total: "165.40"
      }
    },
    {
      id: 'trip-prev-2',
      customer: 'John D.',
      from: 'Rosebank',
      to: 'Melville',
      date: 'Today, 09:15 AM',
      rideType: 'JoyDrive Go',
      breakdown: {
        baseFare: "25.00",
        perKm: "6.00",
        distance: 8.2,
        surge: "0.00",
        bonuses: "5.00",
        penalties: "0.00",
        total: "79.20"
      }
    }
  ]);
  const [showDriverEarningsDetails, setShowDriverEarningsDetails] = useState(false);
  const [selectedTripForBreakdown, setSelectedTripForBreakdown] = useState<any>(null);
  const [driverNavState, setDriverNavState] = useState<'to-customer' | 'to-destination'>('to-customer');
  const [showPayouts, setShowPayouts] = useState(false);
  const [payoutPreferences, setPayoutPreferences] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    branchCode: ''
  });
  const [payoutHistory, setPayoutHistory] = useState<{id: string, amount: number, date: string, status: 'Pending' | 'Completed'}[]>([]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    mapIds: ['8ece9711e1c0c45c'] // Enable advanced 3D rotation/tilt
  });

  useEffect(() => {
    if (isLoaded && !autocompleteService) {
      setAutocompleteService(new google.maps.places.AutocompleteService());
    }
  }, [isLoaded, autocompleteService]);

  const fetchSuggestions = useCallback((input: string) => {
    if (!input) {
      setSuggestedAddresses(frequentAddresses.map(a => a.address));
      return;
    }

    if (autocompleteService) {
      autocompleteService.getPlacePredictions(
        { input, types: ['geocode'], componentRestrictions: { country: 'za' } },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const googleAddrs = predictions.map(p => p.description);
            const memoryAddrs = frequentAddresses
              .filter(a => a.address.toLowerCase().includes(input.toLowerCase()))
              .map(a => a.address);
            
            const combined = Array.from(new Set([...googleAddrs, ...memoryAddrs]));
            setSuggestedAddresses(combined);
          }
        }
      );
    }
  }, [autocompleteService, frequentAddresses]);

  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destRef = useRef<google.maps.places.Autocomplete | null>(null);
  const stopRef = useRef<google.maps.places.Autocomplete | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userLocation && !mapRef.current?.getCenter()) {
      // Initial center on user
    }
  }, [userLocation]);

  useEffect(() => {
    if (isLoaded && navigator.geolocation) {
      const handleInitialLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(newPos);
            if (pos.coords.heading !== null) setHeading(pos.coords.heading);
            // Strong auto-center on startup
            if (mapRef.current) {
              mapRef.current.panTo(newPos);
              mapRef.current.setZoom(14.5);
            }
          },
          (err) => console.warn("Initial location check failed:", err.message),
          { enableHighAccuracy: true, timeout: 5000 }
        );

        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(newPos);
            // GPS Heading only works when moving, we prioritize Device Orientation if available
            if (pos.coords.heading !== null) setHeading(pos.coords.heading);
            
            // Auto center if we're in map state and no destination is set yet
            if (!destination && appState === 'map' && mapRef.current) {
              // mapRef.current.panTo(newPos); // Optional: constant following
            }
          },
          (err) => console.warn("Location tracking failed:", err.message),
          { enableHighAccuracy: true }
        );

        return () => {
          navigator.geolocation.clearWatch(watchId);
        };
      };

      handleInitialLocation();
    }
  }, [isLoaded]); // Trigger when Google Maps is ready

  useEffect(() => {
    if (appState === 'landing') {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (user) setAppState('map');
              else setAppState('auth');
            }, 500); // Reduced from 3000ms
            return 100;
          }
          return prev + 5; // Faster increment (5% instead of 1%)
        });
      }, 30); // 30ms * 20 steps = 600ms total progress + 500ms wait = ~1.1s total duration
      return () => clearInterval(interval);
    }
  }, [appState, user]);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setNotifications(prev => [{ id: Date.now().toString() + '-promo-' + Math.random().toString(36).substr(2, 5), text: 'New promotion available! 20% off your next Joy VIP ride.', time: 'Just now' }, ...prev]);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (appState === 'driver-dashboard' && driverRequests.length === 0) {
      const timer = setTimeout(() => {
          setDriverRequests([
            { 
              id: 'req_moving_1', 
              customer: 'Abraham Moving', 
              from: 'Sandton City, Johannesburg', 
              to: 'Rosebank Mall', 
              price: 0, 
              distance: '5.2 km',
              city: 'Johannesburg',
              type: 'joy_moving',
              movingDetails: {
                furniture: [
                  { id: '1', name: 'Sofa', photo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=200' },
                  { id: '2', name: 'Table', photo: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=200' }
                ],
                truckSize: 'Medium',
                estimatedPrice: 850
              }
            },
            { 
              id: 'req_short', 
              customer: 'Test User', 
              from: 'Sandton City, Johannesburg', 
              to: 'Nelson Mandela Square', 
              price: 50, 
              distance: '0.5 km',
              city: 'Johannesburg'
            },
            { 
              id: 'req_1', 
              customer: 'Sarah Connor', 
              from: 'Sandton City, Johannesburg', 
              to: 'OR Tambo International Airport', 
              price: 450, 
              distance: '25 km',
              city: 'Johannesburg'
            },
            { 
              id: 'req_2', 
              customer: 'John Wick', 
              from: 'The Continental Hotel', 
              to: 'Rosebank Mall', 
              price: 120, 
              distance: '5 km',
              city: 'Johannesburg'
            },
            { 
              id: 'req_3', 
              customer: 'Elena Fisher', 
              from: 'V&A Waterfront, Cape Town', 
              to: 'Table Mountain', 
              price: 200, 
              distance: '8 km',
              city: 'Cape Town'
            }
          ]);
        setNotifications(prev => [{ id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5), text: t('newRequest'), time: 'Just now' }, ...prev]);
        setShowNotifications(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appState, driverRequests.length, lang]);

  const acceptRequest = (req: any) => {
    setActiveDriverRequest(req);
    setDriverNavState('to-customer');
    setAppState('driver-navigation');
    setDriverRequests([]);
    setConsecutiveDeclines(0); // Reset declines on accept
    setDriverSimulationStartTime(Date.now());
    
    // Start driver simulation
    startDriverSimulation(req);
  };

  const handleDeclineRequest = (reqId: string) => {
    setDriverRequests(prev => prev.filter(r => r.id !== reqId));
    setConsecutiveDeclines(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setDriverEarnings(curr => curr - 10);
        setNotifications(prevNotif => [{ 
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5), 
          text: lang === 'fr' ? "Pénalité: 10 R déduits pour refus répétés." : "Penalty: R10 deducted for repeated declines.", 
          time: 'Just now' 
        }, ...prevNotif]);
        return 0; // Reset after penalty
      }
      return newCount;
    });
  };

  const handleDriverCancelTrip = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    if (driverNavState === 'to-customer') {
      const timeElapsed = driverSimulationStartTime ? (Date.now() - driverSimulationStartTime) / 1000 : 0;
      // If driver cancels after 15 seconds of navigating to customer, they are "late" or taking too long
      const isLate = timeElapsed > 15; 
      if (isLate) {
        setDriverEarnings(prev => prev - 20);
        setNotifications(prev => [{ 
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5), 
          text: lang === 'fr' ? "Pénalité: 20 R déduits pour annulation tardive." : "Penalty: R20 deducted for late cancellation.", 
          time: 'Just now' 
        }, ...prev]);
      } else {
        setNotifications(prev => [{ id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5), text: lang === 'fr' ? "Trajet annulé." : "Trip cancelled.", time: 'Just now' }, ...prev]);
      }
    }

    setAppState('driver-dashboard');
    setActiveDriverRequest(null);
    setRemainingPath([]);
    setDriverSimulationStartTime(null);
  };

  const startDriverSimulation = (req: any) => {
    console.log("Starting driver simulation for request:", req);
    if (!google) {
      console.error("Google Maps API not loaded");
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    
    // Clear previous directions
    setDirections(null);
    setRemainingPath([]);
    
    // 1. Navigate to customer
    directionsService.route({
      origin: userLocation || center,
      destination: req.from,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      console.log("Driver navigation to customer status:", status);
      if (status === google.maps.DirectionsStatus.OK && result) {
        // DO NOT setDirections(result) here to avoid showing the full line
        setOriginPos({ lat: result.routes[0].legs[0].end_location.lat(), lng: result.routes[0].legs[0].end_location.lng() });
        const path = result.routes[0].overview_path;
        const steps = result.routes[0].legs[0].steps;
        let index = 0;
        let subIndex = 0;
        let spokenStepIndices = new Set<number>();
        const subSteps = 15; // Faster and smoother tracking
        
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = setInterval(() => {
          if (index >= path.length - 1) {
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
            console.log("Driver arrived at customer - waiting for manual pickup confirmation");
            setNotifications(prev => [{ id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5), text: lang === 'fr' ? "Vous êtes arrivé chez le client" : "You have arrived at the customer", time: 'Just now' }, ...prev]);
            setShowNotifications(true);
            speak(lang === 'fr' ? "Vous êtes arrivé chez le client." : "You have arrived at the customer's location.");
            // We STOP here. The driver must manually click "I HAVE PICKED UP THE CUSTOMER"
            return;
          }
          
          const cPos = path[index];
          const nPos = path[index + 1];
          const lat = cPos.lat() + (nPos.lat() - cPos.lat()) * (subIndex / subSteps);
          const lng = cPos.lng() + (nPos.lng() - cPos.lng()) * (subIndex / subSteps);
          const currentPosLiteral = { lat, lng };
          
          const headingValue = google.maps.geometry.spherical.computeHeading(cPos, nPos);
          setHeading(headingValue);
          setUserLocation(currentPosLiteral);
          
          const inTrafficRange = (path.length - index) > 10 && (path.length - index) < 25;
          setIsTrafficJam(inTrafficRange);
          
          // Update speed for driver too
          setCurrentSpeed(Math.floor(40 + Math.random() * 25));

          if (mapRef.current && (isDriver || appState === 'driver-navigation')) {
            const navCenter = getNavCenter(currentPosLiteral, headingValue, 0.0003);
            (mapRef.current as any).setOptions({
              center: navCenter,
              heading: headingValue,
              tilt: 75
            });
            setMapCenter(navCenter);
            
            if (subIndex === 0) {
              // Voice navigation to customer with distance check - Always En
              steps.forEach((step, idx) => {
                  if (!spokenStepIndices.has(idx)) {
                    const dist = google.maps.geometry.spherical.computeDistanceBetween(
                      new google.maps.LatLng(lat, lng),
                      step.start_location
                    );
                    if (dist < 40) {
                      const cleanText = step.instructions.replace(/<[^>]*>/g, '');
                      speak(cleanText, 'en-US');
                      spokenStepIndices.add(idx);
                    }
                  }
                });
              }
            }
            
            const futurePathLiterals = path.slice(index + 1).map(p => ({ lat: p.lat(), lng: p.lng() }));
            setRemainingPath([currentPosLiteral, ...futurePathLiterals]); 
            setPolylineKey(Date.now());

            if (subIndex === 0) {
              const remainingSteps = path.length - index;
              setEta(Math.max(1, Math.ceil(remainingSteps * 0.8)));

              // Passenger sees traffic too
              if (remainingSteps < 8 && remainingSteps > 3) {
                setIsTrafficJam(true);
              } else {
                setIsTrafficJam(false);
              }
            }

          subIndex++;
          if (subIndex >= subSteps) {
            subIndex = 0;
            index++;
          }
        }, 50); // Improved frequency for fluidity
      } else {
        console.error("Directions request failed:", status);
      }
    });
  };

  const startDestinationSimulation = (req: any) => {
    console.log("Starting driver simulation to destination for request:", req);
    if (!google) return;
    const directionsService = new google.maps.DirectionsService();

    // 2. Navigate to destination
    directionsService.route({
      origin: userLocation || req.from,
      destination: req.to,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (res, stat) => {
      console.log("Driver navigation to destination status:", stat);
      if (stat === google.maps.DirectionsStatus.OK && res) {
        // DO NOT setDirections(res) here to avoid showing the full line
        setDestinationPos({ lat: res.routes[0].legs[0].end_location.lat(), lng: res.routes[0].legs[0].end_location.lng() });
        const tripPath = [...res.routes[0].overview_path];
        const finalLoc = res.routes[0].legs[0].end_location;
        const destSteps = res.routes[0].legs[0].steps;
        tripPath.push(finalLoc);
        let tIndex = 0;
        let tSubIndex = 0;
        let tSpokenIndices = new Set<number>();
        const subSteps = 15;
        
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = setInterval(() => {
          if (tIndex >= tripPath.length - 1) {
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
            console.log("Driver arrived at destination");
            speak(lang === 'fr' ? "Vous êtes arrivé à destination." : "You have arrived at your destination.");
            completeDriverTrip();
            return;
          }
          
          const cPos = tripPath[tIndex];
          const nPos = tripPath[tIndex + 1];
          const lat = cPos.lat() + (nPos.lat() - cPos.lat()) * (tSubIndex / subSteps);
          const lng = cPos.lng() + (nPos.lng() - cPos.lng()) * (tSubIndex / subSteps);
          const currentPosLiteral = { lat, lng };
          
          const headingValue = google.maps.geometry.spherical.computeHeading(cPos, nPos);
          setHeading(headingValue);
          setUserLocation(currentPosLiteral);
          
          const inTrafficRange = (tripPath.length - tIndex) > 10 && (tripPath.length - tIndex) < 25;
          setIsTrafficJam(inTrafficRange);
          
          // Update speed for driver too
          setCurrentSpeed(Math.floor(40 + Math.random() * 25));

          if (mapRef.current && (isDriver || appState === 'driver-navigation')) {
            const navCenter = getNavCenter(currentPosLiteral, headingValue, 0.005);
            (mapRef.current as any).setOptions({
              center: navCenter,
              heading: headingValue,
              tilt: 75,
              zoom: 16.5
            });
            setMapCenter(navCenter);
            
            if (tSubIndex === 0) {
              // Voice navigation with distance-based trigger - Always En for professional comfort
              destSteps.forEach((step, idx) => {
                if (!tSpokenIndices.has(idx)) {
                  const dist = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(lat, lng),
                    step.start_location
                  );
                  if (dist < 40) {
                    const cleanText = step.instructions.replace(/<[^>]*>/g, '');
                    speak(cleanText, 'en-US');
                    tSpokenIndices.add(idx);
                  }
                }
              });
            }
          }
              
          const futurePathLiterals = tripPath.slice(tIndex + 1).map(p => ({ lat: p.lat(), lng: p.lng() }));
          setRemainingPath([currentPosLiteral, ...futurePathLiterals]); 
          setPolylineKey(Date.now());

          if (tSubIndex === 0) {
            const remainingSteps = tripPath.length - tIndex;
            // Traffic simulation: Red zone if remaining steps between 15 and 35
            const inTrafficRange = remainingSteps > 15 && remainingSteps < 35;
            setIsTrafficJam(inTrafficRange);
            
            setEta(Math.max(1, Math.ceil(remainingSteps * 0.8)));
          }

          tSubIndex++;
          if (tSubIndex >= subSteps) {
            tSubIndex = 0;
            tIndex++;
          }
        }, 100); // High frequency (100ms) for fluidity
      }
    });
  };

  const completeDriverTrip = () => {
    console.log("Completing driver trip...");
    if (activeDriverRequest) {
      const price = typeof activeDriverRequest.price === 'number' ? activeDriverRequest.price : parseFloat(activeDriverRequest.price) || 0;
      
      // Calculate breakdown for simulation/demo
      const baseFare = (price * 0.35).toFixed(2);
      const distVal = parseFloat(activeDriverRequest.distance) || 5.4;
      const perKmRate = ((price * 0.5) / distVal).toFixed(2);
      const isSurge = Math.random() > 0.7;
      const surgeVal = isSurge ? (price * 0.15).toFixed(2) : "0.00";
      const bonusVal = Math.random() > 0.8 ? "5.00" : "0.00";
      const penaltyVal = waitingPenalty.toFixed(2);
      const finalTotal = (parseFloat(price.toString()) + parseFloat(bonusVal) - parseFloat(penaltyVal)).toFixed(2);

      const tripData = {
        ...activeDriverRequest,
        id: 'trip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        date: new Date().toLocaleString(),
        breakdown: {
          baseFare,
          perKm: perKmRate,
          distance: distVal,
          surge: surgeVal,
          bonuses: bonusVal,
          penalties: penaltyVal,
          total: finalTotal
        }
      };

      setDriverEarnings(prev => prev + parseFloat(finalTotal));
      setDriverTripHistory(prev => [tripData, ...prev]);
      setLastCompletedTrip(tripData);
      setRatingToClient(0);
      setShowRateClient(true);
    }
    setActiveDriverRequest(null);
    setAppState('driver-dashboard');
    setRemainingPath([]);
    setDirections(null);
    try {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error("Confetti error:", e);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider !== 'Manual') {
      setUser({
        name: `Joy User (${provider})`,
        email: "user@joydrive.com",
        phone: "+243 00 000 0000",
        photo: `https://picsum.photos/seed/${provider}/100/100`
      });
    }
    setShowMapViewPreference(true);
    setAppState('map');
  };

  const [originPos, setOriginPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationPos, setDestinationPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectionPoint, setSelectionPoint] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLockingFocus, setIsLockingFocus] = useState(false);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const clearSelection = () => {
    setSelectionPoint(null);
    setIsLockingFocus(false);
    setIsInputExpanded(null);
  };

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !isInputExpanded) return;
    
    const latLng = e.latLng.toJSON();
    setSelectionPoint(latLng);
    setIsLockingFocus(true);

    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    geocoderRef.current.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const address = results[0].formatted_address;
        if (isInputExpanded === 'origin') {
          setOrigin(address);
          setOriginPos(latLng);
        } else if (isInputExpanded === 'dest') {
          setDestination(address);
          setDestinationPos(latLng);
        } else if (isInputExpanded === 'stop') {
          setStopAddress(address);
        }
      }
    });
  };

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSimulation = () => {
    console.log("startSimulation called", { hasTripDirections: !!tripDirections });
    if (!tripDirections || !tripDirections.routes || tripDirections.routes.length === 0) {
      console.error("Cannot start simulation: tripDirections is invalid", tripDirections);
      return;
    }
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    const route = tripDirections.routes[0];
    if (!route || !route.legs || route.legs.length === 0) {
      console.error("Cannot start simulation: route or legs missing");
      return;
    }

    const path = [...route.overview_path];
    const steps = [...route.legs[0].steps];
    const endLoc = route.legs[0].end_location;
    
    if (!path || path.length === 0) {
      console.error("Cannot start simulation: path is empty");
      return;
    }
    
    setDestinationPos({ lat: endLoc.lat(), lng: endLoc.lng() });
    setAppState('simulation');
    setIsManualMapControl(false);
    setPolylineKey(Date.now());
    setDirections(null); // Ensure directions are cleared
    setSelectionPoint(null); // Clear selection blue pin
    console.log("Simulation started with path length:", path.length);
    
    // Fit bounds for simulation - balanced padding
    if (mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      path.forEach(p => bounds.extend(p));
      mapRef.current.fitBounds(bounds, { top: 100, bottom: 120, left: 60, right: 60 });
      setMapCenter(mapRef.current.getCenter()?.toJSON() || null);
      setZoom(16.5);
    }
    
    // Clear directions to ensure DirectionsRenderer is unmounted
    setDirections(null);
    const newRide = {
      id: Math.random().toString(36).substr(2, 9),
      from: origin,
      to: destination,
      date: new Date().toLocaleString(),
      price: (selectedRide as any).calculatedPrice || selectedRide.price,
      rideType: selectedRide.name,
      status: 'Completed'
    };
    setHistory(prev => [newRide, ...prev]);

    setRemainingPath(path.map(p => ({ lat: p.lat(), lng: p.lng() })));
    setVehiclePos({ lat: path[0].lat(), lng: path[0].lng() }); // Set initial vehicle position
    let index = 0;
    let subIndex = 0;
    let spokenStepIndices = new Set<number>();
    const subSteps = 40; // Ultra-smooth 40 sub-steps per segment
    const intervalTime = 25; // Speed increased by another 15% (29 -> 25)

    simulationIntervalRef.current = setInterval(() => {
      if (index >= path.length - 1) {
        // Ensure we reach the exact final destination point
        const finalPos = path[path.length - 1];
        const finalLiteral = { lat: finalPos.lat(), lng: finalPos.lng() };
        setVehiclePos(finalLiteral);
        setRemainingPath([]);
        
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        const arrivalSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        arrivalSound.play().catch(() => {});
        speak(lang === 'fr' ? "Vous êtes arrivé à destination." : "You have arrived at your destination.");
        
        setTimeout(() => {
          if (selectedRide?.id === 'joy_parcels') {
            setIsVerifyingParcelCode(true);
            setUserInputParcelCode("");
          } else {
            setDriverRatingToUser(0); 
            setShowDriverRating(true);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          }
          
          setIsDriverAtPickup(false);
          setAppState('map');
          setMapCenter(null);
          setRemainingPath([]);
          setVehiclePos(null);
        }, 3000);
        return;
      }

      const currentPos = path[index];
      const nextPos = path[index + 1];
      
      const lat = currentPos.lat() + (nextPos.lat() - currentPos.lat()) * (subIndex / subSteps);
      const lng = currentPos.lng() + (nextPos.lng() - currentPos.lng()) * (subIndex / subSteps);
      const currentPosLiteral = { lat, lng };
      
      const headingValue = google.maps.geometry.spherical.computeHeading(currentPos, nextPos);
      setHeading(headingValue);
      setVehiclePos(currentPosLiteral);
      
      const inTrafficRange = (path.length - index) > 10 && (path.length - index) < 25;
      setIsTrafficJam(inTrafficRange);
      
      // Center map on vehicle during trip if not manual (3D Navigation Mode)
      if (mapRef.current && !isManualMapControl) {
        const nextCenter = getNavCenter(currentPosLiteral, headingValue, 0.002);
        setMapCenter(nextCenter);
        (mapRef.current as any).setOptions({
          center: nextCenter,
          heading: headingValue,
          tilt: 75,
          zoom: 17.5, // Slightly wider for safer peripheral view
          gestureHandling: 'greedy'
        });
      }

      // Dynamic route line: perfectly follow the vehicle
      const futurePathLiterals = path.slice(index + 1).map(p => ({ lat: p.lat(), lng: p.lng() }));
      setRemainingPath([{ lat, lng }, ...futurePathLiterals]); 

      if (subIndex === 0) {
        // Calculate dynamic real-time telemetry
        const remainingSteps = path.length - index;
        setEta(Math.max(1, Math.ceil(remainingSteps / 10)));
        
        const totalDist = google.maps.geometry.spherical.computeLength(path.slice(index));
        setDistanceRemaining(totalDist / 1000); // Distance in kilometers

        // Simulated fluctuating speed (40-65 km/h)
        setCurrentSpeed(Math.floor(40 + Math.random() * 25));

        // Enhanced voice navigation with robustness
        steps.forEach((step, idx) => {
          if (!spokenStepIndices.has(idx)) {
            const stepStart = step.start_location;
            const distToStep = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(lat, lng), 
              stepStart
            );
            
            if (distToStep < 40) {
              const instruction = step.instructions.replace(/<[^>]*>?/gm, '');
              speak(instruction);
              spokenStepIndices.add(idx);
              
              // Also update current road name
              const roadName = step.instructions.replace(/<[^>]*>/g, '').split(' onto ')[1] || step.instructions.replace(/<[^>]*>/g, '').split(' on ')[1] || "JoyDrive Route";
              setCurrentRoad(roadName);
            }
          }
        });
      }

      subIndex++;
      if (subIndex >= subSteps) {
        subIndex = 0;
        index++;
      }
    }, intervalTime); 
  };

  const handleEmergency = () => {
    setShowEmergencyConfirm(true);
  };

  const executeEmergencyCall = () => {
    window.location.href = "tel:112";
    setShowEmergencyConfirm(false);
  };

  const findDriver = () => {
    try {
      console.log("findDriver called", { 
        paymentMethod, 
        savedCardsCount: savedCards.length, 
        appState,
        origin: !!origin,
        destination: !!destination,
        rideId: selectedRide.id
      });
      
      if (selectedRide.id === 'joy_moving' && movingDetails.furniture.length === 0) {
        setShowMovingDetails(true);
        return;
      }

      if (paymentMethod !== 'cash' && !paymentMethod.startsWith('google') && !paymentMethod.startsWith('apple')) {
        console.log("Showing card entry for payment confirmation");
        setShowCardEntry(true);
        return;
      }
      
      console.log("Starting driver search process...");
      startFindingDriver();
    } catch (error) {
      console.error("Critical error in findDriver:", error);
    }
  };

  const [pickupStarted, setPickupStarted] = useState(false);

  useEffect(() => {
    if (showDriverCamera && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
    if (isCameraActive && movingVideoRef.current && cameraStream) {
      movingVideoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, showDriverCamera, cameraStream]);

  useEffect(() => {
    if (appState === 'searching' && selectedRide.id === 'joy_moving') {
      const interval = setInterval(() => {
        setExaminingDriversCount(prev => {
          if (prev >= 12) {
            clearInterval(interval);
            // Simulate a driver counter-offer after some time
            setTimeout(() => {
              setDriverProposedPrice(850);
              setOfferCountdown(15);
            }, 3000);
            return 12;
          }
          return prev + Math.floor(Math.random() * 3) + 1;
        });
      }, 2000);
      return () => {
        clearInterval(interval);
        setExaminingDriversCount(0);
        setDriverProposedPrice(null);
        setOfferCountdown(15);
      };
    }
  }, [appState, selectedRide.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (driverProposedPrice && appState === 'searching') {
      timer = setInterval(() => {
        setOfferCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setDriverProposedPrice(null); // Offer expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [driverProposedPrice, appState]);

  const startFindingDriver = () => {
    console.log("startFindingDriver called");
    setAppState('searching');
    setSelectionPoint(null); // Clear search blue pin
    setIsInputExpanded(null); // Close input to hide pin
    setNegotiatedPrice(null);
    setUserOfferPrice("");
    setShowMovingNegotiation(false);
    setPickupStarted(false);
    setPickupDirections(null);
    setRemainingPickupPath([]);
    setRemainingPath([]);
    setDirections(null); // Clear preview route for UI
    // DO NOT CLEAR tripDirections here, as it was already computed by calculateRoute
    setPolylineKey(Date.now());
    
    // Simulate finding a driver nearby
    const directionsService = new google.maps.DirectionsService();
    // Use originPos if available (set during calculateRoute) to avoid issues with unmounted refs
    const finalOrigin = originPos || origin;
    
    console.log("Finding driver route to:", finalOrigin);

    // Random nearby point for driver start (Relative to originPos for guaranteed route)
    const driverStart = {
      lat: (originPos?.lat || userLocation?.lat || center.lat) + (Math.random() - 0.5) * 0.006,
      lng: (originPos?.lng || userLocation?.lng || center.lng) + (Math.random() - 0.5) * 0.006
    };
    setDriverInitialPos(driverStart);
    setVehiclePos(driverStart); // Initialize vehicle position so it appears immediately

    directionsService.route(
      {
        origin: driverStart,
        destination: finalOrigin,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        console.log("Driver route status:", status);
        if (status === google.maps.DirectionsStatus.OK && result) {
          setPickupDirections(result);
          
          // Only recalculate main trip if it was somehow lost
          if (!tripDirections) {
            const mainDirectionsService = new google.maps.DirectionsService();
            const finalDest = destinationPos || destination;
            mainDirectionsService.route({
              origin: finalOrigin,
              destination: finalDest,
              travelMode: google.maps.TravelMode.DRIVING
            }, (mainResult, mainStatus) => {
              if (mainStatus === google.maps.DirectionsStatus.OK && mainResult) {
                setTripDirections(mainResult);
              }
            });
          }

          // Only simulate finding a driver, don't start simulation yet
          if (selectedRide.id !== 'joy_moving') {
            setTimeout(() => {
              console.log("Driver found, starting pickup simulation automatically");
              setAppState('driver-found');
              const foundSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
              foundSound.play().catch(() => {});
              
              if (result) {
                startPickupSimulation(result);
              }
            }, 3000);
          }
        } else {
          console.error("Driver route failed:", status);
          // Fallback: move driver to found state anyway
          setTimeout(() => {
            setAppState('driver-found');
            setVehiclePos(typeof finalOrigin === 'string' ? userLocation || center : finalOrigin);
            setIsDriverAtPickup(true);
          }, 2000);
        }
      }
    );
  };

  const startPickupSimulation = (pickupResult: google.maps.DirectionsResult) => {
    if (pickupStarted) return;
    setSelectionPoint(null); // Clear selection blue pin
    setIsInputExpanded(null); // Close input to hide pin
    if (!pickupResult || !pickupResult.routes || pickupResult.routes.length === 0) {
      console.error("Cannot start pickup simulation: pickupResult is invalid");
      return;
    }

    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    setPickupStarted(true);
    setIsManualMapControl(false);
    setDirections(null); // Clear any existing directions
    const route = pickupResult.routes[0];
    if (!route || !route.legs || route.legs.length === 0) {
      console.error("Cannot start pickup simulation: route or legs missing");
      return;
    }

    const path = [...route.overview_path];
    console.log("Pickup simulation started with path length:", path.length);
    const endLoc = route.legs[0].end_location;
    setOriginPos({ lat: endLoc.lat(), lng: endLoc.lng() });
    setRemainingPickupPath(path.map(p => ({ lat: p.lat(), lng: p.lng() })));
    setVehiclePos({ lat: path[0].lat(), lng: path[0].lng() }); // Set initial vehicle position
    
    // Fit bounds for pickup path - balanced padding
    if (mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      path.forEach(p => bounds.extend(p));
      mapRef.current.fitBounds(bounds, { top: 100, bottom: 120, left: 60, right: 60 });
      setMapCenter(mapRef.current.getCenter()?.toJSON() || null);
      setZoom(16.5);
    }
    
    // Clear pickup directions to ensure DirectionsRenderer is unmounted
    setPickupDirections(null);
    
    let index = 0;
    let subIndex = 0;
    let spokenStepIndices = new Set<number>();
    const steps = pickupResult.routes[0].legs[0].steps;
    const subSteps = 20; // Improved fluidity
    const intervalTime = 25; // Speed increased by another 15% (29 -> 25)
    
    simulationIntervalRef.current = setInterval(() => {
      if (index >= path.length - 1) {
        // Ensure driver reaches the exact pickup point
        const finalPos = path[path.length - 1];
        setVehiclePos({ lat: finalPos.lat(), lng: finalPos.lng() });
        setRemainingPickupPath([]);
        
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        setEta(0);
        setIsDriverAtPickup(true); // Driver has arrived
        setWaitTimer(300); // Reset to 5 minutes
        
        // Arrival sound/sonnerie
        const chimes = new Audio('https://assets.mixkit.co/active_storage/sfx/1070/1070-preview.mp3');
        chimes.play().catch(() => {});
        
        setTimeout(() => {
          speak(lang === 'fr' ? "Le chauffeur est arrivé. Il vous attend depuis 5 minutes. Le trajet commencera dès que vous monterez à bord." : "The driver has arrived. He is waiting for 5 minutes. The trip will start once you board.");
        }, 1000);
        return;
      }

      const currentPos = path[index];
      const nextPos = path[index + 1];
      
      const lat = currentPos.lat() + (nextPos.lat() - currentPos.lat()) * (subIndex / subSteps);
      const lng = currentPos.lng() + (nextPos.lng() - currentPos.lng()) * (subIndex / subSteps);
      const heading = google.maps.geometry.spherical.computeHeading(currentPos, nextPos);
      
      const currentPosLiteral = { lat, lng };
      const headingValue = google.maps.geometry.spherical.computeHeading(currentPos, nextPos);
      
      setVehiclePos(currentPosLiteral);
      setHeading(headingValue);
      
      const inTrafficRange = (path.length - index) > 5 && (path.length - index) < 15;
      setIsTrafficJam(inTrafficRange);
      
      // Center map on driver during pickup if not manual (Offset for visibility)
      if (mapRef.current && !isManualMapControl) {
        const nextCenter = getNavCenter(currentPosLiteral, headingValue, 0.0012);
        (mapRef.current as any).setOptions({
          center: nextCenter,
          heading: headingValue,
          tilt: 45
        });
        setMapCenter(nextCenter);
      }
      
      // Dynamic pickup line: perfectly follow the driver
      const futurePathLiterals = path.slice(index + 1).map(p => ({ lat: p.lat(), lng: p.lng() }));
      setRemainingPickupPath([{ lat, lng }, ...futurePathLiterals]); 
      
      if (subIndex === 0) {
        const remainingSteps = path.length - index;
        setEta(Math.max(1, Math.ceil(remainingSteps / 10)));

        // Navigation instructions for pickup too
        steps.forEach((step, idx) => {
          if (!spokenStepIndices.has(idx)) {
            const dist = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(lat, lng),
              step.start_location
            );
            if (dist < 40) {
              const cleanText = step.instructions.replace(/<[^>]*>/g, '');
              speak(cleanText);
              spokenStepIndices.add(idx);
            }
          }
        });
      }
      
      subIndex++;
      if (subIndex >= subSteps) {
        subIndex = 0;
        index++;
      }
    }, intervalTime); 
  };

  const updateFrequentAddresses = (address: string) => {
    if (!address) return;
    setFrequentAddresses(prev => {
      const existing = prev.find(a => a.address === address);
      let updated;
      if (existing) {
        updated = prev.map(a => a.address === address ? { ...a, count: a.count + 1 } : a);
      } else {
        updated = [...prev, { address, count: 1 }];
      }
      updated.sort((a, b) => b.count - a.count);
      const limited = updated.slice(0, 10);
      localStorage.setItem('joydrive_frequent_addresses', JSON.stringify(limited));
      return limited;
    });
  };

  const calculateRoute = async () => {
    console.log("calculateRoute called", { origin, destination, stopAddress });
    if (!origin || !destination) return;
    
    setSelectionPoint(null);
    setIsInputExpanded(null);
    
    const finalOrigin = originRef.current?.getPlace()?.formatted_address || origin;
    const finalDest = destRef.current?.getPlace()?.formatted_address || destination;
    const finalStop = stopRef.current?.getPlace()?.formatted_address || stopAddress;

    console.log("Final addresses:", { finalOrigin, finalDest, finalStop });

    updateFrequentAddresses(finalOrigin);
    updateFrequentAddresses(finalDest);
    if (finalStop) updateFrequentAddresses(finalStop);

    setDirections(null);
    const directionsService = new google.maps.DirectionsService();
    
    const waypoints = finalStop ? [{ location: finalStop, stopover: true }] : [];

    directionsService.route(
      {
        origin: finalOrigin,
        destination: finalDest,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const mainRoute = result.routes[0].legs[0];
          setOrigin(mainRoute.start_address);
          setDestination(result.routes[0].legs[result.routes[0].legs.length - 1].end_address);
          setDirections(result);
          setTripDirections(result);
          setOriginPos({ lat: mainRoute.start_location.lat(), lng: mainRoute.start_location.lng() });
          setDestinationPos({ lat: result.routes[0].legs[result.routes[0].legs.length - 1].end_location.lat(), lng: result.routes[0].legs[result.routes[0].legs.length - 1].end_location.lng() });
          setAppState('vehicle-selection');
          generateAiInsight(finalOrigin, finalDest);
          
            // Zoom in to show avenues
            if (mapRef.current) {
              const bounds = new google.maps.LatLngBounds();
              result.routes[0].overview_path.forEach(p => bounds.extend(p));
              mapRef.current.fitBounds(bounds, { top: 100, bottom: 150, left: 50, right: 50 });
              
              // Only zoom in if it's a very short trip, otherwise let fitBounds do its job
              setTimeout(() => {
                if (mapRef.current) {
                  const currentZoom = mapRef.current.getZoom() || 14;
                  if (currentZoom > 18) {
                    setZoom(17.5);
                  }
                }
              }, 1000);
            }
        } else {
          console.error(`Directions request failed due to ${status}`);
          let errorMsg = `Could not calculate route: ${status}`;
          if (status === 'REQUEST_DENIED') {
            errorMsg = "Google Maps Directions API is not enabled. Please check your Google Cloud Console.";
          } else if (status === 'ZERO_RESULTS') {
            errorMsg = "No route found between these locations. Please check the addresses.";
          } else if (status === 'NOT_FOUND') {
            errorMsg = "One or more addresses could not be found.";
          }
          setNotification({ message: errorMsg, type: 'error' });
        }
      }
    );
  };

  const generateAiInsight = async (from: string, to: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the trip from ${from} to ${to}. Give a 15-word luxury travel insight.`,
      });
      setAiInsight(response.text || "Optimized for your comfort.");
    } catch (e) {
      setAiInsight("JoyDrive Intelligence: Route optimized.");
    }
  };

  const predictDestination = async () => {
    if (history.length === 0) return;
    
    setIsPredicting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      const historyContext = history.slice(0, 5).map(h => `- From: ${h.from}, To: ${h.to}, Date: ${h.date}`).join('\n');
      
      const prompt = `Based on the user's recent ride history and current time, predict their most likely next destination. 
Current Day: ${day}
Current Time: ${time}

History:
${historyContext}

Return ONLY the predicted destination address string. If no strong pattern, return "No prediction".`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const prediction = response.text?.trim() || "";
      if (prediction && prediction !== "No prediction" && prediction.length > 3) {
        setPredictedDestination(prediction);
      } else {
        setPredictedDestination(null);
      }
    } catch (e) {
      console.error("Prediction failed", e);
      setPredictedDestination(null);
    } finally {
      setIsPredicting(false);
    }
  };

  useEffect(() => {
    if (history.length > 0 && appState === 'map') {
      predictDestination();
    }
  }, [history.length, appState]);

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      setIsManualMapControl(false);
      mapRef.current.panTo(userLocation);
      setZoom(18.5);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || zoom;
      setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || zoom;
      setZoom(currentZoom - 1);
    }
  };

  const getMapCenter = () => {
    const baseCenter = vehiclePos || userLocation || center;
    // Offset the center so the route/vehicle is higher up on the screen (above the bottom info panels)
    // We push the map center SOUTH (by decreasing latitude), which moves the world objects NORTH (relative to screen)
    if (appState === 'map' || appState === 'vehicle-selection' || appState === 'driver-found' || appState === 'simulation' || appState === 'searching' || appState === 'driver-navigation') {
      const isNav = appState === 'simulation' || (appState === 'driver-found' && pickupStarted) || appState === 'driver-navigation';
      const offset = isNav ? 0 : 0.006; 
      return { lat: baseCenter.lat - offset, lng: baseCenter.lng };
    }
    return baseCenter;
  };

  return (
    <div className={cn("fixed inset-0 h-[100dvh] flex items-center justify-center p-0 overflow-hidden touch-none", theme === 'dark' ? "bg-black" : "bg-[#f8f9fa]")}>
      <div 
        className={cn(
          "relative w-full h-full max-w-[480px] mx-auto rounded-[40px] shadow-2xl overflow-hidden",
          theme === 'dark' ? "bg-black text-white" : "bg-white text-black"
        )}
      >
      <AnimatePresence mode="wait">
        {appState === 'onboarding' && <OnboardingPage theme={theme} t={t} setAppState={setAppState} setUser={setUser} />}
        {appState === 'landing' && <LandingPage key="landing" theme={theme} loadingProgress={loadingProgress} t={t} setAppState={setAppState} />}
        {appState === 'auth' && (
          <AuthPage 
            key="auth" 
            theme={theme} 
            t={t} 
            lang={lang}
            handleSocialLogin={handleSocialLogin} 
            setAppState={setAppState} 
            isRegistering={isRegistering} 
            setIsRegistering={setIsRegistering} 
            setNotification={setNotification}
            onAuthSuccess={(data) => {
              setUser({
                name: `${data.firstName} ${data.lastName}`,
                email: data.email || 'user@joydrive.com',
                phone: data.phone || '+27 00 000 0000',
                photo: data.photo
              });
              setAppState('map'); 
            }}
          />
        )}

        {appState === 'driver_reg' && (
          <motion.div 
            key="driver"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn("fixed inset-0 z-[90] p-8 flex flex-col justify-center backdrop-blur-3xl", theme === 'dark' ? "bg-black/80" : "bg-white/80")}
          >
            {/* Close Button */}
            <button 
              onClick={() => setAppState('landing')} 
              className="absolute top-8 right-8 w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-[100] active:scale-90 border border-white/10 shadow-xl"
            >
              <X className="w-6 h-6 opacity-50" />
            </button>

            <div className="max-w-md md:max-w-2xl mx-auto w-full space-y-8 overflow-y-auto max-h-full px-6 py-12 glass rounded-[40px] border border-white/10 shadow-2xl custom-scrollbar">
              <div className="text-center">
                <h2 className="text-2xl font-display joy-gradient mb-2">{t('driverReg')}</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest">{t('joinFleet')}</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('firstName')}</label>
                    <input type="text" placeholder={t('firstName')} className="w-full glass p-4 rounded-2xl text-sm" value={driverRegData.firstName} onChange={e => setDriverRegData({...driverRegData, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('lastName')}</label>
                    <input type="text" placeholder={t('lastName')} className="w-full glass p-4 rounded-2xl text-sm" value={driverRegData.lastName} onChange={e => setDriverRegData({...driverRegData, lastName: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('email')}</label>
                  <input type="email" placeholder={t('email')} className="w-full glass p-4 rounded-2xl text-sm" value={driverRegData.email} onChange={e => setDriverRegData({...driverRegData, email: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('phone')}</label>
                  <input type="tel" placeholder={t('phone')} className="w-full glass p-4 rounded-2xl text-sm" value={driverRegData.phone} onChange={e => setDriverRegData({...driverRegData, phone: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('vehicleInfo')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('carModel')}</label>
                      <input type="text" placeholder={t('carModel')} className="w-full glass p-4 rounded-2xl text-sm" value={driverRegData.carModel} onChange={e => setDriverRegData({...driverRegData, carModel: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('plateNumber')}</label>
                      <input type="text" placeholder={t('plateNumber')} className="w-full glass p-4 rounded-2xl text-sm" value={driverRegData.plateNumber} onChange={e => setDriverRegData({...driverRegData, plateNumber: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('profilePhoto')}</p>
                  <div className="flex flex-col items-center gap-4 p-6 glass rounded-3xl border border-white/10">
                    <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-[#E9D5FF]/40 shadow-[0_0_15px_rgba(233,213,255,0.2)] flex items-center justify-center overflow-hidden relative group">
                      {driverRegData.profilePhoto ? (
                        <img src={driverRegData.profilePhoto} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-[#A855F7] opacity-40" />
                      )}
                      <button 
                        onClick={async () => {
                          try {
                            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                              throw new Error("Camera API not supported in this browser.");
                            }
                            const stream = await navigator.mediaDevices.getUserMedia({ 
                              video: { 
                                facingMode: 'user',
                                width: { ideal: 640 },
                                height: { ideal: 640 }
                              } 
                            });
                            setCameraStream(stream);
                            setShowDriverCamera(true);
                          } catch (err: any) {
                            console.error("Camera error:", err);
                            const errorMsg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
                              ? (lang === 'fr' ? "Accès caméra refusé. Veuillez autoriser la caméra dans les paramètres de votre navigateur ou ouvrir l'application dans un nouvel onglet." : "Camera access denied. Please allow camera access in your browser settings or open the app in a new tab.")
                              : (lang === 'fr' ? `Erreur caméra: ${err.message}` : `Camera error: ${err.message}`);
                            setNotification({ message: errorMsg, type: 'error' });
                            
                            // Fallback for demo purposes if camera is denied
                            setDriverRegData(prev => ({ ...prev, profilePhoto: "https://picsum.photos/seed/driver/200/200" }));
                          }
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                    <p className="text-[10px] opacity-40 text-center">Take a real-time photo for your profile</p>
                    <input 
                      id="profile-photo-capture" 
                      type="file" 
                      accept="image/*" 
                      capture="user" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDriverRegData({...driverRegData, profilePhoto: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('documents')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <button onClick={() => document.getElementById('license-upload')?.click()} className="w-full glass p-4 rounded-2xl text-center flex flex-col items-center gap-2 hover:bg-white/5 transition-colors active:scale-95">
                        <Camera className="w-5 h-5 opacity-50" />
                        <span className="text-[10px] uppercase font-bold">{t('license')}</span>
                        {driverRegData.license && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      </button>
                      <input id="license-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setDriverRegData({...driverRegData, license: e.target.files?.[0] || null})} />
                    </div>
                    <div className="relative">
                      <button onClick={() => document.getElementById('id-upload')?.click()} className="w-full glass p-4 rounded-2xl text-center flex flex-col items-center gap-2 hover:bg-white/5 transition-colors active:scale-95">
                        <ShieldCheck className="w-5 h-5 opacity-50" />
                        <span className="text-[10px] uppercase font-bold">{t('idCard')}</span>
                        {driverRegData.vehicleDocs && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      </button>
                      <input id="id-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setDriverRegData({...driverRegData, vehicleDocs: e.target.files?.[0] || null})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2 flex items-center gap-2">
                    <Banknote className="w-4 h-4" /> {lang === 'fr' ? "Coordonnées Bancaires" : "Bank Payout Details"}
                  </p>
                  <div className="space-y-4 glass p-6 rounded-[32px] border border-white/10">
                    <div className="space-y-1">
                      <label className="text-[10px] opacity-40 uppercase ml-2">Bank Name</label>
                      <input 
                        type="text" 
                        value={driverRegData.bankName}
                        onChange={e => setDriverRegData({...driverRegData, bankName: e.target.value})}
                        placeholder="e.g. FNB, Standard Bank"
                        className="w-full glass p-4 rounded-2xl text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] opacity-40 uppercase ml-2">Account Holder</label>
                      <input 
                        type="text" 
                        value={driverRegData.accountHolder}
                        onChange={e => setDriverRegData({...driverRegData, accountHolder: e.target.value})}
                        placeholder="Full Name"
                        className="w-full glass p-4 rounded-2xl text-sm outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] opacity-40 uppercase ml-2">Account Number</label>
                        <input 
                          type="text" 
                          value={driverRegData.accountNumber}
                          onChange={e => setDriverRegData({...driverRegData, accountNumber: e.target.value})}
                          placeholder="000000000"
                          className="w-full glass p-4 rounded-2xl text-sm outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] opacity-40 uppercase ml-2">Branch Code</label>
                        <input 
                          type="text" 
                          value={driverRegData.branchCode}
                          onChange={e => setDriverRegData({...driverRegData, branchCode: e.target.value})}
                          placeholder="123455"
                          className="w-full glass p-4 rounded-2xl text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start glass p-6 rounded-3xl border border-[#D4AF37]/20 group transition-all hover:bg-[#D4AF37]/5">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded-lg accent-[#D4AF37] mt-1 cursor-pointer" 
                    id="terms-driver-final"
                    checked={driverRegData.acceptedTerms}
                    onChange={(e) => setDriverRegData({...driverRegData, acceptedTerms: e.target.checked})}
                  />
                  <label htmlFor="terms-driver-final" className="text-[11px] opacity-70 leading-relaxed cursor-pointer select-none">
                    {lang === 'fr' ? "Je lis et j'accepte les " : "I read and accept the "}
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowDriverTermsModal(true); }}
                      className="text-[#D4AF37] underline font-extrabold hover:text-[#00FF88] transition-colors"
                    >
                      {lang === 'fr' ? "Conditions Partenaires" : "Partner Terms"}
                    </button>
                    {lang === 'fr' ? " et je comprends le mode opératoire (80% chauffeur, paiement hebdo)." : " and understand the operating model (80% driver, weekly payment)."}
                  </label>
                </div>

                <button 
                  onClick={() => {
                    if (!driverRegData.acceptedTerms) {
                      setNotification({ message: lang === 'fr' ? "Veuillez accepter les conditions pour continuer." : "Please accept the terms to continue.", type: 'error' });
                      return;
                    }
                    if (!driverRegData.firstName || !driverRegData.lastName || !driverRegData.bankName || !driverRegData.accountNumber) {
                      setNotification({ message: lang === 'fr' ? "Veuillez remplir tous les champs, y compris les coordonnées bancaires." : "Please fill in all fields, including bank details.", type: 'error' });
                      return;
                    }
                    confetti();
                    setDriverInfo(prev => ({
                      ...prev,
                      name: `${driverRegData.firstName} ${driverRegData.lastName}`,
                      car: driverRegData.carModel,
                      plate: driverRegData.plateNumber,
                      phone: driverRegData.phone,
                      photo: driverRegData.profilePhoto || prev.photo
                    }));
                    
                    // Sync to payout preferences
                    setPayoutPreferences(prev => ({
                      ...prev,
                      bankName: driverRegData.bankName,
                      accountHolder: driverRegData.accountHolder || `${driverRegData.firstName} ${driverRegData.lastName}`,
                      accountNumber: driverRegData.accountNumber,
                      branchCode: driverRegData.branchCode
                    }));

                    setShowDriverSuccess(true);
                  }} 
                  className={cn("w-full font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 bg-[linear-gradient(135deg,_#00FF88_0%,_#D4AF37_50%,_#00FF88_100%)] text-black shadow-[0_0_30px_rgba(0,255,136,0.3)] border border-white/20 uppercase tracking-widest text-sm animate-pulse-slow")}
                >
                  {t('submitReg')}
                </button>
                <button onClick={() => setAppState('landing')} className="w-full glass py-4 rounded-2xl text-sm font-bold">{t('cancel')}</button>
              </div>
            </div>
          </motion.div>
        )}

        {showDriverSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] backdrop-blur-3xl bg-black/70 flex items-center justify-center p-6 text-center">
            <div className={cn("max-w-sm glass p-10 rounded-[40px] border shadow-2xl space-y-6", theme === 'dark' ? "border-[#D4AF37]/30" : "border-[#D4AF37]/20")}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-[#D4AF37]/20">
                <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
              </div>
                      <h3 className="text-xl font-display font-bold text-[#D4AF37]">{lang === 'fr' ? "Inscription Réussie !" : "Registration Successful!"}</h3>
              <p className="text-xs opacity-70">{lang === 'fr' ? "Votre demande est en cours d'examen. Nous vous contacterons bientôt." : "Your application is under review. We will contact you soon."}</p>
              <button 
                onClick={() => {
                  setShowDriverSuccess(false);
                  setIsDriver(true);
                  setAppState('driver-dashboard');
                }}
                className="w-full font-bold py-4 rounded-2xl bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 uppercase tracking-widest text-xs"
              >
                {t('driverDashboard')}
              </button>
              <button 
                onClick={() => {
                  setShowDriverSuccess(false);
                  setAppState('landing');
                }}
                className="w-full py-4 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity"
              >
                {t('cancel')}
              </button>
            </div>
          </motion.div>
        )}

        {appState === 'driver-dashboard' && (
          <motion.div 
            key="driver-dashboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={cn("fixed inset-0 z-[90] p-6 flex flex-col", theme === 'dark' ? "bg-black" : "bg-neutral-100")}
          >
            <div className="max-w-md md:max-w-4xl mx-auto w-full flex flex-col h-full space-y-6 pt-12 safe-top">
              <div 
                onClick={() => setShowDriverEarningsDetails(true)}
                className="flex justify-between items-center glass p-6 rounded-[32px] border border-white/10 cursor-pointer hover:bg-white/5 transition-all group"
              >
                <div>
                  <h2 className="text-xl font-display joy-gradient font-bold">{t('driverDashboard')}</h2>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest">{t('welcome')}, {driverRegData.firstName || "Driver"}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] opacity-50 uppercase tracking-widest">{t('earnings')}</p>
                    <p className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-black")}>{countryInfo.currency} {driverEarnings.toFixed(2)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity translate-x-1" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                {/* Real-time Map Card */}
                <div className="glass h-64 rounded-[32px] border border-white/10 shadow-xl overflow-hidden relative">
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%', backgroundColor: '#000000' }}
                      center={userLocation || center}
                      zoom={15}
                      options={{
                        ...getMapOptions(), 
                        backgroundColor: '#000000',
                        disableDefaultUI: false,
                        zoomControl: true,
                        gestureHandling: 'greedy',
                        tilt: 45,
                        mapId: '8ece9711e1c0c45c'
                      }}
                      onLoad={(map) => {
                        (map as any).setOptions({ 
                          backgroundColor: '#000000'
                        });
                      }}
                    >
                      {userLocation && (
                        <OverlayView
                          position={userLocation}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                          <div className="relative flex items-center justify-center w-4 h-4 pointer-events-none -translate-x-1/2 -translate-y-1/2">
                            {/* Advanced Sonar Waves for Driver (Visual only, no search) */}
                            {/* Removed sonar as requested to keep position clean */}
                            
                             <NavArrow heading={heading} ride={selectedRide} />
                          </div>
                        </OverlayView>
                      )}
                    </GoogleMap>
                  )}
                  <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full bg-[#D4AF37]")} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{t('liveLocation')}</span>
                  </div>
                </div>

                {/* Vehicle Status Card */}
                <div className="glass p-6 rounded-[32px] border border-white/10 space-y-4 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/20 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center py-4">
                    <div className="w-full h-40 relative flex items-center justify-center">
                      <motion.div 
                        animate={{ 
                          y: [-5, 5, -5],
                          rotateY: [0, 10, 0, -10, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="relative z-10 w-full h-full flex items-center justify-center"
                      >
                        <img 
                          src={selectedRide.image} 
                          className="w-56 h-auto object-contain drop-shadow-[0_20px_40px_rgba(253,185,49,0.4)]" 
                          alt="Vehicle"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                      {/* Background Glow */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full blur-3xl opacity-50" />
                    </div>
                    
                    <div className="text-center mt-4">
                      <h3 className="text-xl font-display font-bold joy-gradient">{driverRegData.carModel || "JD Premium"}</h3>
                      <p className="text-[10px] opacity-50 uppercase tracking-widest mt-1">{driverRegData.plateNumber || "JD-2026-ZA"} • {driverRegData.color || "Gold"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-[8px] opacity-40 uppercase tracking-widest mb-1">Battery</p>
                      <p className="text-sm font-bold text-green-400">94%</p>
                    </div>
                    <div className="text-center border-x border-white/5">
                      <p className="text-[8px] opacity-40 uppercase tracking-widest mb-1">Range</p>
                      <p className="text-sm font-bold">420km</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] opacity-40 uppercase tracking-widest mb-1">Temp</p>
                      <p className="text-sm font-bold">22°C</p>
                    </div>
                  </div>
                </div>

                {/* Payouts Quick Access Card */}
                <div 
                  onClick={() => setShowPayouts(true)}
                  className="glass p-6 rounded-[32px] border border-white/10 shadow-xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all group active:scale-98"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", theme === 'dark' ? "bg-[#D4AF37]/20 border border-[#D4AF37]/30" : "bg-[#D4AF37]/10 border border-[#D4AF37]/20")}>
                      <Wallet className={cn("w-6 h-6", theme === 'dark' ? "text-[#D4AF37]" : "text-[#B8860B]")} />
                    </div>
                    <div>
                      <h3 className="font-bold flex items-center gap-2">
                        {lang === 'fr' ? "Portefeuille & Virement" : "Wallet & Transfers"}
                        {!payoutPreferences.accountNumber && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </h3>
                      <p className="text-[10px] opacity-50 uppercase tracking-widest">{lang === 'fr' ? "Configuré pour : " : "Set up for: "} {payoutPreferences.bankName || (lang === 'fr' ? "Non configuré" : "Not set up")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                       <p className="text-[8px] opacity-40 uppercase tracking-widest leading-none">Net</p>
                       <p className="text-xs font-bold text-green-400">80%</p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-30 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setShowDriverEarningsDetails(true)}
                    className="glass p-5 rounded-[28px] border border-white/10 flex flex-col items-center justify-center gap-2 text-center hover:bg-white/5 transition-all cursor-pointer active:scale-95 h-32"
                  >
                    <BarChart2 className="w-6 h-6 opacity-40" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter opacity-50">{lang === 'fr' ? "Statistiques" : "Analytics"}</p>
                  </div>
                  <div 
                    className="glass p-5 rounded-[28px] border border-white/10 flex flex-col items-center justify-center gap-2 text-center opacity-40 grayscale cursor-not-allowed h-32"
                  >
                    <Settings className="w-6 h-6 opacity-40" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter opacity-50">{lang === 'fr' ? "Paramètres" : "Settings"}</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 px-2">{t('incomingRequest')}</h3>
                  {driverRequests.filter(req => req.city === driverCity).length === 0 ? (
                    <div className="glass p-12 rounded-[32px] border border-dashed border-white/10 text-center space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Zap className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm opacity-40 italic">{t('noRequests')}</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-20 mt-2">Zone: {driverCity}</p>
                    </div>
                  ) : (
                    <motion.div 
                      key="requests-list"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                      className="space-y-4"
                    >
                      {driverRequests.filter(req => req.city === driverCity).map(req => (
                        <motion.div 
                          key={`request-${req.id}`}
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 }
                          }}
                          className="glass p-6 rounded-[32px] border border-white/10 space-y-4 shadow-xl hover:bg-white/s transition-all group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", theme === 'dark' ? "bg-white/10" : "bg-black/5")}>
                                <User className={cn("w-6 h-6", theme === 'dark' ? "text-white" : "text-black")} />
                              </div>
                              <div>
                                <p className="font-bold joy-gradient">{req.customer}</p>
                                <p className="text-[10px] opacity-50 uppercase tracking-widest">{req.distance}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#D4AF37]">{countryInfo.currency} {req.price}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-xs">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <p className="opacity-70 truncate">{req.from}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              <p className="opacity-70 truncate">{req.to}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <button 
                              onClick={() => handleDeclineRequest(req.id)}
                              className="glass py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors active:scale-95"
                            >
                              {t('decline')}
                            </button>
                            <button 
                              onClick={() => {
                                if (req.type === 'joy_moving' && userOfferPrice) {
                                  setNegotiatedPrice(Number(userOfferPrice));
                                  setAppState('driver-found');
                                  setShowMovingNegotiation(false);
                                } else {
                                  acceptRequest(req);
                                }
                              }}
                              className={cn("py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg bg-[#00FF88] text-black shadow-[#00FF88]/20")}
                            >
                              {userOfferPrice && req.type === 'joy_moving' ? t('accept') : t('accept')}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
              </div>

              <button 
                onClick={() => setAppState('landing')}
                className="w-full glass py-4 rounded-2xl text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
              >
                {t('logout')}
              </button>
            </div>
          </motion.div>
        )}

        {appState === 'driver-navigation' && (
          <motion.div 
            key="driver-navigation"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col pointer-events-none"
          >
            {/* Overlay UI */}
            <div className="relative z-10 flex flex-col h-full p-4">
              <div className="glass p-4 rounded-[24px] border border-white/10 pointer-events-auto shadow-2xl space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[8px] opacity-50 uppercase tracking-widest font-bold">
                          {driverNavState === 'to-customer' ? t('navigatingToCustomer') : t('navigatingToDestination')}
                        </p>
                        <p className="font-bold text-sm">
                          {driverNavState === 'to-customer' ? activeDriverRequest?.from : activeDriverRequest?.to}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-lg", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>
                            <div className="relative">
                              <Clock className="w-4 h-4" />
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-2 border-current rounded-full"
                              />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">{eta} {lang === 'fr' ? 'min restantes' : 'min remaining'}</span>
                          </div>
                          
                          {/* Traffic Info Badge - Uber/Bolt style */}
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider",
                            isTrafficJam ? "bg-red-500 text-white animate-pulse" : "bg-green-500/20 text-green-400"
                          )}>
                            <AlertTriangle className="w-3 h-3" />
                            {isTrafficJam ? "Heavy Traffic" : "Fast Route"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: '100%' }} 
                      transition={{ duration: 10 }} 
                      className={cn("h-full", theme === 'dark' ? "bg-white" : "bg-black")} 
                    />
                  </div>
                </div>

                <div className="mt-auto space-y-3 pointer-events-auto">
                  {/* Recenter Button when in manual mode */}
                  <AnimatePresence>
                    {isManualMapControl && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex justify-center mb-2"
                      >
                        <button 
                          onClick={() => setIsManualMapControl(false)}
                          className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 shadow-2xl flex items-center gap-2 active:scale-95"
                        >
                          <Navigation className="w-3 h-3 text-[#D4AF37]" />
                          RECENTER VIEW
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="glass p-4 rounded-[24px] border border-white/10 shadow-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2", theme === 'dark' ? "bg-white/5 border-white/20" : "bg-black/5 border-black/10")}>
                      <User className={cn("w-6 h-6", theme === 'dark' ? "text-white" : "text-black")} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{activeDriverRequest?.customer}</p>
                      <p className="text-[10px] opacity-50 uppercase tracking-widest">Customer</p>
                    </div>
                  </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const phoneticPhone = activeDriverRequest?.phone || "0731234567";
                          speak(lang === 'fr' ? `Appel du client au ${phoneticPhone}` : `Calling customer at ${phoneticPhone}`);
                          window.location.href = `tel:${phoneticPhone}`;
                        }}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center border border-green-500/20 shadow-lg bg-green-500/10 hover:bg-green-500/30 transition-colors active:scale-90"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4 text-green-500" />
                      </button>
                      <button 
                        onClick={() => setShowSOSModal(true)}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center border border-red-500/20 shadow-lg bg-red-500/10 hover:bg-red-500/30 transition-colors active:scale-90"
                        title="SOS"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </button>
                      <button 
                        onClick={handleDriverCancelTrip}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center border border-red-500/5 shadow-lg hover:bg-red-500/2 transition-colors active:scale-90"
                        title="Cancel Trip"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                      <button 
                        onClick={() => {
                          setCommTab('chat');
                          setShowCommunication(true);
                        }}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center border border-white/5 shadow-lg active:scale-90"
                      >
                        <MessageSquare className={cn("w-4 h-4", theme === 'dark' ? "text-white" : "text-black")} />
                      </button>
                    </div>
                </div>

                <button 
                  onClick={() => {
                    if (driverNavState === 'to-customer') {
                      setDriverNavState('to-destination');
                      setEta(activeDriverRequest?.duration ? parseInt(activeDriverRequest.duration) : 12);
                      speak(lang === 'fr' ? "Client récupéré. En route vers la destination." : "Customer picked up. Navigating to destination.");
                      // Start the second part of simulation
                      if (activeDriverRequest) {
                        startDestinationSimulation(activeDriverRequest);
                      }
                    } else {
                      completeDriverTrip();
                      speak(lang === 'fr' ? "Course terminée. Excellent travail !" : "Trip completed. Great job!");
                    }
                  }}
                  className={cn("w-full font-black py-5 rounded-[24px] text-sm shadow-2xl transition-all active:scale-95 luminous-text", theme === 'dark' ? "bg-white text-black shadow-white/10" : "bg-black text-white shadow-black/20")}
                >
                  {driverNavState === 'to-customer' ? "I HAVE PICKED UP THE CUSTOMER" : "COMPLETE THE TRIP"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

            {/* Map Layer */}
            <div className="absolute inset-0 z-0">
              {isLoaded ? (
                <>
                  {/* Address Modification Center Marker (Deep Blue) */}
                  {isInputExpanded && appState !== 'driver-navigation' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+12px)] z-[15] pointer-events-none flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative flex flex-col items-center"
                      >
                        <div className="w-14 h-14 bg-[#00FF88] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.8)] border-[3px] border-white backdrop-blur-md animate-pulse">
                          <MapPin className="w-8 h-8 text-white fill-white/30" />
                        </div>
                        <div className="w-2 h-8 bg-gradient-to-b from-[#00FF88] to-transparent shadow-2xl rounded-full mt-[-4px]" />
                        <div className="w-3 h-3 bg-[#00FF88] rounded-full blur-[2px] mt-[-2px] animate-ping" />
                      </motion.div>
                    </div>
                  )}

                  {/* Map Flash Transition */}
                  <div className="absolute inset-0 z-[10] pointer-events-none">
                    <motion.div 
                      key={`map-transition-${mapStyle}`}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-white"
                    />
                  </div>

                  <GoogleMap
                  key={`unified-joy-map-${theme}-${mapStyle}`}
                  onZoomChanged={() => {
                    if (mapRef.current) {
                      const currentZoom = mapRef.current.getZoom();
                      if (currentZoom !== undefined && Math.abs(currentZoom - zoom) > 0.1) {
                        setZoom(currentZoom);
                        // If zoom changes significantly via gesture, set manual control
                        setIsManualMapControl(true);
                      }
                    }
                  } }
                  onDragStart={() => setIsManualMapControl(true)}
                  mapContainerStyle={{
                    ...mapContainerStyle,
                    backgroundColor: '#000000',
                  }}
                  center={isManualMapControl ? undefined : (appState === 'simulation' || appState === 'driver-found' || appState === 'driver-navigation' ? (mapCenter || vehiclePos || getMapCenter()) : getMapCenter())}
                  zoom={isManualMapControl ? zoom : (appState === 'driver-navigation' ? 16 : (appState === 'simulation' ? 16 : (appState === 'searching' ? 14 : zoom)))}
                  heading={isManualMapControl ? undefined : (heading || 0)}
                  tilt={75}
                  onClick={onMapClick}
                  options={{
                    ...getMapOptions(),
                    tilt: (appState === 'driver-navigation' || appState === 'simulation') ? 75 : 0,
                    gestureHandling: 'greedy',
                    disableDefaultUI: true,
                    backgroundColor: '#000000',
                    mapTypeControl: false,
                    streetViewControl: false,
                    rotateControl: true,
                    fullscreenControl: false,
                    keyboardShortcuts: false
                  }}
                  onLoad={(map) => { 
                    mapRef.current = map; 
                    map.setOptions({
                      ...getMapOptions(),
                      tilt: 75,
                      gestureHandling: 'greedy'
                    });
                  }}
                >
            {/* Traffic Layer only for driver navigation */}
            {appState === 'driver-navigation' && <TrafficLayer />}

            {directions && appState === 'vehicle-selection' && (
              <React.Fragment key="directions-renderer-fragment">
                <DirectionsRenderer 
                  key="trip-directions-renderer"
                  directions={directions} 
                  options={{
                    polylineOptions: { 
                      strokeColor: '#00FF88', // Luminous Green
                      strokeWeight: 8, 
                      strokeOpacity: 1.0,
                      zIndex: 90
                    },
                    suppressMarkers: true
                  }} 
                />
              </React.Fragment>
            )}
            
            {/* Main Trip Simulation */}
            {appState === 'simulation' && remainingPath.length > 0 && (
              <React.Fragment key="trip-route-fragment">
                <Polyline
                  key={`trip-bg-${polylineKey}`}
                  path={remainingPath}
                  options={{
                    strokeColor: isTrafficJam ? '#FF0000' : '#00FF88',
                    strokeWeight: 14,
                    strokeOpacity: 0.35,
                    zIndex: 999
                  }}
                />
                <Polyline
                  key={`trip-fg-${polylineKey}`}
                  path={remainingPath}
                  options={{
                    strokeColor: isTrafficJam ? '#FF453A' : '#00FF88',
                    strokeWeight: 5,
                    strokeOpacity: 1,
                    zIndex: 1000,
                    icons: isTrafficJam ? [{
                      icon: {
                        path: 'M 0,-1 0,1',
                        strokeOpacity: 1,
                        scale: 4,
                        strokeColor: '#FFFFFF'
                      },
                      offset: '0',
                      repeat: '20px'
                    }] : []
                  }}
                />
              </React.Fragment>
            )}

            {/* Pickup Simulation */}
            {appState === 'driver-found' && pickupStarted && remainingPickupPath.length > 0 && (
              <React.Fragment key="pickup-route-fragment">
                <Polyline
                  key={`pickup-bg-${polylineKey}`}
                  path={remainingPickupPath}
                  options={{
                    strokeColor: '#00FF88',
                    strokeWeight: 14,
                    strokeOpacity: 0.35,
                    zIndex: 999
                  }}
                />
                <Polyline
                  key={`pickup-fg-${polylineKey}`}
                  path={remainingPickupPath}
                  options={{
                    strokeColor: isTrafficJam ? '#FF453A' : '#00FF88',
                    strokeWeight: 5,
                    strokeOpacity: 1,
                    zIndex: 1000,
                    icons: isTrafficJam ? [{
                      icon: {
                        path: 'M 0,-1 0,1',
                        strokeOpacity: 1,
                        scale: 4,
                        strokeColor: '#FFFFFF'
                      },
                      offset: '0',
                      repeat: '20px'
                    }] : []
                  }}
                />
              </React.Fragment>
            )}
            {/* Driver Simulation specific markers/routes */}
            {appState === 'driver-navigation' && (
              <React.Fragment key="driver-nav-elements">
                {/* Route for driver */}
                {remainingPath.length > 0 && (
                  <React.Fragment key="driver-route-fragment">
                    <Polyline
                      key={`driver-bg-${polylineKey}`}
                      path={remainingPath}
                      options={{
                        strokeColor: isTrafficJam ? '#FF0000' : '#00FF88',
                        strokeWeight: 14,
                        strokeOpacity: 0.35,
                        zIndex: 999
                      }}
                    />
                    <Polyline
                      key={`driver-fg-${polylineKey}`}
                      path={remainingPath}
                      options={{
                        strokeColor: isTrafficJam ? '#FF0000' : '#00FF88',
                        strokeWeight: 6,
                        strokeOpacity: 1,
                        zIndex: 1000
                      }}
                    />
                  </React.Fragment>
                )}
                
                {/* Driver Marker */}
                {userLocation && (
                  <OverlayView
                    key="driver-location-overlay"
                    position={userLocation}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div className="relative flex items-center justify-center">
                      <NavArrow heading={0} ride={selectedRide} />
                      {/* Only sonar when searching */}
                      {(appState === 'driver-navigation' || appState === 'simulation') && (
                        <div className="absolute w-24 h-24 bg-[#00FF88]/10 rounded-full animate-sonar" />
                      )}
                      <div className="absolute top-14 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-full border border-white/40 shadow-2xl flex items-center gap-2 w-max">
                        <Zap className={cn("w-3 h-3", theme === 'dark' ? "text-white" : "text-black")} />
                        <span className="text-[10px] font-black text-white">{currentSpeed} km/h</span>
                      </div>
                    </div>
                  </OverlayView>
                )}

                {/* Markers for driver */}
                {originPos && driverNavState === 'to-customer' && (
                  <Marker 
                    key="driver-origin-marker"
                    position={originPos}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#000000',
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: '#FFFFFF',
                    }}
                  />
                )}
                {destinationPos && driverNavState === 'to-destination' && (
                  <Marker 
                    key="driver-destination-marker"
                    position={destinationPos}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#000000',
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: '#FFFFFF',
                    }}
                  />
                )}
              </React.Fragment>
            )}

            {userLocation && (appState === 'map' || appState === 'landing' || appState === 'auth' || appState === 'searching' || appState === 'vehicle-selection' || appState === 'simulation' || appState === 'driver-found') && (
              <OverlayView
                key="user-location-overlay"
                position={userLocation}
                mapPaneName={OverlayView.FLOAT_PANE}
              >
                  <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-48 h-48 pointer-events-none">
                    <div className="relative flex items-center justify-center w-12 h-12">
                      {/* Advanced Sonar Waves (Only when searching or in simulation) */}
                      {(appState === 'searching' || (appState as string) === 'simulation' || appState === 'driver-found') && (
                        <>
                          <div className="absolute inset-0 bg-[#4285F4]/30 rounded-full animate-sonar" />
                          <div className="absolute inset-0 bg-[#4285F4]/20 rounded-full animate-sonar-2" />
                          <div className="absolute inset-0 bg-[#4285F4]/10 rounded-full animate-sonar-3" />
                        </>
                      )}
                      
                      {/* Detailed Wave Arrows System (Fleche d'onde) */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center z-0"
                        animate={{ rotate: heading || 0 }}
                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                      >
                        <div className="w-full h-full relative">
                          {/* GPS Signal Wave Cone - Micro Size */}
                          <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-5 h-8 bg-gradient-to-t from-[#4285F4]/40 via-[#4285F4]/10 to-transparent animate-pulse"
                            style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }}
                          />
                          
                          {/* Multiple Directional Wave Arrows - Pin-Point for Precision */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 flex flex-col items-center gap-0">
                            <div className="w-1.5 h-1.5 border-t border-l border-white rotate-45 animate-sonar opacity-80" />
                            <div className="w-1 h-1 border-t border-l border-white rotate-45 animate-sonar-2 opacity-60" />
                          </div>
                        </div>
                      </motion.div>
  
                      {/* Pro Core Indicator */}
                      <div className="relative z-10 flex items-center justify-center scale-110">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xl">
                            <div className="w-4 h-4 bg-[#4285F4] rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </OverlayView>
            )}
            {selectionPoint && isInputExpanded && (
              <OverlayView
                key="selection-point-overlay"
                position={selectionPoint}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="relative flex items-center justify-center pointer-events-none">
                  {/* Pulsing Outer Rings */}
                  <div className="absolute w-12 h-12 bg-[#00FF88]/40 rounded-full animate-sonar" />
                  <div className="absolute w-20 h-20 bg-[#00FF88]/20 rounded-full animate-sonar-2" />
                  <div className="absolute w-28 h-28 bg-[#00FF88]/10 rounded-full animate-sonar-3" />
                  
                  {/* Core Pin Indicator */}
                  <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="w-8 h-8 rounded-full bg-[#00FF88] border-2 border-white shadow-[0_0_20px_rgba(0,255,136,0.8)] flex items-center justify-center p-1"
                    >
                      {isInputExpanded === 'origin' && <MapPin className="text-black w-4 h-4" />}
                      {isInputExpanded === 'dest' && <Flag className="text-black w-4 h-4" />}
                      {isInputExpanded === 'stop' && <Clock className="text-black w-4 h-4" />}
                    </motion.div>
                    <div className="w-1 h-3 bg-gradient-to-b from-[#00FF88] to-transparent" />
                  </div>
                </div>
              </OverlayView>
            )}
            {originPos && (
              <Marker 
                key="origin-marker"
                position={originPos}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#000000',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                }}
              />
            )}
            {destinationPos && (
              <Marker 
                key="destination-marker"
                position={destinationPos}
                icon={{
                  path: "M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2ZM12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z",
                  scale: 1.5,
                  fillColor: '#000000',
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: '#FFFFFF',
                  anchor: new google.maps.Point(12, 22),
                }}
              />
            )}
            {vehiclePos && (
              <OverlayView
                key="vehicle-location-overlay-final"
                position={vehiclePos}
                mapPaneName={OverlayView.FLOAT_PANE}
              >
                <div className="relative flex flex-col items-center justify-center pointer-events-none -translate-x-1/2 -translate-y-1/2">
                  {/* Sonar Waves centered on vehicle - Professional Glow */}
                  <div className="absolute inset-0 flex items-center justify-center w-32 h-32">
                    <div className={cn("absolute w-24 h-24 rounded-full animate-sonar", theme === 'dark' ? "bg-white/10" : "bg-black/5")} />
                    <div className={cn("absolute w-16 h-16 rounded-full animate-sonar-2", theme === 'dark' ? "bg-[#D4AF37]/20" : "bg-[#D4AF37]/10")} />
                  </div>
                  
                  {/* High Visibility Navigation Arrow instead of car */}
                  <NavArrow heading={heading} ride={selectedRide} />
                  
                  {/* Floating Indicator for High Contrast */}
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 w-max animate-bounce-slow">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-black")}>
                      {selectedRide.name}
                    </span>
                  </div>
                </div>
              </OverlayView>
            )}
          </GoogleMap>

          {/* Floating Map Controls */}
          <div className="absolute top-[40%] right-4 z-30 flex flex-col gap-3 pointer-events-none -translate-y-1/2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                requestOrientationPermission();
                setIsManualMapControl(false);
                if (userLocation && mapRef.current) {
                  mapRef.current.panTo(userLocation);
                  setZoom(18);
                }
              }}
              className="w-12 h-12 glass rounded-full flex items-center justify-center shadow-2xl border border-white/20 pointer-events-auto glow-option"
              title="Recenter"
            >
                  <Navigation className={cn("w-5 h-5", theme === 'dark' ? "text-white" : "text-black")} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEmergency}
              className="w-12 h-12 glass rounded-full flex items-center justify-center text-red-500 shadow-2xl border border-red-500/20 pointer-events-auto group relative glow-option"
            >
              <Shield className="w-6 h-6 fill-red-500/10" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg transform rotate-45">
                <Shield className="w-2.5 h-2.5 text-red-600" />
              </div>
            </motion.button>
          </div>
        </>
      ) : appState === 'driver-navigation' ? null : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900">
            {loadError ? (
              <div className="p-8 text-center glass rounded-3xl max-w-md shadow-2xl border-red-500/5">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-display mb-4">Configuration Requise</h3>
                <div className="text-sm opacity-70 leading-relaxed text-left space-y-4">
                  <p className="font-bold text-red-400">Erreur détectée : Legacy API Not Activated</p>
                  <p>Pour corriger cela, vous devez activer les versions classiques des APIs dans votre <a href="https://console.cloud.google.com/google/maps-apis/library" target="_blank" className="underline text-white">Console Google Cloud</a> :</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Maps JavaScript API</strong> (Déjà actif)</li>
                    <li><strong>Places API</strong> (Version classique, pas seulement "New")</li>
                    <li><strong>Directions API</strong> (Version classique, pas seulement "Routes")</li>
                  </ul>
                  <p className="text-[10px] italic mt-4 opacity-50">Note : La bibliothèque actuelle nécessite ces versions pour l'autocomplétion et le calcul d'itinéraire en temps réel.</p>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl mt-8 hover:bg-neutral-200 transition-colors"
                >
                  J'ai activé les APIs, actualiser
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                  <div className="relative w-18 h-18 flex items-center justify-center rounded-full overflow-hidden border border-[#00FF88]/20 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                    <div className="absolute inset-0 w-full h-full opacity-40">
                      <img src="https://flagcdn.com/za.svg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <Car className="w-12 h-12 text-[#00FF88] animate-float relative z-10" />
                  </div>
                <div className="animate-pulse joy-gradient font-display text-2xl tracking-[0.5em] font-bold">JOYDRIVE</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* UI Overlays */}
      {appState !== 'landing' && appState !== 'auth' && appState !== 'driver-navigation' && appState !== 'driver-dashboard' && (
        <>
          <header className="absolute top-0 left-0 right-0 p-4 safe-top z-20 flex justify-center items-center pointer-events-none">
            <div className="w-full flex justify-between items-center px-0">
              <div className="pointer-events-auto">
          <button onClick={() => setIsMenuOpen(true)} className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shadow-xl">
            <Menu className="w-6 h-6" />
          </button>
              </div>
              <div className="flex items-center gap-2 pointer-none">
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden">
                  <div className="absolute inset-0 w-full h-full opacity-40 blur-[1px]">
                    <img src="https://flagcdn.com/za.svg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <Car className="w-6 h-6 relative z-10 text-[#D4AF37]" />
                </div>
                <h1 className="text-2xl font-display tracking-[0.2em] joy-gradient font-bold uppercase transition-all duration-300">JOYDRIVE</h1>
              </div>
              <div className="w-12 h-12 pointer-events-auto">
                <div className="w-12 h-12 glass rounded-full overflow-hidden border border-white/20">
                  <img src={user?.photo || "https://picsum.photos/seed/user/100/100"} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </header>

          {/* Side Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md z-40" />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="absolute top-0 left-0 bottom-0 w-[280px] sm:w-80 glass backdrop-blur-3xl z-50 p-6 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                      <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-2">
                          <div className="relative w-12 h-12 flex items-center justify-center rounded-full overflow-hidden">
                            <div className="absolute inset-0 w-full h-full opacity-40 blur-[1px]">
                              <img src="https://flagcdn.com/za.svg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <Car className="w-8 h-8 relative z-10 text-[#00FF88]" />
                          </div>
                          <h2 className="text-3xl font-display joy-gradient font-bold">JoyDrive</h2>
                        </div>
                        <button onClick={() => setIsMenuOpen(false)} className={cn("p-2 rounded-full", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/5")}><X className="w-6 h-6 opacity-50" /></button>
                      </div>

                    <div className="flex items-center gap-4 mb-12 p-4 glass rounded-[24px] shadow-lg relative overflow-visible">
                      <div className="relative group">
                        {/* Red and Blue mixed border effect */}
                        <div className="absolute -inset-[2px] rounded-full bg-gradient-to-tr from-red-600 via-blue-600 to-red-600 animate-spin-slow opacity-75 blur-[1px]" />
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#310E68]/50 shadow-[0_0_20px_rgba(49,14,104,0.4)]">
          <img src={user?.photo || "https://picsum.photos/seed/user/100/100"} className="w-full h-full object-cover" />
        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-black z-10" />
                      </div>
                      <div>
                        <p className="font-bold text-base">{user?.name || "Guest User"}</p>
                        <p className="text-[10px] opacity-70 uppercase tracking-widest text-[#00FF88] font-black">{user?.phone || "+27 00 000 0000"}</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-wider">{user?.email || "guest@joydrive.com"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={`user-rating-star-${s}`} className="w-2.5 h-2.5 text-[#D4AF37] fill-[#D4AF37]" />
                          ))}
                          <span className="text-[9px] font-bold opacity-60 ml-1">5.0 (Driver Rating)</span>
                        </div>
                      </div>
                    </div>

                      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
                        {[
                          { icon: User, label: t('profile'), action: () => setShowProfileEdit(true) },
                          { icon: Heart, label: t('favorites'), action: () => setShowFavorites(true) },
                          { icon: History, label: t('history'), action: () => setShowHistory(true) },
                          { icon: Settings, label: t('settings'), action: () => setShowSettings(true) },
                          { icon: Gift, label: t('promos'), action: () => setShowPromos(true) },
                          { icon: AlertTriangle, label: t('emergency'), action: handleEmergency, className: "text-red-500" },
                          { icon: Briefcase, label: t('becomeDriver'), action: () => setAppState('driver_reg') },
                          isDriver && { icon: Navigation, label: t('driverDashboard'), action: () => setAppState('driver-dashboard'), className: theme === 'dark' ? "text-white" : "text-black" },
                          { icon: Info, label: t('about'), action: () => setShowAbout(true) },
                          { icon: FileText, label: t('privacy'), action: () => setShowPrivacy(true) },
                        ].filter(Boolean).map((item: any, i) => (
                        <motion.button 
                          key={i} 
                          onClick={() => { item.action(); setIsMenuOpen(false); }} 
                          whileHover={{ x: 5, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                          whileTap={{ scale: 0.98 }}
                          className={cn("flex items-center gap-4 w-full text-left group p-3 rounded-xl transition-all", item.className)}
                        >
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", 
                            theme === 'dark' ? "bg-white/5 group-hover:bg-white/10" : "bg-black/5 group-hover:bg-black/10",
                            item.className && (theme === 'dark' ? "bg-red-500/10" : "bg-red-500/5"))}>
                            <item.icon className={cn("w-5 h-5 transition-colors", 
                              theme === 'dark' ? "opacity-70 group-hover:text-white" : "opacity-90 text-black group-hover:text-black")}/>
                          </div>
                          <span className={cn("text-sm font-medium transition-opacity", 
                            theme === 'dark' ? "opacity-80 group-hover:opacity-100" : "text-black font-extrabold")}>{item.label}</span>
                        </motion.button>
                      ))}
                  </nav>

                  <div className="mt-auto pt-8 space-y-4">
                    <button onClick={() => setAppState('landing')} className="flex items-center gap-4 text-red-400/80 hover:text-red-400 transition-colors w-full p-3 rounded-xl hover:bg-red-400/5">
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">{t('logout')}</span>
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-4 text-red-500/60 hover:text-red-500 transition-colors w-full p-3 rounded-xl hover:bg-red-500/5">
                      <span className="text-xs font-bold uppercase tracking-widest">{t('deleteAccount')}</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Modals */}
          <AnimatePresence>
            {showProfileEdit && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className="w-full max-w-sm glass backdrop-blur-3xl rounded-3xl p-8 text-center shadow-2xl">
                  <h3 className="text-2xl font-display mb-8">Edit Profile</h3>
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <img src={user?.photo || "https://picsum.photos/seed/user/100/100"} className={cn("w-full h-full rounded-full object-cover border-4", theme === 'dark' ? "border-white/10" : "border-black/5")} />
                    <button onClick={() => fileInputRef.current?.click()} className={cn("absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>
                      <Camera className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">Full Name</label>
                      <input type="text" value={user?.name} onChange={(e) => user && setUser({ ...user, name: e.target.value })} className="w-full glass p-4 rounded-2xl text-center" placeholder="Your Name" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">Phone Number</label>
                      <input type="tel" value={user?.phone} onChange={(e) => user && setUser({ ...user, phone: e.target.value })} className="w-full glass p-4 rounded-2xl text-center" placeholder="Phone Number" />
                    </div>
                  </div>
                  <button onClick={() => setShowProfileEdit(false)} className={cn("w-full font-bold py-4 rounded-2xl transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Save Changes</button>
                </div>
              </motion.div>
            )}

            {showLanguageSelect && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/70" : "bg-white/70")}>
                <div className="w-full max-w-sm glass backdrop-blur-3xl rounded-[40px] p-8 shadow-2xl border border-white/10">
                  <h3 className="text-2xl font-display mb-6 text-center joy-gradient font-bold">Select Language</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setShowLanguageSelect(false); }} className={cn("w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all", lang === l.code ? (theme === 'dark' ? "bg-white text-black border-white scale-[1.02]" : "bg-black text-white border-black scale-[1.02]") : "border-white/10 hover:bg-white/5")}>
                        {l.name}
                        {lang === l.code && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {showPromos && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/70" : "bg-white/70")}>
                <div className="w-full max-w-sm glass backdrop-blur-3xl rounded-[40px] p-8 shadow-2xl border border-white/10 text-center relative">
                  <button onClick={() => setShowPromos(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  <Gift className={cn("w-16 h-16 mx-auto mb-6", theme === 'dark' ? "text-white" : "text-black")} />
                  <h3 className="text-2xl font-display mb-2 joy-gradient font-bold">{t('promos')}</h3>
                  <p className="text-sm opacity-70 mb-6">Unlock exclusive rewards and discounts for your next journey.</p>
                  
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text" 
                      placeholder="Promo code" 
                      className="flex-1 glass p-3 rounded-xl text-xs font-bold outline-none border border-white/10 focus:border-white/50 transition-all"
                    />
                    <button className={cn("px-4 rounded-xl font-bold text-xs transition-transform active:scale-95", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Apply</button>
                  </div>

                  <div className="space-y-4">
                    <div className={cn("glass p-4 rounded-2xl border text-left", theme === 'dark' ? "border-white/30" : "border-black/10")}>
                      <p className={cn("text-[10px] uppercase tracking-widest font-bold", theme === 'dark' ? "text-white" : "text-black")}>Active Promo</p>
                      <p className="font-bold">JOYWELCOME50</p>
                      <p className="text-xs opacity-50">50% off your first 3 rides</p>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/10 text-left opacity-50">
                      <p className="text-[10px] uppercase tracking-widest font-bold">Expired</p>
                      <p className="font-bold">SUMMERJOY20</p>
                      <p className="text-xs opacity-50">20% off during summer</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {showSettings && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/70" : "bg-white/70")}>
                <div className="w-full max-w-sm glass backdrop-blur-3xl rounded-[40px] p-8 shadow-2xl border border-white/10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-display joy-gradient font-bold">{t('settings')}</h3>
                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                          {theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-[#D4AF37]" />
                          ) : (
                            <Sun className="w-5 h-5 text-[#D4AF37]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">App Appearance</p>
                          <p className="text-[10px] opacity-50 uppercase tracking-widest">{theme === 'dark' ? "Dark Map & UI" : "Light Map & UI"}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors duration-300",
                          theme === 'dark' ? "bg-[#D4AF37]" : "bg-gray-300 ring-2 ring-[#D4AF37]/20"
                        )}
                      >
                        <motion.div 
                          animate={{ x: theme === 'dark' ? 24 : 4 }}
                          className={cn(
                            "absolute top-1 w-4 h-4 rounded-full shadow-lg",
                            theme === 'dark' ? "bg-black" : "bg-white"
                          )}
                        />
                      </button>
                    </div>

                    <button onClick={() => { setShowSettings(false); setShowLanguageSelect(true); }} className="flex items-center justify-between w-full p-4 glass rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Globe className={cn("w-5 h-5", theme === 'dark' ? "text-white" : "text-black")} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t('language')}</p>
                          <p className="text-[10px] opacity-50 uppercase tracking-widest">{LANGUAGES.find(l => l.code === lang)?.name}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-30" />
                    </button>

                    <button onClick={() => { setShowSettings(false); setShowNotifications(true); }} className="flex items-center justify-between w-full p-4 glass rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Bell className={cn("w-5 h-5", theme === 'dark' ? "text-white" : "text-black")} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t('notifications')}</p>
                          <p className="text-[10px] opacity-50 uppercase tracking-widest">Manage Alerts</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-30" />
                    </button>

                    <button onClick={() => { setShowSettings(false); setShowPayment(true); }} className="flex items-center justify-between w-full p-4 glass rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <CreditCard className={cn("w-5 h-5", theme === 'dark' ? "text-white" : "text-black")} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t('payment')}</p>
                          <p className="text-[10px] opacity-50 uppercase tracking-widest">Cards & Wallets</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-30" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {(showAbout || showPrivacy || showHistory || showNotifications) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/70" : "bg-white/70")}>
                <div className="w-full max-w-md glass backdrop-blur-3xl rounded-[40px] p-8 relative overflow-hidden shadow-2xl border border-white/10">
                  <button onClick={() => { setShowAbout(false); setShowPrivacy(false); setShowHistory(false); setShowNotifications(false); }} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  
                  {showNotifications ? (
                    <>
                      <h3 className="text-2xl font-display mb-6 joy-gradient font-bold">{t('notifications')}</h3>
                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {notifications.map((n) => (
                          <div key={`notification-${n.id}`} className={cn("p-4 rounded-2xl border backdrop-blur-md", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5")}>
                            <p className="text-sm opacity-80 mb-1">{n.text}</p>
                            <p className="text-[10px] opacity-40 uppercase">{n.time}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : showHistory ? (
                    <>
                      <h3 className="text-2xl font-display mb-6 joy-gradient font-bold">{t('history')}</h3>
                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {history.length === 0 ? (
                          <div className="text-center py-12 opacity-40 italic">No trips yet. Your journey starts here.</div>
                        ) : (
                          history.map((ride) => {
                            const mallTo = isMallAddress(ride.to);
                            return (
                            <div key={`history-ride-${ride.id}`} className={cn("border rounded-2xl p-4 space-y-2 transition-all hover:scale-[1.01] backdrop-blur-md relative group", theme === 'dark' ? "bg-white/10 border-white/20" : "bg-black/5 border-black/5")}>
                              <div className="flex justify-between items-start">
                                <div className="text-[10px] opacity-50 uppercase tracking-tighter">{ride.date}</div>
                                <div className="font-bold joy-gradient text-lg">{countryInfo.currency} {ride.price.toFixed(2)}</div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-[#D2691E] shadow-[0_0_8px_#D2691E]" />
                                <div className="truncate opacity-80 text-[#D2691E] font-bold">{ride.from}</div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 border border-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                <div className="truncate opacity-80 text-white font-bold">{ride.to}</div>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <div className={cn("text-[9px] uppercase tracking-[0.2em] opacity-30")}>{ride.rideType}</div>
                                {ride.status && <div className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-full", ride.status === 'Cancelled' ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500")}>{ride.status}</div>}
                              </div>
                              {ride.cancelReason && <div className="text-[10px] text-red-500/60 italic">Reason: {ride.cancelReason}</div>}
                              
                              {mallTo && (
                                <div className="absolute right-4 bottom-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                      key={`hist-entrance-${n}-${ride.id}`}
                                      onClick={() => {
                                        setDestination(`${ride.to} (${t('entrance')} ${n})`);
                                        setOrigin(ride.from);
                                        setAppState('map');
                                        setShowHistory(false);
                                      }}
                                      className={cn("px-2 py-1 rounded text-[8px] font-bold shadow-lg", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}
                                    >
                                      Go E{n}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )})
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-display mb-6 joy-gradient font-bold">{showAbout ? t('about') : t('privacy')}</h3>
                      <p className="text-sm opacity-70 leading-relaxed mb-8 whitespace-pre-line max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">{showAbout ? ABOUT_CONTENT : PRIVACY_POLICY}</p>
                    </>
                  )}
                  
                  <button onClick={() => { setShowAbout(false); setShowPrivacy(false); setShowHistory(false); setShowNotifications(false); }} className={cn("w-full font-bold py-4 rounded-2xl mt-4 transition-colors shadow-lg", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Close</button>
                </div>
              </motion.div>
            )}

            {/* Driver Real-time Camera Modal */}
            <AnimatePresence>
              {showDriverCamera && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-6"
                >
                  <div className="w-full max-w-md space-y-6">
                    <div className={cn("relative aspect-square rounded-full overflow-hidden border-4 shadow-[0_0_50px_rgba(255,255,255,0.1)]", theme === 'dark' ? "border-white" : "border-black")}>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                      <canvas ref={canvasRef} className="hidden" width="640" height="640" />
                      
                      {/* Overlay Guide */}
                      <div className="absolute inset-0 border-[40px] border-black/40 rounded-full pointer-events-none" />
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <div className="text-center">
                        <h3 className="text-white font-bold text-lg">{t('profilePhoto')}</h3>
                        <p className="text-white/50 text-xs uppercase tracking-widest mt-1">Center your face in the circle</p>
                      </div>

                      <div className="flex items-center gap-8">
                        <button 
                          onClick={() => {
                            setShowDriverCamera(false);
                            if (cameraStream) {
                              cameraStream.getTracks().forEach(track => track.stop());
                              setCameraStream(null);
                            }
                          }}
                          className="w-14 h-14 glass rounded-full flex items-center justify-center text-white"
                        >
                          <X className="w-6 h-6" />
                        </button>

                        <button 
                          onClick={() => {
                            if (videoRef.current && canvasRef.current) {
                              const context = canvasRef.current.getContext('2d');
                              if (context) {
                                context.drawImage(videoRef.current, 0, 0, 640, 640);
                                const photo = canvasRef.current.toDataURL('image/jpeg');
                                setDriverRegData(prev => ({ ...prev, profilePhoto: photo }));
                                setShowDriverCamera(false);
                                if (cameraStream) {
                                  cameraStream.getTracks().forEach(track => track.stop());
                                  setCameraStream(null);
                                }
                              }
                            }
                          }}
                          className={cn("w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}
                        >
                          <div className="w-16 h-16 rounded-full border-4 border-black" />
                        </button>

                        <div className="w-14 h-14" /> {/* Spacer */}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showFavorites && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/70" : "bg-white/70")}>
                <div className="w-full max-w-md glass backdrop-blur-3xl rounded-[40px] p-8 shadow-2xl overflow-y-auto max-h-[80vh] border border-white/10 custom-scrollbar">
                  <h3 className="text-2xl font-display mb-8 text-center joy-gradient font-bold">{t('favorites')}</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> {t('favoriteDrivers')}
                      </h4>
                      <div className="space-y-2">
                        {favoriteDrivers.length > 0 ? favoriteDrivers.map((d) => (
                            <div key={`fav-driver-${d.id}`} className="flex items-center justify-between p-4 glass rounded-2xl border border-white/10 bg-white/5">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", theme === 'dark' ? "bg-white/10" : "bg-black/5")}>
                                <User className={cn("w-5 h-5", theme === 'dark' ? "text-white" : "text-black")} />
                              </div>
                              <span className="font-bold text-sm">{d.name}</span>
                            </div>
                            <button onClick={() => setFavoriteDrivers(prev => prev.filter(item => item.id !== d.id))} className="text-red-500/50 hover:text-red-500 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )) : <p className="text-xs opacity-40 text-center py-4 italic">No favorite drivers yet</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {t('favoriteAddresses')}
                      </h4>
                      <div className="space-y-2">
                        {favoriteAddresses.length > 0 ? favoriteAddresses.map((a) => {
                          const mall = isMallAddress(a.address);
                          return (
                          <div key={`fav-address-${a.id}`} className="group flex flex-col p-4 glass rounded-2xl border border-white/10 bg-white/5 transition-all hover:bg-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1 min-w-0 mr-4">
                                <p className="font-bold text-sm truncate">{a.name}</p>
                                <p className="text-[10px] opacity-50 truncate">{a.address}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setDestination(a.address); setShowFavorites(false); }} className={cn("hover:scale-110 transition-transform", theme === 'dark' ? "text-white" : "text-black")}>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => setFavoriteAddresses(prev => prev.filter(item => item.id !== a.id))} className="text-red-500/50 hover:text-red-500 transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {mall && (
                              <div className="flex gap-1 justify-end">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <button
                                    key={`fav-entrance-${n}-${a.id}`}
                                    onClick={() => {
                                      setDestination(`${a.address} (${t('entrance')} ${n})`);
                                      setShowFavorites(false);
                                    }}
                                    className={cn("px-2 py-1 rounded text-[8px] font-bold transition-all glow-option", theme === 'dark' ? "bg-white/20 border border-white/30 text-white hover:bg-white hover:text-black" : "bg-black/5 border border-black/10 text-black hover:bg-black hover:text-white")}
                                  >
                                    E{n}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}) : <p className="text-xs opacity-40 text-center py-4 italic">No favorite addresses yet</p>}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setShowFavorites(false)} className={cn("w-full font-bold py-4 rounded-2xl mt-8 transition-colors shadow-lg", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Close</button>
                </div>
              </motion.div>
            )}

            {showPayment && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/70" : "bg-white/70")}>
                <div className="w-full max-w-md glass backdrop-blur-3xl rounded-[40px] p-8 shadow-2xl overflow-y-auto max-h-[90vh] border border-white/10 custom-scrollbar">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-display joy-gradient font-bold">{t('payment')}</h3>
                    <button onClick={() => setShowPayment(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Active Card Card */}
                    {savedCards.find(c => c.id === paymentMethod) || digitalWallets.find(w => w.id === paymentMethod) ? (
                      <div className={cn(
                        "p-6 rounded-[32px] text-black shadow-xl relative overflow-hidden group transition-all duration-500",
                        paymentMethod.startsWith('google') ? "bg-white" : 
                        paymentMethod.startsWith('apple') ? "bg-neutral-200" :
                        savedCards.find(c => c.id === paymentMethod)?.brand === 'Joy Guest' ? "bg-gradient-to-br from-[#FDB931] via-[#D4AF37] to-[#B8860B] text-black border border-white/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]" :
                        "bg-gradient-to-br from-white to-white/60 text-black border border-white/20 shadow-xl shadow-white/10"
                      )}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-8">
                            {paymentMethod.startsWith('google') ? <Globe className="w-10 h-10 text-[#00FF88]" /> :
                             paymentMethod.startsWith('apple') ? <Smartphone className="w-10 h-10 text-[#00FF88]" /> :
                             <CreditCard className="w-10 h-10" />}
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-widest opacity-60">Balance</p>
                              <p className="text-xl font-display font-bold">{countryInfo.currency} 1,250.00</p>
                            </div>
                          </div>
                          <p className="text-lg font-mono tracking-widest mb-4 text-white">
                            {savedCards.find(c => c.id === paymentMethod)?.number || (digitalWallets.find(w => w.id === paymentMethod)?.name || "Payment Method")}
                          </p>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[8px] uppercase tracking-widest opacity-60">{paymentMethod.startsWith('google') || paymentMethod.startsWith('apple') ? "Details" : "Card Holder"}</p>
                              <p className="text-xs font-bold uppercase text-white">
                                {paymentMethod.startsWith('google') || paymentMethod.startsWith('apple') ? 
                                 digitalWallets.find(w => w.id === paymentMethod)?.details : 
                                 (user?.name || "Guest User")}
                              </p>
                            </div>
                            {savedCards.find(c => c.id === paymentMethod) && <p className="text-xs font-bold">{savedCards.find(c => c.id === paymentMethod)?.expiry}</p>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-[32px] bg-neutral-800 text-white flex items-center justify-center italic opacity-50">
                        {t('cash')} selected
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Wallets */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('wallets')}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {digitalWallets.map(wallet => (
                            <div key={`wallet-${wallet.id}`} className="relative group">
                              <button 
                                onClick={() => setPaymentMethod(wallet.id)}
                                className={cn(
                                  "w-full flex flex-col items-center justify-center p-4 glass rounded-2xl border transition-all",
                                  paymentMethod === wallet.id 
                                    ? "border-[#00FF88] bg-[#00FF88]/20 text-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.3)]" 
                                    : "border-white/10 bg-white/5 opacity-60 hover:opacity-100"
                                )}
                              >
                                {wallet.type === 'google' ? <Globe className="w-6 h-6 mb-2 text-[#00FF88]" /> : <Smartphone className="w-6 h-6 mb-2 text-[#00FF88]" />}
                                <span className={cn("text-[10px] font-black uppercase tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]", paymentMethod === wallet.id ? "opacity-100" : "opacity-70")}>{wallet.name}</span>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDigitalWallets(prev => prev.filter(w => w.id !== wallet.id)); if (paymentMethod === wallet.id) setPaymentMethod('cash'); }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => setShowWalletEntry(true)}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-2xl opacity-30 hover:opacity-100 transition-all gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">{t('addWallet')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Saved Cards */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('card')}</h4>
                        <div className="space-y-2">
                          {savedCards.map(card => (
                            <div 
                              key={`card-${card.id}`} 
                              onClick={() => setPaymentMethod(card.id)}
                              className={cn(
                                "flex items-center justify-between p-4 glass rounded-2xl border transition-all cursor-pointer",
                                paymentMethod === card.id 
                                  ? "border-[#00FF88] bg-[#00FF88]/20 text-white shadow-[0_0_20px_rgba(0,255,136,0.3)]" 
                                  : "border-white/10 bg-white/5 hover:opacity-100"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <CreditCard className={cn("w-5 h-5", paymentMethod === card.id ? "text-[#00FF88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" : "opacity-50")} />
                                <div>
                                  <p className={cn("text-sm font-black tracking-wide", paymentMethod === card.id ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "text-white/70")}>{card.brand} •••• {card.number.slice(-4)}</p>
                                  <p className={cn("text-[10px] font-bold", paymentMethod === card.id ? "text-white opacity-100" : "text-white/40")}>Expires {card.expiry}</p>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSavedCards(prev => prev.filter(c => c.id !== card.id)); if (paymentMethod === card.id) setPaymentMethod('cash'); }} 
                                className="text-red-500/50 hover:text-red-500 p-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setShowCardEntry(true)} className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">{t('addCard')}</span>
                        </button>
                      </div>

                      {/* Cash */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('emergency')} & {t('cash')}</h4>
                        <button 
                          onClick={() => setPaymentMethod('cash')}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 glass rounded-2xl border transition-all",
                            paymentMethod === 'cash' ? (theme === 'dark' ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.3)]" : "border-black bg-emerald-500/5") : "border-white/5 opacity-60 hover:opacity-100"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                            paymentMethod === 'cash' ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(52,211,153,0.4)]" : "bg-white/5"
                          )}>
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-xs font-bold text-white">{t('cash')}</p>
                            <p className="text-[10px] opacity-40">Pay with physical currency</p>
                          </div>
                          {paymentMethod === 'cash' && <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] bg-emerald-400")} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setShowPayment(false)} className={cn("w-full font-bold py-4 rounded-2xl mt-8 transition-colors shadow-lg", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Done</button>
                </div>
              </motion.div>
            )}

            {showCardEntry && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[150] backdrop-blur-3xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className="w-full max-w-sm glass rounded-[40px] p-8 shadow-2xl border border-white/10">
                  <h3 className="text-2xl font-display mb-8 text-center joy-gradient font-bold">{t('paymentRequired')}</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('cardNumber')}</label>
                      <input type="text" placeholder="4242 4242 4242 4242" className="w-full glass p-4 rounded-2xl text-sm border border-white/5 text-white placeholder:text-white/30" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('expiryDate')}</label>
                        <input type="text" placeholder="MM/YY" className="w-full glass p-4 rounded-2xl text-sm border border-white/5 text-white placeholder:text-white/30" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('cvv')}</label>
                        <input type="text" placeholder="123" className="w-full glass p-4 rounded-2xl text-sm border border-white/5 text-white placeholder:text-white/30" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button 
                      onClick={() => {
                        const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
                        successSound.play().catch(() => {});
                        confetti();
                        
                        // If we are in payment modal, add the card
                        if (showPayment || appState === 'vehicle-selection') {
                          const newCardId = Math.random().toString();
                          setSavedCards([...savedCards, {
                            id: newCardId,
                            number: "**** **** **** " + Math.floor(1000 + Math.random() * 9000),
                            expiry: "12/28",
                            brand: "Visa"
                          }]);
                          setPaymentMethod(newCardId);
                        }

                        setShowCardEntry(false);
                        
                        // If we are booking a ride, proceed to search
                        if (appState === 'vehicle-selection') {
                          startFindingDriver();
                        }

                        // If we just accepted a Joy Moving offer
                        if (pendingJoyMovingAcceptance) {
                          setPendingJoyMovingAcceptance(false);
                          setAppState('driver-found');
                          if (pickupDirections) {
                            startPickupSimulation(pickupDirections);
                          }
                        }
                      }} 
                      className={cn("w-full font-bold py-4 rounded-2xl shadow-lg", theme === 'dark' ? "bg-white text-black shadow-white/20" : "bg-black text-white shadow-black/20")}
                    >
                      {appState === 'vehicle-selection' ? t('payNow') : t('addCard')}
                    </button>
                    <button onClick={() => setShowCardEntry(false)} className="w-full glass py-4 rounded-2xl text-sm font-bold">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}

            {showWalletEntry && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[150] backdrop-blur-3xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/90" : "bg-white/90")}>
                <div className="w-full max-w-sm glass rounded-[40px] p-8 shadow-2xl border border-white/10">
                  <h3 className="text-2xl font-display mb-8 text-center joy-gradient font-bold">{t('addWallet')}</h3>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        setDigitalWallets([...digitalWallets, { id: 'apple_' + Date.now() + '-' + Math.random().toString(36).substr(2, 5), name: 'Apple Pay', type: 'apple', details: (user?.name || 'User') + '@icloud.com' }]);
                        setShowWalletEntry(false);
                        confetti();
                      }}
                      className="w-full glass p-6 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/5"
                    >
                      <Smartphone className="w-8 h-8" />
                      <div className="text-left">
                        <p className="font-bold">Apple Pay</p>
                        <p className="text-[10px] opacity-50">Link your Apple ID</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setDigitalWallets([...digitalWallets, { id: 'google_' + Date.now() + '-' + Math.random().toString(36).substr(2, 5), name: 'Google Pay', type: 'google', details: (user?.name || 'User') + '@gmail.com' }]);
                        setShowWalletEntry(false);
                        confetti();
                      }}
                      className="w-full glass p-6 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/5"
                    >
                      <Globe className="w-8 h-8 text-blue-500" />
                      <div className="text-left">
                        <p className="font-bold">Google Pay</p>
                        <p className="text-[10px] opacity-50">Link your Google Account</p>
                      </div>
                    </button>
                  </div>
                  <button onClick={() => setShowWalletEntry(false)} className="w-full glass py-4 rounded-2xl text-sm font-bold mt-8">Cancel</button>
                </div>
              </motion.div>
            )}

            {showContactModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] backdrop-blur-3xl bg-black/80 flex items-center justify-center p-6">
                <div className="w-full max-w-sm glass rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className={cn("absolute top-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-b to-transparent", theme === 'dark' ? "from-white/10" : "from-black/5")} />
                  
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-xl font-display font-bold joy-gradient">Contact Driver</h3>
                    <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <X className="w-5 h-5 opacity-50" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className={cn("w-24 h-24 rounded-full border-4 overflow-hidden shadow-2xl mb-4 border-[#D4AF37] shadow-[#D4AF37]/30")}>
                      <img src={driverInfo.photo} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-lg font-bold text-white">{driverInfo.name}</h4>
                    <p className="text-[10px] opacity-50 uppercase tracking-widest">{driverInfo.brand} Elite Partner</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                        <button 
                          onClick={startCall}
                          className={cn("glass p-6 rounded-3xl flex flex-col items-center gap-3 border border-[#D4AF37]/20 transition-all group glow-option", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/5")}
                        >
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-[#D4AF37]/20")}>
                            <Phone className="w-6 h-6 text-[#D4AF37]" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Call</span>
                        </button>
                        <button 
                          onClick={() => {
                            setShowContactModal(false);
                            setShowInAppMessage(true);
                          }}
                          className={cn("glass p-6 rounded-3xl flex flex-col items-center gap-3 border border-[#D4AF37]/20 transition-all group glow-option", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/5")}
                        >
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-[#D4AF37]/20")}>
                            <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Message</span>
                        </button>
                  </div>
                </div>
              </motion.div>
            )}

            {showInAppCall && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-between py-20 px-8"
              >
                {/* Background Blurs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 180, 270, 360],
                    }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className={cn("absolute -top-[20%] -left-[20%] w-[80%] h-[80%] blur-[120px] rounded-full", theme === 'dark' ? "bg-white/20" : "bg-black/5")}
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      rotate: [360, 270, 180, 90, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className={cn("absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] blur-[120px] rounded-full", theme === 'dark' ? "bg-white/10" : "bg-black/5")}
                  />
                </div>

                {/* Profile Section */}
                <div className="relative z-10 flex flex-col items-center gap-6 mt-10">
                  <div className="relative">
                    <motion.div 
                      animate={callStatus === 'ringing' ? { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -inset-4 bg-white/5 rounded-full blur-xl"
                    />
                    <div className="w-32 h-32 rounded-full border-2 border-white/20 p-1 bg-black/40 backdrop-blur-xl relative z-10">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img 
                          src={driverInfo.photo} 
                          className={cn("w-full h-full object-cover transition-all duration-700", isVideo ? "opacity-0 scale-150 blur-3xl" : "opacity-100")} 
                          alt={driverInfo.name}
                        />
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                            <Camera className="w-10 h-10 opacity-20" />
                          </div>
                        )}
                      </div>
                    </div>
                    {callStatus === 'connected' && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-black"
                      />
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black text-white tracking-tight">{driverInfo.name}</h3>
                    <div className="flex flex-col items-center gap-1">
                      <p className={cn(
                        "text-[11px] font-black uppercase tracking-[0.3em]",
                        callStatus === 'connected' ? "text-white/40" : (theme === 'dark' ? "text-white" : "text-black")
                      )}>
                        {callStatus === 'calling' && (lang === 'fr' ? "Appel en cours..." : "Calling...")}
                        {callStatus === 'ringing' && (lang === 'fr' ? "Sonnerie..." : "Ringing...")}
                        {callStatus === 'connected' && formatCallTime(callDuration)}
                        {callStatus === 'ended' && (lang === 'fr' ? "Appel terminé" : "Call Ended")}
                      </p>
                      {callStatus === 'connected' && (
                        <p className={cn("text-[9px] font-bold uppercase tracking-widest opacity-60", theme === 'dark' ? "text-white" : "text-black")}>End-to-End Encrypted</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="relative z-10 w-full max-w-sm space-y-12 mb-10">
                  <div className="grid grid-cols-2 gap-8">
                    <button 
                      onClick={() => setIsSpeaker(!isSpeaker)}
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center transition-all border border-white/5",
                        isSpeaker ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      <Volume2 className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center transition-all border border-white/5",
                        isMuted ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={() => {
                        setCallStatus('ended');
                        setTimeout(() => {
                          setShowInAppCall(false);
                          setCallStatus('idle');
                        }, 1000);
                      }}
                      className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-110 active:scale-95 transition-all group"
                    >
                      <PhoneOff className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {showInAppMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] backdrop-blur-3xl bg-black/90 flex flex-col">
                <div className="flex-1 flex flex-col max-w-lg mx-auto w-full bg-black/40 border-x border-white/5">
                  {/* Header */}
                  <div className="p-6 glass border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setShowInAppMessage(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full border overflow-hidden border-[#D4AF37]")}>
                          <img src={driverInfo.photo} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{driverInfo.name}</p>
                          <p className={cn("text-[10px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-black")}>Online</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {chatMessages.map((msg) => (
                      <motion.div 
                        initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={msg.id} 
                        className={cn("flex flex-col", msg.sender === 'user' ? "items-end" : "items-start")}
                      >
                        <div className={cn(
                          "max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-xl",
                          msg.sender === 'user' ? (theme === 'dark' ? "bg-white text-black rounded-tr-none" : "bg-black text-white rounded-tr-none") : "glass text-white rounded-tl-none border border-white/10"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] opacity-30 mt-1 font-bold">{msg.time}</span>
                      </motion.div>
                    ))}
                    {isDriverTyping && (
                      <div className="flex items-center gap-2 glass px-4 py-2 rounded-full w-fit">
                        <div className={cn("w-1 h-1 rounded-full animate-bounce", theme === 'dark' ? "bg-white" : "bg-black")} />
                        <div className={cn("w-1 h-1 rounded-full animate-bounce [animation-delay:0.2s]", theme === 'dark' ? "bg-white" : "bg-black")} />
                        <div className={cn("w-1 h-1 rounded-full animate-bounce [animation-delay:0.4s]", theme === 'dark' ? "bg-white" : "bg-black")} />
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-6 glass border-t border-white/10 bg-black/20 backdrop-blur-xl">
                    <div className="flex gap-3 items-center">
                      <button className="p-3 glass rounded-2xl hover:bg-white/5 transition-colors border border-white/5">
                        <Plus className="w-5 h-5 opacity-50" />
                      </button>
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && newMessage.trim() && (
                          setChatMessages([...chatMessages, { id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5), text: newMessage, sender: (appState as string) === 'driver-navigation' ? 'driver' : 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]),
                          setNewMessage("")
                        )}
                        placeholder="Type a message..."
                        className={cn("flex-1 glass p-4 rounded-2xl text-sm border transition-colors outline-none", theme === 'dark' ? "border-white/5 focus:border-white/50" : "border-black/10 focus:border-black/30")}
                      />
                      <button 
                        onClick={() => {
                          if (newMessage.trim()) {
                            setChatMessages([...chatMessages, { id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5), text: newMessage, sender: (appState as string) === 'driver-navigation' ? 'driver' : 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                            setNewMessage("");
                          }
                        }}
                        className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all", theme === 'dark' ? "bg-[#00FF88] text-black shadow-[#00FF88]/20" : "bg-[#00FF88] text-white shadow-[#00FF88]/20")}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {showDeleteConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[130] backdrop-blur-xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/90" : "bg-white/90")}>
                <div className="w-full max-w-sm glass border border-red-500/5 rounded-[40px] p-8 text-center shadow-2xl backdrop-blur-3xl">
                  <Zap className="w-12 h-12 text-red-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-display mb-4 joy-gradient font-bold">Delete Account?</h3>
                  <p className="text-sm opacity-50 mb-8">This action is permanent. All your data will be wiped from JoyDrive servers.</p>
                  <div className="space-y-3">
                    <button onClick={() => { setShowDeleteConfirm(false); setAppState('landing'); setUser(null); }} className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 transition-transform active:scale-95">Yes, Delete Forever</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="w-full glass py-4 rounded-2xl border border-white/5 font-bold">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}

            {showParcelCodeSetup && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] backdrop-blur-2xl bg-black/80 flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm glass border border-white/10 rounded-[40px] p-8 shadow-2xl backdrop-blur-3xl">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border", theme === 'dark' ? "bg-white/10 border-white/30" : "bg-black/5 border-black/10")}>
                    <Shield className={cn("w-8 h-8", theme === 'dark' ? "text-white" : "text-black")} />
                  </div>
                  <h3 className="text-2xl font-black text-center mb-2">{lang === 'fr' ? "Code de sécurité colis" : "Parcel Security Code"}</h3>
                  <p className="text-sm opacity-60 text-center mb-8">{lang === 'fr' ? "Définissez un code secret pour cette livraison. Le destinataire devra fournir ce code au chauffeur à son arrivée." : "Set a secret code for this delivery. The recipient must provide this code to the driver upon arrival."}</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4 text-white">{lang === 'fr' ? "Code à 4 chiffres" : "4-Digit Security Code"}</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="••••"
                        value={parcelSecretCode}
                        onChange={(e) => setParcelSecretCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className={cn("w-full bg-white/5 border rounded-2xl p-5 text-center text-3xl font-mono tracking-[1em] outline-none transition-colors text-white", theme === 'dark' ? "border-white/10 focus:border-white/50" : "border-black/10 focus:border-black/50")}
                      />
                    </div>

                    <button 
                      onClick={() => {
                        if (parcelSecretCode.length === 4) {
                          setShowParcelCodeSetup(false);
                          findDriver();
                        } else {
                          setNotification({ message: lang === 'fr' ? "Veuillez entrer un code à 4 chiffres" : "Please enter a 4-digit code", type: 'error' });
                        }
                      }}
                      className={cn("w-full font-black py-4 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest", theme === 'dark' ? "bg-white text-black shadow-xl shadow-white/20" : "bg-black text-white shadow-xl shadow-black/20")}
                    >
                      {lang === 'fr' ? "Confirmer la configuration" : "Confirm Setup"}
                    </button>
                    <button 
                      onClick={() => setShowParcelCodeSetup(false)} 
                      className="w-full glass py-4 rounded-2xl font-bold text-sm tracking-widest opacity-60 hover:opacity-100 transition-opacity uppercase"
                    >
                      {lang === 'fr' ? "Retour" : "Back"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {isVerifyingParcelCode && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] backdrop-blur-2xl bg-black/90 flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className={cn("w-full max-w-sm glass border rounded-[40px] p-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden", theme === 'dark' ? "border-white/20" : "border-black/10")}>
                  <div className={cn("absolute top-0 left-0 w-full h-1", theme === 'dark' ? "bg-white/10" : "bg-black/5")}>
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.25 }}
                      className={cn("h-full", theme === 'dark' ? "bg-white" : "bg-black")}
                    />
                  </div>
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border", theme === 'dark' ? "bg-white/10 border-white/20" : "bg-black/5 border-black/10")}>
                    <Package className={cn("w-8 h-8", theme === 'dark' ? "text-white" : "text-black")} />
                  </div>
                  <h3 className="text-2xl font-black text-center mb-2">{lang === 'fr' ? "Vérification du destinataire" : "Recipient Verification"}</h3>
                  <p className="text-sm opacity-60 text-center mb-8">{lang === 'fr' ? "Veuillez entrer le code de sécurité fourni par l'expéditeur pour libérer le colis." : "Please enter the security code provided by the sender to release the parcel."}</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4 text-white">{lang === 'fr' ? "Entrez le code à 4 chiffres" : "Enter 4-Digit Code"}</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="••••"
                        value={userInputParcelCode}
                        onChange={(e) => setUserInputParcelCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className={cn("w-full bg-white/5 border rounded-2xl p-5 text-center text-3xl font-mono tracking-[1em] outline-none transition-colors text-white", theme === 'dark' ? "border-white/10 focus:border-white/50" : "border-black/10 focus:border-black/50")}
                      />
                    </div>

                      <button 
                        onClick={() => {
                          if (userInputParcelCode === parcelSecretCode) {
                            setIsVerifyingParcelCode(false);
                            setNotification({ message: lang === 'fr' ? "Code vérifié ! Colis livré." : "Code Verified! Parcel Delivered.", type: 'success' });
                            setShowDriverRating(true);
                            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                          } else {
                            setNotification({ message: lang === 'fr' ? "Code incorrect. Accès refusé." : "Incorrect Code. Access Denied.", type: 'error' });
                            setUserInputParcelCode("");
                            const errorSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
                            errorSound.play().catch(() => {});
                          }
                        }}
                        className={cn("w-full font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest", theme === 'dark' ? "bg-white text-black shadow-white/20" : "bg-black text-white shadow-black/20")}
                      >
                      {lang === 'fr' ? "Déverrouiller et terminer la livraison" : "Unlock & Complete Delivery"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {showEmergencyConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[130] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/90" : "bg-white/90")}>
                <div className="w-full max-w-sm glass border border-red-500/7 rounded-[40px] p-8 text-center shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-red-500/30 rounded-full" />
                    <AlertTriangle className="w-10 h-10 text-red-500 relative z-10" />
                  </div>
                  <h3 className="text-2xl font-display mb-4 joy-gradient font-bold">{t('emergency')}</h3>
                  
                  <div className="bg-red-500/2 p-4 rounded-2xl mb-8 text-left border border-red-500/5">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Instructions</p>
                    <p className="text-[11px] leading-relaxed opacity-80">
                      {lang === 'fr' ? 
                        "Avant d'appeler la police, assurez-vous de noter : le nom du chauffeur, le matricule du véhicule, votre adresse actuelle et les indices visuels aux alentours." : 
                        "Before calling the police, ensure you note: the driver's name, vehicle plate number, your current address, and surrounding visual landmarks."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button onClick={executeEmergencyCall} className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/30 transition-transform active:scale-95 flex items-center justify-center gap-3">
                      <Phone className="w-5 h-5" /> {t('emergency112')}
                    </button>
                    <button onClick={() => { window.location.href = "tel:10111"; setShowEmergencyConfirm(false); }} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-600/30 transition-transform active:scale-95 flex items-center justify-center gap-3">
                      <Shield className="w-5 h-5" /> {t('policeSA')}
                    </button>
                    <button onClick={() => setShowEmergencyConfirm(false)} className="w-full glass py-4 rounded-2xl border border-white/5 font-bold opacity-50 hover:opacity-100 transition-opacity">{t('cancel')}</button>
                  </div>
                </div>
              </motion.div>
            )}

            {showRateClient && lastCompletedTrip && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[130] backdrop-blur-xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/90" : "bg-white/90")}>
                <div className={cn("w-full max-w-md glass border rounded-[40px] p-8 shadow-2xl backdrop-blur-3xl text-center", theme === 'dark' ? "border-white/20" : "border-black/10")}>
                  <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6", theme === 'dark' ? "bg-white/10" : "bg-black/5")}>
                    <User className={cn("w-10 h-10", theme === 'dark' ? "text-white" : "text-black")} />
                  </div>
                  <h3 className="text-2xl font-display mb-2 joy-gradient font-bold">{lang === 'fr' ? "Notez le Client" : "Rate the Client"}</h3>
                  <p className="text-sm opacity-50 mb-8">{lastCompletedTrip.customer}</p>
                  
                  <div className="flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={`rating-client-star-${star}`} 
                        onClick={() => setRatingToClient(star)}
                        className="focus:outline-none transition-transform active:scale-125"
                      >
                        <Star className={cn("w-10 h-10", ratingToClient >= star ? "text-[#D4AF37] fill-[#D4AF37]" : "text-white/10")} />
                      </button>
                    ))}
                  </div>

                  <div className="mb-8">
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-3 text-left font-bold">{lang === 'fr' ? "Commentaires (Optionnel)" : "Feedback (Optional)"}</label>
                    <textarea 
                      value={driverCommentToClient}
                      onChange={(e) => setDriverCommentToClient(e.target.value)}
                      placeholder={lang === 'fr' ? "Comment s'est passé le trajet avec ce client ?" : "How was the trip with this client?"}
                      className={cn("w-full glass p-4 rounded-2xl text-sm focus:outline-none border transition-all h-32 resize-none", theme === 'dark' ? "border-white/10 focus:border-white/40" : "border-black/10 focus:border-black/30")}
                    />
                  </div>

                    <button 
                      onClick={() => {
                        console.log(`Driver rated client ${ratingToClient}/5 with comment: ${driverCommentToClient}`);
                        setShowRateClient(false);
                        setShowDriverTripSummary(true);
                      }} 
                      disabled={ratingToClient === 0}
                      className={cn("w-full font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-50", theme === 'dark' ? "bg-white text-black shadow-white/20" : "bg-black text-white shadow-black/20")}
                    >
                    {lang === 'fr' ? "Soumettre" : "Submit Rating"}
                  </button>
                </div>
              </motion.div>
            )}

            {showDriverTripSummary && lastCompletedTrip && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[130] backdrop-blur-xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/90" : "bg-white/90")}>
                <div className={cn("w-full max-w-md glass border rounded-[40px] p-8 shadow-2xl backdrop-blur-3xl", theme === 'dark' ? "border-white/20" : "border-black/10")}>
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6", theme === 'dark' ? "bg-white/10" : "bg-black/5")}>
                    <CheckCircle2 className={cn("w-10 h-10", theme === 'dark' ? "text-white" : "text-black")} />
                  </div>
                  <h3 className="text-2xl font-display text-center mb-2 joy-gradient font-bold">{t('tripCompleted')}</h3>
                  <p className="text-center text-sm opacity-50 mb-8">{lang === 'fr' ? "Résumé de la course" : "Trip Summary"}</p>
                  
                  <div className="overflow-hidden rounded-2xl border border-white/10 mb-6">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="p-4 text-[10px] uppercase tracking-widest opacity-50 font-bold">{lang === 'fr' ? "Détail" : "Detail"}</th>
                          <th className="p-4 text-[10px] uppercase tracking-widest opacity-50 font-bold text-right">{lang === 'fr' ? "Valeur" : "Value"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr>
                          <td className="p-4 text-sm opacity-70">{lang === 'fr' ? "Client" : "Customer"}</td>
                          <td className="p-4 text-sm font-bold text-right">{lastCompletedTrip.customer}</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-sm opacity-70">{lang === 'fr' ? "Prix" : "Price"}</td>
                          <td className={cn("p-4 text-sm font-bold text-right", theme === 'dark' ? "text-white" : "text-black")}>{countryInfo.currency} {lastCompletedTrip.price}</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-sm opacity-70">{lang === 'fr' ? "Distance" : "Distance"}</td>
                          <td className="p-4 text-sm font-bold text-right">{lastCompletedTrip.distance}</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-sm opacity-70">{lang === 'fr' ? "De" : "From"}</td>
                          <td className="p-4 text-[10px] font-bold text-right opacity-80">{lastCompletedTrip.from}</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-sm opacity-70">{lang === 'fr' ? "À" : "To"}</td>
                          <td className="p-4 text-[10px] font-bold text-right opacity-80">{lastCompletedTrip.to}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <button 
                      onClick={() => toggleFavoriteDriver(lastCompletedTrip.customer)}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95",
                        favoriteDrivers.includes(lastCompletedTrip.customer) 
                          ? (theme === 'dark' ? "bg-white text-black" : "bg-black text-white")                          : "glass border border-white/10"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", favoriteDrivers.includes(lastCompletedTrip.customer) && "fill-current")} />
                      {favoriteDrivers.includes(lastCompletedTrip.customer) ? t('saveDriver') : t('saveDriver')}
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowDriverTripSummary(false)} 
                    className={cn("w-full font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95", theme === 'dark' ? "bg-white text-black shadow-white/20" : "bg-black text-white shadow-black/20")}
                  >
                    {lang === 'fr' ? "Retour au tableau de bord" : "Back to Dashboard"}
                  </button>
                </div>
              </motion.div>
            )}

            {showDriverRating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[140] backdrop-blur-3xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/95" : "bg-white/95")}>
                <div className="w-full max-w-md glass border border-white/10 rounded-[40px] p-8 overflow-y-auto max-h-[90vh] shadow-2xl backdrop-blur-3xl custom-scrollbar">
                  {driverRatingToUser === 0 ? (
                    <>
                      <div className="text-center mb-8">
                        <div className={cn("w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 relative group border-[#D4AF37] shadow-[#D4AF37]/30")}>
                          <img src={driverInfo.photo} alt="Driver" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => toggleFavoriteDriver(driverInfo.name)}
                            className={cn("absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", favoriteDrivers.some(d => d.name === driverInfo.name) && "opacity-100")}
                          >
                            <Heart className={cn("w-8 h-8", favoriteDrivers.some(d => d.name === driverInfo.name) ? "text-white fill-white" : "text-white")} />
                          </button>
                        </div>
                        <h3 className="text-2xl font-display joy-gradient font-bold">{t('rateDriver')}</h3>
                        <p className="text-xs opacity-50">{driverInfo.name} • {driverInfo.car}</p>
                      </div>

                      <div className="space-y-6">
                        <div className={cn("p-6 rounded-3xl border border-dashed text-center space-y-4", theme === 'dark' ? "border-white/20" : "border-black/10")}>
                          <p className="text-sm font-bold opacity-70">{t('forgotSomething')}</p>
                          {showInAppCall ? (
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-in fade-in zoom-in duration-300">
                              <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Direct Contact</p>
                              <p className={cn("text-lg font-mono font-bold", theme === 'dark' ? "text-white" : "text-black")}>{driverInfo.phone}</p>
                              <button 
                                onClick={() => startCall()}
                                className="w-full py-3 mt-4 glass rounded-xl text-xs font-bold uppercase tracking-widest bg-white/5"
                              >
                                {lang === 'fr' ? "Appeler en App-App" : "In-App Call"}
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startCall()}
                              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] shadow-lg bg-[#D4AF37] text-white shadow-[#D4AF37]/20 border border-[#D4AF37]/50"
                            >
                              <Phone className="w-4 h-4" /> {t('callDriverManual')}
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <p className="text-sm font-bold opacity-70 text-center">{t('rateDriver')}</p>
                          <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                key={`rating-driver-input-${star}`} 
                                onClick={() => setRatingData({...ratingData, driver: star})}
                                className="focus:outline-none transition-transform active:scale-90"
                              >
                        <Star className={cn("w-10 h-10 transition-all", ratingData.driver >= star ? "text-[#D4AF37] fill-[#D4AF37]" : "text-white/10")} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-bold opacity-70">Review</p>
                          <textarea 
                            placeholder={t('feedbackPlaceholder')}
                            className="w-full glass p-4 rounded-2xl text-sm min-h-[100px] focus:outline-none"
                            value={ratingData.comment}
                            onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                          />
                        </div>

                        <div className="glass p-4 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {paymentMethod === 'cash' ? <Banknote className="w-5 h-5 text-emerald-400" /> : 
                             paymentMethod.startsWith('google') ? <Globe className="w-5 h-5 text-emerald-400" /> :
                             paymentMethod.startsWith('apple') ? <Smartphone className="w-5 h-5" /> :
                             <CreditCard className="w-5 h-5 text-emerald-400" />}
                            <span className="text-sm font-bold">
                              {paymentMethod === 'cash' ? t('cash') : 
                               savedCards.find(c => c.id === paymentMethod) ? `${savedCards.find(c => c.id === paymentMethod)?.brand} •••• ${savedCards.find(c => c.id === paymentMethod)?.number.slice(-4)}` :
                               digitalWallets.find(w => w.id === paymentMethod)?.name || t('card')}
                            </span>
                          </div>
                          <span className="text-xl font-display joy-gradient">{countryInfo.currency} {selectedRide?.price || (selectedRide as any)?.calculatedPrice}</span>
                        </div>

                        <button 
                          onClick={() => {
                            confetti();
                            setShowInAppCall(false);
                            setDriverRatingToUser(Math.floor(Math.random() * 2) + 4);
                          }}
                          className="w-full font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.95] bg-[#D4AF37] text-white shadow-[#D4AF37]/20 border border-[#D4AF37]/50"
                        >
                          {t('submitFeedback')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 space-y-8">
                      <div className={cn("w-24 h-24 rounded-full mx-auto overflow-hidden border-4 shadow-2xl border-[#D4AF37] shadow-[#D4AF37]/30")}>
                        <img src={driverInfo.photo} alt="Driver" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-display joy-gradient font-bold mb-2">{driverInfo.name} rated you!</h3>
                        <p className="text-sm opacity-60">The driver enjoyed the trip with you.</p>
                      </div>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={`driver-rating-display-${star}`} className={cn("w-10 h-10", star <= driverRatingToUser ? "text-[#D4AF37] fill-[#D4AF37]" : "opacity-10")} />
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          setShowDriverRating(false);
                          setShowInAppCall(false);
                          setDriverRatingToUser(0);
                          setRatingData({ driver: 0, vehicle: 0, trip: 0, price: 0, comment: '' });
                          setAppState('map');
                          setMapCenter(null);
                        }}
                        className="w-full bg-white text-black font-bold py-4 rounded-2xl shadow-xl"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Interaction Area */}
          <div className="absolute bottom-0 left-0 right-0 px-0 sm:px-6 pb-0 safe-bottom z-30 flex flex-col items-center pointer-events-none">
            {/* Pull-up Handle when panel is hidden */}
            {appState === 'map' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 w-12 h-1.5 bg-white/40 rounded-full shadow-lg pointer-events-auto cursor-pointer hover:bg-white/60 transition-colors soft-light-band"
                onClick={() => setIsInputExpanded('destination')}
              />
            )}
            <AnimatePresence>
              {appState === 'map' && (
                <div className="mobile-edge-container">
                  <motion.div 
                    initial={{ y: '100%' }} 
                    animate={{ y: 0 }} 
                    exit={{ y: '100%' }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 220 }}
                    dragElastic={0.1}
                    className="mobile-edge-panel glass sm:p-8 p-6 shadow-2xl backdrop-blur-3xl pointer-events-auto max-h-[85vh] overflow-y-auto custom-scrollbar relative"
                  >
                    <div className={cn("w-12 h-1 rounded-full mx-auto mb-6", theme === 'dark' ? "bg-white/20" : "bg-black/10")} />
                    <div className="space-y-4">
                      <div className={cn("relative transition-all duration-300 luminous-earth rounded-2xl", isInputExpanded === 'origin' ? "scale-[1.02]" : "")}>
                        <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(210,105,30,0.5)]",
                          theme === 'dark' ? "bg-[#D2691E]" : "bg-[#8B4513]"
                        )} />
                        
                        {/* Connecting Line with Luminous Blue Dot */}
                        {!isInputExpanded && (
                          <div className="absolute left-[20px] top-[100%] h-4 flex flex-col items-center z-10">
                            <div className="w-0.5 h-full bg-white/20" />
                            <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,1)] ring-2 ring-[#00FF88]/30 animate-pulse" />
                          </div>
                        )}
                        {isLoaded && (
                          <Autocomplete 
                            onLoad={a => originRef.current = a} 
                            onPlaceChanged={() => {
                              const place = originRef.current?.getPlace();
                              const address = place?.formatted_address || place?.name || "";
                              if (address) {
                                setOrigin(address);
                                if (isMallAddress(address)) {
                                  setMallEntrancePrompt({ show: true, type: 'origin' });
                                }
                              }
                              setIsInputExpanded(null);
                              setSuggestedAddresses([]);
                            }}
                            options={{ types: ['geocode'], componentRestrictions: { country: 'za' } }}
                          >
                            <input 
                              type="text" 
                              placeholder={t('from')} 
                              className={cn(
                                "w-full bg-transparent border border-white/20 rounded-2xl py-5 pl-12 pr-4 text-sm font-black focus:outline-none focus:border-[#6B21A8]/60 focus:shadow-[0_0_25px_rgba(107,33,168,0.4)] transition-all",
                                theme === 'dark' 
                                  ? "placeholder:text-white/40 text-white" 
                                  : "placeholder:text-black/30 text-black",
                                isInputExpanded === 'origin' ? "h-20 text-lg" : "h-14"
                              )} 
                              value={origin} 
                              onFocus={() => {
                                setIsInputExpanded('origin');
                                setIsLockingFocus(true);
                                if (!origin) {
                                  setSuggestedAddresses(frequentAddresses.map(a => a.address));
                                }
                              }}
                              onBlur={() => {
                                if (!isLockingFocus) {
                                  setTimeout(() => setIsInputExpanded(null), 200);
                                }
                              }}
                              onChange={e => {
                                setOrigin(e.target.value);
                                fetchSuggestions(e.target.value);
                              }} 
                            />
                          </Autocomplete>
                        )}
                      </div>

                    <div className="flex justify-between items-center pr-2">
                      <button 
                        onClick={() => {
                          if (origin) {
                            setFavoriteAddresses([...favoriteAddresses, { id: Math.random().toString(), name: "Favorite", address: origin }]);
                            confetti();
                          }
                        }}
                        className={cn("text-[10px] uppercase tracking-widest transition-opacity flex items-center gap-1", theme === 'dark' ? "opacity-50 hover:opacity-100" : "opacity-70 hover:opacity-100 text-black")}
                      >
                        <Heart className="w-3 h-3" />
                        {t('saveAddress')}
                      </button>

                      {isInputExpanded && (
                        <motion.button 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          onClick={() => {
                            setIsInputExpanded(null);
                            setIsLockingFocus(false);
                            if (selectionPoint) {
                              setSelectionPoint(null);
                            }
                          }}
                          className="bg-[#00FF88] text-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-[0_0_20px_rgba(0,255,136,0.6)] border border-white/20 active:scale-95 transition-all glow-option"
                        >
                          {lang === 'fr' ? 'Valider' : 'Done'}
                        </motion.button>
                      )}

                      <button 
                        onClick={() => setShowStopInput(!showStopInput)} 
                        className="text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 text-red-500 font-bold"
                      >
                        {showStopInput ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {t('addStop')}
                      </button>
                    </div>

                    {showStopInput && (
                      <div className={cn("relative transition-all duration-300", isInputExpanded === 'stop' ? "scale-[1.02]" : "")}>
                        <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-sm bg-[#FF3131] shadow-[0_0_8px_rgba(255,49,49,0.4)]")} />
                        {isLoaded && (
                          <Autocomplete 
                            onLoad={a => stopRef.current = a} 
                            onPlaceChanged={() => {
                              const place = stopRef.current?.getPlace();
                              if (place?.formatted_address) {
                                setStopAddress(place.formatted_address);
                              } else if (place?.name) {
                                setStopAddress(place.name);
                              }
                              setIsInputExpanded(null);
                              setSuggestedAddresses([]);
                            }}
                            options={{ types: ['geocode'], componentRestrictions: { country: 'za' } }}
                          >
                            <input 
                              type="text" 
                              placeholder={t('addStop')} 
                              className={cn(
                                "w-full bg-transparent border border-red-500/30 rounded-2xl py-5 pl-12 pr-4 text-sm font-black focus:outline-none focus:ring-2 transition-all",
                                theme === 'dark' ? "placeholder:text-red-500/40 text-red-400 focus:ring-red-500/50" : "placeholder:text-red-900/40 text-red-900 focus:ring-red-900/30",
                                isInputExpanded === 'stop' ? "h-20 text-lg" : "h-14"
                              )}
                              value={stopAddress} 
                              onFocus={() => {
                                setIsInputExpanded('stop');
                                setIsLockingFocus(true);
                                if (!stopAddress) {
                                  setSuggestedAddresses(frequentAddresses.map(a => a.address));
                                }
                              }}
                              onBlur={() => {
                                if (!isLockingFocus) {
                                  setTimeout(() => setIsInputExpanded(null), 200);
                                }
                              }}
                              onChange={e => {
                                setStopAddress(e.target.value);
                                fetchSuggestions(e.target.value);
                              }} 
                            />
                          </Autocomplete>
                        )}
                      </div>
                    )}

                    <div className={cn("relative transition-all duration-300 luminous-earth rounded-2xl", isInputExpanded === 'dest' ? "scale-[1.02]" : "")}>
                      <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border shadow-[0_0_8px_rgba(255,255,255,0.4)]", 
                        theme === 'dark' ? "bg-white border-white shadow-white/50" : "bg-black border-black shadow-black/20")} />
                      {isLoaded && (
                        <Autocomplete 
                          onLoad={a => destRef.current = a} 
                          onPlaceChanged={() => {
                            const place = destRef.current?.getPlace();
                            const address = place?.formatted_address || place?.name || "";
                            if (address) {
                              setDestination(address);
                              if (isMallAddress(address)) {
                                setMallEntrancePrompt({ show: true, type: 'dest' });
                              }
                            }
                            setIsInputExpanded(null);
                            setSuggestedAddresses([]);
                          }}
                          options={{ types: ['geocode'], componentRestrictions: { country: 'za' } }}
                        >
                            <input 
                              type="text" 
                              placeholder={t('whereTo')} 
                              className={cn(
                                "w-full bg-transparent border border-white/20 rounded-2xl py-5 pl-12 pr-4 text-sm font-black focus:outline-none focus:border-[#6B21A8]/60 focus:shadow-[0_0_25px_rgba(107,33,168,0.4)] transition-all",
                                theme === 'dark' 
                                  ? "placeholder:text-white/40 text-white" 
                                  : "placeholder:text-black/30 text-black",
                                isInputExpanded === 'dest' ? "h-20 text-lg" : "h-14"
                              )} 
                              value={destination} 
                            onFocus={() => {
                              setIsInputExpanded('dest');
                              setIsLockingFocus(true);
                              if (!destination) {
                                setSuggestedAddresses(frequentAddresses.map(a => a.address));
                              }
                            }}
                            onBlur={() => {
                              if (!isLockingFocus) {
                                setTimeout(() => setIsInputExpanded(null), 200);
                              }
                            }}
                            onChange={e => {
                              setDestination(e.target.value);
                              fetchSuggestions(e.target.value);
                            }} 
                          />
                        </Autocomplete>
                      )}
                    </div>

                    {predictedDestination && !destination && appState === 'map' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2"
                      >
                        <button 
                          onClick={() => {
                            setDestination(predictedDestination);
                            confetti();
                          }}
                          className={cn(
                            "glass px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 hover:bg-white/10 transition-all group luminous-earth",
                            theme === 'dark' ? "text-[#F5DEB3]" : "text-black"
                          )}
                        >
                          <Sparkles className={cn("w-4 h-4 group-hover:scale-110 transition-transform", theme === 'dark' ? "text-white" : "text-black")} />
                          <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest opacity-50 font-black">AI Suggested</p>
                            <p className="text-xs font-bold truncate max-w-[200px]">{predictedDestination}</p>
                          </div>
                        </button>
                      </motion.div>
                    )}

                    <div className="flex justify-between items-center pr-2 mb-2">
                      {destination && (
                        <motion.button 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => {
                            setFavoriteAddresses(prev => [...prev, { id: Math.random().toString(), name: "Favorite", address: destination }]);
                            confetti();
                          }}
                          className={cn("text-[10px] uppercase tracking-widest transition-opacity flex items-center gap-1 font-bold", theme === 'dark' ? "text-white/50 hover:text-white" : "text-black/60 hover:text-black")}
                        >
                          <Heart className={cn("w-3 h-3", theme === 'dark' ? "text-white" : "text-black")} />
                          {t('saveAddress')}
                        </motion.button>
                      )}
                    </div>

                    {suggestedAddresses.length > 0 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="glass rounded-2xl overflow-hidden border border-white/20 max-h-60 overflow-y-auto custom-scrollbar shadow-2xl"
                      >
                        <div className="p-2 border-b border-white/10 bg-white/5">
                          <p className={cn("text-[10px] font-extrabold uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-black")}>{t('suggestions')}</p>
                        </div>
                        {suggestedAddresses.map((addr, idx) => {
                          const mall = isMallAddress(addr);
                          return (
                            <div key={`suggested-address-container-${idx}`}>
                              <div 
                                onClick={() => {
                                  if (isInputExpanded === 'origin') {
                                    setOrigin(addr);
                                    if (mall) setMallEntrancePrompt({ show: true, type: 'origin' });
                                  } else if (isInputExpanded === 'stop') {
                                    setStopAddress(addr);
                                    if (mall) setMallEntrancePrompt({ show: true, type: 'stop' });
                                  } else if (isInputExpanded === 'dest') {
                                    setDestination(addr);
                                    if (mall) setMallEntrancePrompt({ show: true, type: 'dest' });
                                  }
                                  setSuggestedAddresses([]);
                                }}
                                className="w-full text-left p-4 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 flex items-center justify-between group cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <MapPin className={cn("w-4 h-4", theme === 'dark' ? "text-white" : "text-black")} />
                                  <span className={cn("text-sm font-extrabold", theme === 'dark' ? "text-white" : "text-black")}>{addr}</span>
                                </div>
                                {mall && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <button
                                        key={`quick-entrance-${n}-${idx}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const finalAddr = `${addr} (${t('entrance')} ${n})`;
                                          if (isInputExpanded === 'origin') setOrigin(finalAddr);
                                          else if (isInputExpanded === 'stop') setStopAddress(finalAddr);
                                          else if (isInputExpanded === 'dest') setDestination(finalAddr);
                                          setSuggestedAddresses([]);
                                        }}
                                        className={cn("w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all", theme === 'dark' ? "bg-white/10 border-white/30 text-white" : "bg-black/5 border-black/10 text-black")}
                                      >
                                        E{n}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}

                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={calculateRoute} 
                      disabled={!origin || !destination} 
                      className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-neutral-100 transition-colors disabled:opacity-50 shadow-lg glow-option"
                    >
                      {t('search')}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}

              {appState === 'vehicle-selection' && (
                <div className="mobile-edge-container">
                  <motion.div 
                    initial={{ y: '100%' }} 
                    animate={{ y: 0 }} 
                    exit={{ y: '100%' }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 220 }}
                    dragElastic={0.1}
                    className="mobile-edge-panel glass sm:p-8 p-4 shadow-2xl pointer-events-auto max-h-[85vh] overflow-y-auto custom-scrollbar relative"
                  >
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.button 
                        whileHover={{ x: -2 }}
                        onClick={() => {
                          setAppState('map');
                          setDirections(null);
                        }}
                        className="w-10 h-10 rounded-full glass border border-[#00FF88]/30 flex items-center justify-center hover:bg-[#00FF88]/10 text-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </motion.button>
                      <div>
                        <h3 className="text-xl font-display joy-gradient font-bold leading-tight">{t('search')}</h3>
                        <p className={cn("text-[10px] uppercase tracking-widest font-bold", theme === 'dark' ? "text-white/40" : "text-black/50")}>Configure your trip</p>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setFavoriteAddresses(prev => [...prev, { id: Math.random().toString(), name: "Favorite", address: destination }]);
                        confetti();
                      }}
                      className={cn("flex items-center gap-2 border px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", 
                        theme === 'dark' ? "bg-white/5 border-white/10 opacity-60 hover:opacity-100" : "bg-black/5 border-black/10 text-black opacity-80 hover:opacity-100")}
                    >
                      <Heart className={cn("w-3 h-3", theme === 'dark' ? "text-white fill-white/20" : "text-black fill-black/10")} />
                      {t('saveAddress')}
                    </motion.button>
                  </div>
                  
                      <div className="flex flex-col gap-1 w-full mb-6">
                        <div className="flex items-center gap-3 glass p-3 rounded-2xl border border-white/10 relative group">
                          <div className={cn("w-2 h-2 rounded-full", theme === 'dark' ? "bg-[#D2691E]" : "bg-[#8B4513]")} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[7px] uppercase tracking-widest opacity-40 font-black">{t('departure')}</p>
                            <p className="text-[10px] font-bold truncate opacity-80">{origin}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setAppState('map');
                              setDirections(null);
                              setIsInputExpanded('origin');
                            }}
                            className="p-2 glass rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                          >
                            <Edit2 className="w-3 h-3 text-[#D4AF37]" />
                          </button>
                        </div>
                        <div className="w-px h-2 bg-white/10 ml-4" />
                        <div className="flex items-center gap-3 glass p-3 rounded-2xl border border-white/10 relative group">
                          <div className={cn("w-2 h-2", theme === 'dark' ? "bg-white" : "bg-black")} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[7px] uppercase tracking-widest opacity-40 font-black">{t('destinationLabel')}</p>
                            <p className="text-[10px] font-bold truncate opacity-80">{destination}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setAppState('map');
                              setDirections(null);
                              setIsInputExpanded('dest');
                            }}
                            className="p-2 glass rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                          >
                            <Edit2 className="w-3 h-3 text-[#D4AF37]" />
                          </button>
                        </div>
                      </div>

                      {/* Ride Filters */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-4 custom-scrollbar no-scrollbar scroll-smooth">
                    {[
                      { id: 'recommended', en: 'Recommended', fr: 'Recommandé' },
                      { id: 'fastest', en: 'Fastest', fr: 'Plus rapide' },
                      { id: 'cheapest', en: 'Cheapest', fr: 'Moins cher' }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setRideFilter(filter.id as any)}
                        className={cn(
                          "px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap relative overflow-hidden group",
                          rideFilter === filter.id 
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_8px_25px_rgba(212,175,55,0.4)] scale-[1.05]"
                            : "glass border-white/10 opacity-60 hover:opacity-100 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        {rideFilter === filter.id && (
                          <motion.div 
                            layoutId="active-filter-bg"
                            className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          {rideFilter === filter.id && <div className="w-1 h-1 rounded-full bg-black animate-pulse" />}
                          {lang === 'fr' ? filter.fr : filter.en}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {RIDE_TYPES
                      .map(ride => {
                        const legs = tripDirections?.routes[0]?.legs || [];
                        const totalDistance = legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0);
                        const totalDuration = legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0);
                        
                        const distanceKm = totalDistance ? totalDistance / 1000 : 5;
                        const durationMin = totalDuration ? Math.ceil(totalDuration / 60) : 10;
                        
                        // Dynamic price calculation
                        const serviceFee = 5; // South African Service Fee/Tax Levy
                        const stopFee = legs.length > 1 ? 25 : 0; // R25 fee per additional stop
                        const calculatedPrice = ride.id === 'joy_moving' ? 0 : Math.ceil(ride.basePrice + (distanceKm * ride.pricePerKm) + serviceFee + stopFee + waitingPenalty);
                        const calculatedTime = `${Math.max(1, Math.ceil(durationMin * (ride.id === 'joy_lite' ? 1.2 : ride.id === 'joy_express' ? 0.8 : 1)))} min`;
                        
                        return { ...ride, calculatedPrice, calculatedTime, distanceKm, durationMin };
                      })
                      .sort((a, b) => {
                        if (rideFilter === 'cheapest') return a.calculatedPrice - b.calculatedPrice;
                        if (rideFilter === 'fastest') return parseInt(a.calculatedTime) - parseInt(b.calculatedTime);
                        return 0; // Recommended uses default order
                      })
                      .map((ride, i) => (
                      <motion.button 
                        key={ride.id} 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ 
                          opacity: 1, 
                          scale: selectedRide.id === ride.id ? 1.02 : 1,
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ 
                          opacity: { duration: 0.2, delay: i * 0.03 },
                          scale: { type: 'spring', stiffness: 300, damping: 25 },
                          layout: { duration: 0.3 }
                        }}
                        onClick={() => setSelectedRide(ride)} 
                        onDoubleClick={() => setSelectedVehicleDetails(ride)}
                        className={cn(
                          "w-full flex items-center gap-4 p-3 rounded-2xl transition-all border relative overflow-hidden group glow-option", 
                          selectedRide.id === ride.id 
                            ? "bg-gradient-to-r from-[#D4AF37] to-[#B8860B] border-white shadow-[0_0_30px_rgba(212,175,55,0.5)] text-black glow-option-active scale-[1.02]" 
                            : "bg-[rgba(245,245,220,0.01)] border-[var(--beige-border)] hover:bg-[rgba(245,245,220,0.03)]"
                        )}
                      >
                        {selectedRide.id === ride.id && (
                          <motion.div 
                            layoutId="active-ride-indicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        <div className={cn(
                          "w-24 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500", 
                          selectedRide.id === ride.id 
                            ? "bg-[#D4AF37] text-black shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] scale-110 border border-[#D4AF37]" 
                            : (theme === 'dark' ? "bg-white/5 border border-white/5" : "bg-black/5 border border-black/5")
                        )}>
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="w-full h-full flex items-center justify-center p-2 relative"
                          >
                            <img 
                              src={ride.image} 
                              alt={ride.name}
                              className={cn(
                                "w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10",
                                ride.id === 'joy_parcels' && "rotate-3",
                                ride.id === 'joy_lite' && ""
                              )}
                              style={{ 
                                filter: selectedRide.id === ride.id ? 'brightness(1.1) contrast(1.1)' : 'brightness(0.9) grayscale(0.2)'
                              }}
                              referrerPolicy="no-referrer"
                            />
                          </motion.div>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs">{ride.name}</p>
                            {selectedRide.id === ride.id && (
                              <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold", theme === 'dark' ? "bg-white/20 text-white" : "bg-black/10 text-black")}>
                                {ride.distanceKm.toFixed(1)} km
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] opacity-50">{ride.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] font-bold uppercase tracking-widest opacity-40 mb-0.5 leading-none">{t('totalEstimated')}</p>
                          <p className={cn("font-bold text-xs", ride.id === 'joy_moving' && (selectedRide.id === ride.id ? "text-black" : "text-white"))}>
                            {ride.id === 'joy_moving' ? 'Negociable' : `${countryInfo.currency} ${ride.calculatedPrice}`}
                          </p>
                          <p className="text-[9px] opacity-40">{ride.calculatedTime}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                    {/* Price Breakdown */}
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="glass p-4 rounded-2xl border border-white/5 mb-6 space-y-2 overflow-hidden"
                    >
                      <div className="flex justify-between items-center text-[10px] opacity-60">
                        <span>{t('baseFare')}</span>
                        <span>{countryInfo.currency} {selectedRide.basePrice || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] opacity-60">
                        <span>{t('pricePerKm')}</span>
                        <span>
                          {countryInfo.currency} {selectedRide.pricePerKm || 0} × {
                            (tripDirections?.routes[0]?.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0) / 1000).toFixed(1)
                          } km
                        </span>
                      </div>
                      {tripDirections?.routes[0]?.legs && tripDirections.routes[0].legs.length > 1 && (
                        <div className={cn("flex justify-between items-center text-[10px] font-bold", theme === 'dark' ? "text-white/80" : "text-black/80")}>
                          <span>{lang === 'fr' ? "Frais d'arrêt" : "Stop Fee"}</span>
                          <span>{countryInfo.currency} 25</span>
                        </div>
                      )}
                      <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center bg-white/5 -mx-4 px-4 py-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t('totalEstimated')}</span>
                        <span className="text-lg font-display font-black text-white">
                          {`${countryInfo.currency} ${
                            (() => {
                              const legs = tripDirections?.routes[0]?.legs || [];
                              const totalDist = legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0) / 1000;
                              const stopFee = legs.length > 1 ? 25 : 0;
                              return Math.ceil((selectedRide.basePrice || 0) + (selectedRide.pricePerKm || 0) * totalDist + 5 + stopFee + waitingPenalty);
                            })()
                          }`}
                        </span>
                      </div>
                  </motion.div>

                  <div className="flex items-center justify-between mb-6 px-2">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">{t('paymentMethod')}</p>
                    <button 
                      onClick={() => setShowPayment(true)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all",
                        theme === 'dark' ? "glass" : "bg-white shadow-sm border-black/5"
                      )}
                    >
                      {paymentMethod === 'cash' ? <Banknote className="w-4 h-4 text-emerald-500" /> : 
                       paymentMethod.startsWith('google') ? <Globe className="w-4 h-4 text-emerald-500" /> :
                       paymentMethod.startsWith('apple') ? <Smartphone className="w-4 h-4" /> :
                       <CreditCard className={cn("w-4 h-4", theme === 'dark' ? "text-white" : "text-black")} />}
                      
                      <div className="text-left">
                        <p className="text-[10px] font-bold">
                          {paymentMethod === 'cash' ? t('cash') : 
                           savedCards.find(c => c.id === paymentMethod) ? `${savedCards.find(c => c.id === paymentMethod)?.brand} •••• ${savedCards.find(c => c.id === paymentMethod)?.number.slice(-4)}` :
                           digitalWallets.find(w => w.id === paymentMethod)?.name || t('payment')}
                        </p>
                      </div>
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAppState('map')} 
                      className="flex-1 glass py-4 rounded-2xl text-sm font-bold"
                    >
                      {t('cancel')}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        console.log("Confirm button clicked");
                        if (selectedRide.id === 'joy_parcels') {
                          setShowParcelCodeSetup(true);
                        } else {
                          findDriver();
                        }
                      }} 
                      className={cn("flex-[2] font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group relative overflow-hidden glow-option", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10">{t('confirm')}</span>
                      <div className="w-px h-4 bg-current/20 relative z-10" />
                      <span className="relative z-10 text-[10px] tracking-widest opacity-80">
                        {`${countryInfo.currency}${Math.ceil((selectedRide.basePrice || 0) + ((selectedRide.pricePerKm || 0) * (tripDirections?.routes[0]?.legs[0]?.distance?.value ? tripDirections.routes[0].legs[0].distance.value / 1000 : 0)) + 5 + waitingPenalty)}`}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}

            {appState === 'searching' && (
                <div className="mobile-edge-container">
                  <motion.div 
                    initial={{ y: '100%' }} 
                    animate={{ y: 0 }} 
                    exit={{ y: '100%' }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 250 }}
                    dragElastic={0.1}
                    className="mobile-edge-panel glass sm:p-8 p-6 shadow-2xl pointer-events-auto max-h-[88vh] overflow-y-auto custom-scrollbar relative"
                  >
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <motion.div animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-white/20 rounded-full" />
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full" />
                    <img 
                      src={selectedRide.image} 
                      className="w-48 h-auto object-contain relative z-10 animate-float drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]" 
                      alt="Searching vehicle"
                      referrerPolicy="no-referrer"
                    />
                    {selectedRide.id === 'joy_lite' && (
                      <div className="absolute inset-x-8 top-[55%] h-0.5 bg-white blur-[1px] shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20 rounded-full opacity-80" />
                    )}
                  </div>
                  <h3 className="text-xl font-display mb-2 joy-gradient font-extrabold">{t('searchingDriver')}</h3>
                  
                  {selectedRide.id === 'joy_moving' && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={`driver-wait-avatar-${i}`} className="w-6 h-6 rounded-full border-2 border-black bg-white/10 flex items-center justify-center overflow-hidden">
                            <img src={`https://picsum.photos/seed/driver${i}/50/50`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <p className={cn("text-[10px] font-bold uppercase", theme === 'dark' ? "text-white" : "text-black")}>
                        {examiningDriversCount} drivers examining your offer...
                      </p>
                    </div>
                  )}

                  <p className={cn("text-xs font-bold opacity-80 mb-8 max-w-[200px] mx-auto", theme === 'dark' ? "text-white" : "text-black")}>
                    {selectedRide.id === 'joy_moving' && userOfferPrice && !showMovingNegotiation ? t('negotiating') : aiInsight}
                  </p>

                  {selectedRide.id === 'joy_moving' && userOfferPrice && !showMovingNegotiation && (
                    <div className={cn("mb-8 glass p-6 rounded-[32px] border bg-white/5", theme === 'dark' ? "border-white/30" : "border-black/10")}>
                      <p className="text-[10px] opacity-50 uppercase tracking-widest mb-1">{t('yourOffer')}</p>
                      <p className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-black")}>{countryInfo.currency} {userOfferPrice}</p>
                    </div>
                  )}

                  {selectedRide.id === 'joy_moving' && driverProposedPrice && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn("w-full max-w-[280px] glass p-6 rounded-[40px] border shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col space-y-6 relative overflow-hidden glow-option", 
                          theme === 'dark' ? "border-white/20 bg-black/70" : "border-black/10 bg-white/90") }
                      >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                        
                        {/* Header */}
                        <div className="text-center space-y-2 relative">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 border", theme === 'dark' ? "bg-white/10 border-white/30" : "bg-black/5 border-black/10")}>
                            <Truck className={cn("w-6 h-6", theme === 'dark' ? "text-white" : "text-black")} />
                          </div>
                          <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-black")}>{t('driverOffer')}</p>
                          <div className="flex items-center justify-center gap-1">
                            <span className={cn("text-sm font-bold opacity-60", theme === 'dark' ? "text-white" : "text-black")}>{countryInfo.currency}</span>
                            <span className={cn("text-4xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-black")}>{driverProposedPrice}</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Actions */}
                        <div className="space-y-3">
                          <button 
                            onClick={() => {
                              setNegotiatedPrice(driverProposedPrice);
                              if (paymentMethod !== 'cash') {
                                setPendingJoyMovingAcceptance(true);
                                setShowCardEntry(true);
                              } else {
                                setAppState('driver-found');
                                if (pickupDirections) {
                                  startPickupSimulation(pickupDirections);
                                }
                              }
                            }}
                            className={cn("w-full py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest glow-option", theme === 'dark' ? "bg-white text-black shadow-white/10" : "bg-black text-white shadow-black/20")}
                          >
                            {t('accept')}
                          </button>
                          <button 
                            onClick={() => setDriverProposedPrice(null)}
                            className={cn("w-full glass py-3 rounded-xl font-bold text-[10px] transition-all active:scale-95 glow-option", 
                              theme === 'dark' ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}
                          >
                            {t('decline')}
                          </button>
                        </div>

                        {/* Timer Footer */}
                        <div className="flex items-center justify-center gap-2 pt-2">
                           <Clock className="w-3 h-3 opacity-30" />
                           <span className="text-[8px] uppercase tracking-widest opacity-30">Expires in {offerCountdown}s</span>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {selectedRide.id === 'joy_moving' && showMovingNegotiation && negotiatedPrice && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className={cn("mb-8 glass p-6 rounded-[32px] border space-y-4", theme === 'dark' ? "border-white/30 bg-white/5" : "border-black/10 bg-black/5")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", theme === 'dark' ? "bg-white" : "bg-black")}>
                          <Banknote className={cn("w-5 h-5", theme === 'dark' ? "text-black" : "text-white")} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] opacity-50 uppercase tracking-widest">{t('driverOffer')}</p>
                          <p className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-black")}>{countryInfo.currency} {negotiatedPrice}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setShowCancelModal(true)} className="glass py-4 rounded-2xl text-xs font-bold uppercase tracking-widest">{t('decline')}</button>
                        <button 
                          onClick={() => {
                            if (paymentMethod !== 'cash' && !paymentMethod.startsWith('google') && !paymentMethod.startsWith('apple')) {
                              setPendingJoyMovingAcceptance(true);
                              setShowCardEntry(true);
                              setShowMovingNegotiation(false);
                            } else {
                              setAppState('driver-found');
                              setShowMovingNegotiation(false);
                            }
                          }} 
                          className={cn("py-4 rounded-2xl text-xs font-bold uppercase tracking-widest", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}
                        >
                          {t('acceptPrice')}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <button onClick={() => setShowCancelModal(true)} className={cn("text-xs font-extrabold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-black")}>{t('cancel')}</button>
                </motion.div>
              </div>
            )}

            {appState === 'driver-found' && (
                <div className="mobile-edge-container">
                  <motion.div 
                    initial={{ y: '100%' }} 
                    animate={{ y: 0 }} 
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 250 }}
                    dragElastic={0.1}
                    className="mobile-edge-panel glass sm:p-8 p-6 shadow-2xl backdrop-blur-3xl border border-white/10 flex flex-col pointer-events-auto max-h-[88vh] overflow-y-auto custom-scrollbar relative"
                  >
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 soft-light-band" />
                  {eta === 0 && (
                    <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-2xl mb-6 text-center animate-pulse">
                      <p className="text-sm font-bold text-green-400">
                        {lang === 'fr' ? "Attachez votre ceinture et passez un super trajet !" : "Fasten your seatbelt and have a great trip!"}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={cn("w-16 h-16 rounded-full overflow-hidden border-2 shadow-xl relative group border-[#D4AF37] shadow-[#D4AF37]/30")}>
                          <img src={driverInfo.photo} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => toggleFavoriteDriver(driverInfo.name)}
                            className={cn("absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", favoriteDrivers.some(d => d.name === driverInfo.name) && "opacity-100")}
                          >
                            <Heart className={cn("w-5 h-5", favoriteDrivers.some(d => d.name === driverInfo.name) ? (theme === 'dark' ? "text-white fill-white" : "text-black fill-black") : "text-white")} />
                          </button>
                        </div>
                        <div className={cn("absolute -bottom-1 -right-1 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>
                          {driverInfo.rating} <Star className="w-2 h-2 text-[#D4AF37] fill-[#D4AF37]" />
                        </div>
                      </div>
                      <div>
                        <p className={cn("font-extrabold text-lg leading-none", theme === 'dark' ? "text-white" : "text-black")}>{driverInfo.name}</p>
                        <p className="text-[9px] opacity-50 uppercase tracking-widest mt-1">{driverInfo.brand} Elite Partner • {driverInfo.color}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isDriverAtPickup ? (
                        <div className="flex flex-col items-end gap-2">
                          <div className="glass px-3 py-1 rounded-full border border-red-500/7 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-red-500 font-mono">{formatWaitTime(waitTimer)}</span>
                          </div>
                          <button 
                            onClick={() => {
                              const boardSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
                              boardSound.play().catch(() => {});
                              startSimulation();
                            }}
                            className={cn("px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg animate-bounce", theme === 'dark' ? "bg-white text-black shadow-white/20" : "bg-black text-white shadow-black/20")}
                          >
                            {t('boardVehicle')}
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-[8px] opacity-50 uppercase tracking-widest">{t('eta')}</p>
                          <p className={cn("font-display text-2xl font-extrabold", theme === 'dark' ? "text-white" : "text-black")}>{eta} {t('min')}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass p-4 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10 -rotate-12 translate-x-4">
                        <img src={selectedRide.image} className="w-20 h-auto object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <p className="text-[8px] opacity-40 uppercase tracking-widest relative z-10">{t('vehicleDetails')}</p>
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                          <img src={selectedRide.image} className="w-full h-full object-contain scale-125" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className={cn("text-xs font-bold", theme === 'dark' ? "text-white" : "text-black")}>{driverInfo.plate}</p>
                          <p className="text-[9px] opacity-50">{driverInfo.color} • {driverInfo.model}</p>
                        </div>
                      </div>
                    </div>
                    <div className="glass p-4 rounded-3xl border border-white/5 relative overflow-hidden group">
                      <p className="text-[8px] opacity-40 uppercase tracking-widest mb-2">Live View</p>
                      <div className="h-12 flex items-center justify-center">
                        <img 
                          src={selectedRide?.image} 
                          className="w-full h-full object-contain drop-shadow-lg scale-150 transition-transform group-hover:scale-[1.7]" 
                          alt="Vehicle"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                      onClick={() => {
                        setCommTab('chat');
                        setShowCommunication(true);
                      }} 
                      className={cn(
                        "flex items-center justify-center gap-2 py-4 rounded-2xl shadow-lg transition-all group pointer-events-auto bg-gradient-to-r from-[#00FF88] via-[#05FF91] to-[#00FF88] text-black shadow-[0_0_25px_rgba(0,255,136,0.6)] hover:brightness-110 hover:shadow-[0_0_35px_rgba(0,255,136,0.8)] border border-[#00FF88]/20 active:scale-95"
                      )}
                    >
                      <div className="relative">
                        <MessageSquare className="w-5 h-5 text-black" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-black animate-pulse" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('connect')}</span>
                    </button>
                    <button onClick={() => setShowCancelModal(true)} className="glass px-4 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/2 transition-all border border-red-500/2 pointer-events-auto glow-option">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{lang === 'fr' ? "Annuler" : "Cancel"}</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      if (!pickupStarted) {
                        if (pickupDirections) startPickupSimulation(pickupDirections);
                        else {
                          setPickupStarted(true);
                          setEta(0);
                          setTimeout(() => startSimulation(), 2000);
                        }
                      } else if (pickupStarted && eta === 0) {
                        startSimulation();
                      }
                    }} 
                    className={cn(
                      "w-full font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 text-sm luminous-text", 
                      theme === 'dark' ? "bg-white text-black" : "bg-black text-white",
                      pickupStarted && eta > 0 && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={pickupStarted && eta > 0}
                  >
                    {!pickupStarted ? "Confirm" : (eta === 0 ? "Start" : "En Route")}
                  </button>
                </motion.div>
              </div>
            )}

            {appState === 'simulation' && (
                <div className="mobile-edge-container">
                  <motion.div 
                    initial={{ y: '100%' }} 
                    animate={{ y: 0 }} 
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 200 }}
                    dragElastic={0.1}
                    className="mobile-edge-panel glass p-3 sm:p-4 shadow-2xl backdrop-blur-xl border border-white/10 flex flex-col pointer-events-auto max-h-[50vh] min-h-[30vh] overflow-y-auto custom-scrollbar relative"
                  >
                    <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 soft-light-band" />
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="relative mb-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] relative group mx-auto">
                          <img src={driverInfo.photo} className="w-full h-full object-cover" alt="Driver" />
                          <button 
                            onClick={() => toggleFavoriteDriver(driverInfo.name)}
                            className={cn("absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", favoriteDrivers.some(d => d.name === driverInfo.name) && "opacity-100")}
                          >
                            <Heart className={cn("w-5 h-5", favoriteDrivers.some(d => d.name === driverInfo.name) ? "text-white fill-white" : "text-white")} />
                          </button>
                        </div>
                        <div className={cn("absolute bottom-0 right-1/2 translate-x-10 text-black text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg", theme === 'dark' ? "bg-white" : "bg-gray-200")}>
                          {driverInfo.rating} <Star className="w-2.5 h-2.5 text-[#D4AF37] fill-[#D4AF37]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      {/* Polished Top-down vehicle preview */}
                      <div className={cn("w-16 h-16 glass rounded-2xl border flex items-center justify-center overflow-hidden relative shadow-inner bg-black/20", theme === 'dark' ? "border-white/10" : "border-black/5")}>
                        <div className="scale-[0.9] flex items-center justify-center relative w-16 h-16">
                          <div style={{ transform: `rotate(0deg)` }}>
                            <img 
                              src={selectedRide.image} 
                              className="w-20 h-auto object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]" 
                              alt="Vehicle preview"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      </div>

                      <div className="text-left">
                        <p className="font-extrabold text-lg text-white tracking-tight leading-tight luminous-text">{driverInfo.name}</p>
                        <p className={cn("text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest inline-block mt-1.5 shadow-sm luminous-text", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>
                          {driverInfo.plate} • {driverInfo.color}
                        </p>
                      </div>
                    </div>

                    {/* Map Zoom Controls */}
                    <div className="absolute right-4 top-6 flex flex-col gap-1.5">
                      <button 
                        onClick={handleZoomIn}
                        className={cn("w-8 h-8 glass border rounded-lg flex items-center justify-center transition-colors pointer-events-auto glow-option", theme === 'dark' ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-black hover:bg-black/5")}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleZoomOut}
                        className={cn("w-8 h-8 glass border rounded-lg flex items-center justify-center transition-colors pointer-events-auto glow-option", theme === 'dark' ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-black hover:bg-black/5")}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-full mt-1">
                        <div className="mb-2 flex items-center justify-between px-1">
                          <p className="text-[8px] opacity-40 uppercase font-black tracking-widest">{t('inTransitTo')}</p>
                          <div className="flex items-center gap-2">
                            <p className={cn("text-[10px] font-black truncate max-w-[150px] uppercase", theme === 'dark' ? "text-white" : "text-black")}>{destination}</p>
                            <button 
                              onClick={() => {
                                setAppState('map');
                                setDirections(null);
                                setIsInputExpanded('dest');
                              }}
                              className="p-1 glass rounded-md hover:bg-white/10"
                            >
                              <Edit2 className="w-2.5 h-2.5 text-[#D4AF37]" />
                            </button>
                          </div>
                        </div>
      
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/10 shadow-inner soft-light-band">
                           <motion.div 
                            initial={false}
                            animate={{ 
                              width: (() => {
                                const total = (tripDirections?.routes[0]?.legs[0]?.distance?.value || 0) / 1000;
                                if (total <= 0) return '0%';
                                const progress = ((total - (distanceRemaining || 0)) / total) * 100;
                                return `${Math.max(1, Math.min(100, progress))}%`;
                              })(),
                              backgroundColor: '#00FF88', // Always Green as requested
                              boxShadow: "0 0 15px rgba(0,255,136,0.6)"
                            }}
                            transition={{ 
                              backgroundColor: { duration: 0.8 },
                              width: { type: 'spring', stiffness: 50, damping: 20 }
                            }}
                            className="h-full" 
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 mt-1 relative z-10">
                          <div className="flex flex-col items-center p-2 glass rounded-2xl border border-white/5 glow-option">
                            <Zap className={cn("w-4 h-4 mb-1.5", theme === 'dark' ? "text-white" : "text-black")} />
                            <p className="text-[7.5px] opacity-40 uppercase font-black tracking-widest mb-1">{t('liveSpeed')}</p>
                            <p className="font-display text-base font-black text-white">{currentSpeed} <span className="text-[8px] opacity-40">km/h</span></p>
                          </div>
                          
                          <div className="flex flex-col items-center p-2 glass rounded-2xl border border-white/5 glow-option">
                            <MapPin className="w-4 h-4 text-green-500 mb-1.5" />
                            <p className="text-[7.5px] opacity-40 uppercase font-black tracking-widest mb-1">{t('left')}</p>
                            <p className="font-display text-base font-black text-white">{distanceRemaining?.toFixed(1) || "0.0"} <span className="text-[8px] opacity-40">km</span></p>
                          </div>

                          <div className="flex flex-col items-center p-2 glass rounded-2xl border border-white/5 glow-option">
                            <Clock className="w-4 h-4 text-[#00FF88] mb-1.5" />
                            <p className="text-[7.5px] opacity-40 uppercase font-black tracking-widest mb-1">{t('eta')}</p>
                            <p className={cn("font-display text-base font-black", theme === 'dark' ? "text-white" : "text-black")}>{eta} <span className="text-[8px] opacity-40">{t('min')}</span></p>
                          </div>
                        </div>

                        <div className="glass p-3 rounded-2xl border border-white/5 mb-4 flex items-center gap-3 relative overflow-hidden group">
                          <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/50 transition-colors">
                            <Navigation className={cn("w-4 h-4", theme === 'dark' ? "text-white" : "text-black")} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[8px] opacity-40 uppercase font-black tracking-widest mb-0.5">{t('currentRoadLabel')}</p>
                            <p className="text-[10px] font-bold text-white truncate uppercase">{currentRoad || t('navigatingMainRoute')}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-[8px] opacity-40 uppercase font-black tracking-widest mb-0.5">{t('status')}</p>
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                              <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">{t('liveGps')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <button 
                            onClick={() => {
                              setCommTab('chat');
                              setShowCommunication(true);
                            }} 
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black uppercase text-[10px] tracking-wider shadow-lg active:scale-95 transition-all bg-gradient-to-r from-[#00FF88] via-[#05FF91] to-[#00FF88] text-black shadow-[0_0_25px_rgba(0,255,136,0.6)] hover:brightness-110 hover:shadow-[0_0_35px_rgba(0,255,136,0.8)] border border-[#00FF88]/20"
                            )}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {t('connect')}
                          </button>
                          <button 
                            onClick={shareLocation}
                            className="flex-1 glass border border-white/10 py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform glow-option"
                          >
                            <Share2 className={cn("w-3.5 h-3.5", theme === 'dark' ? "text-white" : "text-black")} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{t('track')}</span>
                          </button>
                        </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          </div>

          {/* Mall Entrance Prompt */}
          <AnimatePresence>
            {mallEntrancePrompt.show && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[200] backdrop-blur-2xl bg-black/80 flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }} 
                  animate={{ scale: 1, y: 0 }} 
                  className={cn("w-full max-w-sm glass border rounded-[40px] p-8 shadow-2xl backdrop-blur-3xl", theme === 'dark' ? "border-white/20" : "border-black/10")}
                >
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border", theme === 'dark' ? "bg-white/10 border-white/30" : "bg-black/5 border-black/10")}>
                    <MapPin className={cn("w-8 h-8", theme === 'dark' ? "text-white" : "text-black")} />
                  </div>
                  <h3 className="text-2xl font-black text-center mb-2">{t('mallEntranceTitle')}</h3>
                  <p className="text-sm opacity-60 text-center mb-8">{t('mallEntrancePrompt')}</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button 
                        key={num}
                        onClick={() => handleEntranceSelect(num.toString())}
                        className={cn("glass py-4 rounded-xl border border-white/10 transition-all font-bold text-lg active:scale-95", theme === 'dark' ? "hover:border-white/50" : "hover:border-black/50")}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setMallEntrancePrompt(prev => ({ ...prev, show: false }))}
                    className="w-full mt-6 py-3 text-[10px] uppercase font-black tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    {t('cancel')}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unified Communication Modal (Chat & Call) */}
          <AnimatePresence>
            {showCommunication && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-[40px]"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-[340px] h-[550px] flex flex-col glass rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
                >
                  <div className="p-6 border-b border-white/10 bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4AF37]")}>
                          <img src={driverInfo.photo} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-xs">{driverInfo.name}</h4>
                          <span className={cn("text-[8px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-white/60")}>{t('verifiedDriver')}</span>
                        </div>
                      </div>
                      <button onClick={() => setShowCommunication(false)} className="w-8 h-8 glass rounded-full flex items-center justify-center border border-white/10">
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                      <button onClick={() => setCommTab('chat')} className={cn("flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all", commTab === 'chat' ? (theme === 'dark' ? "bg-white text-black shadow-lg" : "bg-black text-white shadow-lg") : "text-white opacity-50 hover:opacity-100")}>
                        <MessageSquare className="w-3.5 h-3.5" /> {t('chat')}
                      </button>
                      <button onClick={() => setCommTab('call')} className={cn("flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all", commTab === 'call' ? (theme === 'dark' ? "bg-white text-black shadow-lg" : "bg-black text-white shadow-lg") : "text-white opacity-50 hover:opacity-100")}>
                        <Phone className="w-3.5 h-3.5" /> {t('call')}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden flex flex-col">
                    {commTab === 'chat' ? (
                      <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                          {chatMessages.map((msg) => (
                            <motion.div key={`chat-message-${msg.id}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("flex", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                              <div className={cn("max-w-[85%] px-4 py-2.5 rounded-[20px] shadow-lg relative", msg.sender === 'user' ? (theme === 'dark' ? "bg-[#D4AF37] text-black shadow-[#D4AF37]/30 rounded-tr-none" : "bg-black text-white rounded-tr-none") : "bg-white/5 text-white border border-white/10 rounded-tl-none")}>
                                <p className="text-[13px] font-bold leading-relaxed">{msg.text}</p>
                                <p className={cn("text-[8px] mt-1 opacity-50 font-black", msg.sender === 'user' ? "text-black" : "text-white")}>{msg.time}</p>
                              </div>
                            </motion.div>
                          ))}
                          {isDriverTyping && (
                            <div className="flex justify-start">
                              <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-[20px] rounded-tl-none shadow-lg">
                                <div className="flex gap-1">
                                  {[0, 1, 2].map(dot => (
                                    <motion.div key={`typing-dot-${dot}`} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }} className={cn("w-1 h-1 rounded-full", theme === 'dark' ? "bg-white" : "bg-black")} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-black/40 border-t border-white/10">
                          <div className="relative flex items-center gap-2">
                            <input 
                              type="text" 
                              className="flex-1 glass rounded-xl py-3 px-4 text-xs font-bold placeholder:text-white/30 focus:outline-none border border-white/5"
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              onKeyPress={e => {
                                if (e.key === 'Enter' && newMessage.trim()) {
                                  setChatMessages(prev => [...prev, { id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5), text: newMessage, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                                  setNewMessage("");
                                }
                              }}
                              placeholder={t('typeMessage')} 
                            />
                            <button onClick={() => { if(newMessage.trim()){ setChatMessages(prev => [...prev, { id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5), text: newMessage, sender: (appState as string) === 'driver-navigation' ? 'driver' : 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); setNewMessage(""); } }} className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-[#00FF88] text-black shadow-[#00FF88]/20")}><Send className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-white/5">
                        <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                          <Phone className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-lg font-black text-white mb-1">{t('voiceConnectivity')}</h3>
                        <p className="text-[9px] opacity-40 uppercase tracking-[0.2em] mb-8">{t('encryptedComm')}</p>
                        <button onClick={() => { setShowCommunication(false); startCall(); }} className={cn("w-full font-black py-4 rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm bg-[#00FF88] text-black shadow-[#00FF88]/20")}>
                          <PhoneCall className="w-4 h-4" /> {t('startVoiceCall')}
                        </button>
                        <div className="mt-6 flex items-center gap-2 opacity-30"><ShieldCheck className="w-3 h-3" /><span className="text-[7px] font-bold uppercase tracking-widest">{t('privacyShield')}</span></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cancellation Modal */}
          <AnimatePresence>
            {showCancelModal && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-sm glass rounded-[40px] p-8 border border-white/10 shadow-2xl space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-display font-extrabold joy-gradient">
                      {lang === 'fr' ? "Annuler le trajet ?" : "Cancel Trip?"}
                    </h3>
                    <p className="text-xs opacity-50">
                      {lang === 'fr' ? "Veuillez nous dire pourquoi vous annulez." : "Please let us know why you're cancelling."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {CANCEL_REASONS.map((reason) => (
                      <button 
                        key={reason.id}
                        onClick={() => handleCancelTrip(lang === 'fr' ? reason.fr : reason.en)}
                        className="w-full glass p-4 rounded-2xl text-left text-sm font-bold hover:bg-white/5 transition-all border border-white/5 active:scale-98 glow-option"
                      >
                        {lang === 'fr' ? reason.fr : reason.en}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowCancelModal(false)}
                    className="w-full py-4 text-sm font-extrabold opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
                  >
                    {t('cancel')}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Moving Details Modal */}
          <AnimatePresence>
            {showMovingDetails && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-md h-[85vh] glass rounded-[40px] flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                >
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                      <h3 className="text-2xl font-display font-extrabold joy-gradient">{t('movingDetails')}</h3>
                      <p className="text-[10px] opacity-50 uppercase tracking-widest">Tell us what you're moving</p>
                    </div>
                    <button onClick={() => setShowMovingDetails(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {isCameraActive ? (
                      <div className="space-y-4">
                        <div className="relative aspect-square rounded-3xl overflow-hidden glass border border-white/10">
                          <video 
                            ref={movingVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover" 
                          />
                          <canvas ref={movingCanvasRef} className="hidden" width="640" height="640" />
                          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                            <button 
                              onClick={() => {
                                console.log("Capture button clicked");
                                if (movingVideoRef.current && movingCanvasRef.current) {
                                  console.log("Refs are ready, readyState:", movingVideoRef.current.readyState);
                                  const context = movingCanvasRef.current.getContext('2d');
                                  if (context) {
                                    context.drawImage(movingVideoRef.current, 0, 0, 640, 640);
                                    const photo = movingCanvasRef.current.toDataURL('image/jpeg');
                                    console.log("Photo captured, length:", photo.length);
                                    setMovingDetails(prev => ({
                                      ...prev,
                                      furniture: [...prev.furniture, { id: 'fur-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5), name: tempFurnitureName || "Furniture", photo }]
                                    }));
                                    setTempFurnitureName("");
                                    setIsCameraActive(false);
                                    if (cameraStream) {
                                      cameraStream.getTracks().forEach(track => track.stop());
                                      setCameraStream(null);
                                    }
                                  }
                                } else {
                                  console.error("Refs not ready:", { video: !!movingVideoRef.current, canvas: !!movingCanvasRef.current });
                                }
                              }}
                              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                            >
                              <div className="w-12 h-12 rounded-full border-4 border-black" />
                            </button>
                            <button 
                              onClick={() => {
                                setIsCameraActive(false);
                                if (cameraStream) {
                                  cameraStream.getTracks().forEach(track => track.stop());
                                  setCameraStream(null);
                                }
                              }}
                              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-2xl"
                            >
                              <X className="w-8 h-8 text-white" />
                            </button>
                          </div>
                        </div>
                        <p className="text-center text-xs opacity-50 uppercase tracking-widest">{t('capture')}</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Package className="w-4 h-4" /> {t('furnitureList')}
                          </h4>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={tempFurnitureName}
                              onChange={(e) => setTempFurnitureName(e.target.value)}
                              placeholder={t('furnitureName')}
                              className="flex-1 glass p-3 rounded-xl focus:outline-none text-xs"
                            />
                            <button 
                              onClick={async () => {
                                try {
                                  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                                    throw new Error("Camera API not supported in this browser.");
                                  }
                                  console.log("Requesting camera access...");
                                  const stream = await navigator.mediaDevices.getUserMedia({ 
                                    video: { 
                                      facingMode: 'environment',
                                      width: { ideal: 640 },
                                      height: { ideal: 480 }
                                    } 
                                  });
                                  console.log("Camera access granted");
                                  setCameraStream(stream);
                                  setIsCameraActive(true);
                                } catch (err: any) {
                                  console.error("Camera error:", err);
                                  const errorMsg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
                                    ? (lang === 'fr' ? "Accès caméra refusé. Veuillez autoriser la caméra dans les paramètres de votre navigateur ou ouvrir l'application dans un nouvel onglet." : "Camera access denied. Please allow camera access in your browser settings or open the app in a new tab.")
                                    : (lang === 'fr' ? `Erreur caméra: ${err.message}` : `Camera error: ${err.message}`);
                                  
                                  setNotification({ message: errorMsg, type: 'error' });
                                  
                                  // Auto-trigger file upload if camera fails
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (re) => {
                                        const photo = re.target?.result as string;
                                        setMovingDetails(prev => ({
                                          ...prev,
                                          furniture: [...prev.furniture, { id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5), name: tempFurnitureName || "Furniture", photo }]
                                        }));
                                        setTempFurnitureName("");
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }
                              }}
                              className={cn("p-3 rounded-xl font-bold", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}
                            >
                              <Camera className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {movingDetails.furniture.map(item => (
                              <div key={item.id} className="glass p-3 rounded-2xl border border-white/5 relative group">
                                <img src={item.photo || ""} className="w-full h-24 object-cover rounded-xl mb-2" />
                                <p className="text-xs font-bold truncate">{item.name}</p>
                                <button 
                                  onClick={() => setMovingDetails(prev => ({ ...prev, furniture: prev.furniture.filter(f => f.id !== item.id) }))}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Truck className="w-4 h-4" /> {t('truckSize')}
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Small', 'Medium', 'Large'] as const).map(size => (
                              <button 
                                key={size}
                                onClick={() => setMovingDetails(prev => ({ ...prev, truckSize: size }))}
                                className={cn(
                                  "py-4 rounded-2xl text-xs font-bold transition-all border",
                                  movingDetails.truckSize === size ? (theme === 'dark' ? "bg-white text-black border-white" : "bg-black text-white border-black") : "glass border-white/5 opacity-50"
                                )}
                              >
                                {t(size.toLowerCase())}
                              </button>
                            ))}
                          </div>
                        </div>

                         {movingDetails.furniture.length > 0 && (
                          <div className="space-y-6">
                            <div className={cn("glass p-6 rounded-3xl border border-white/5 bg-gradient-to-br to-transparent", theme === 'dark' ? "from-white/10" : "from-black/5")}>
                              <p className="text-[10px] opacity-50 uppercase tracking-widest mb-1">{t('estimatedPrice')}</p>
                              <p className={cn("text-3xl font-display font-bold", theme === 'dark' ? "text-white" : "text-black")}>
                                {countryInfo.currency} {(650 + (movingDetails.furniture.length * 50) + (movingDetails.truckSize === 'Large' ? 500 : movingDetails.truckSize === 'Medium' ? 200 : 0)).toFixed(2)}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('offerPrice')}</label>
                              <div className="relative">
                                <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 font-bold", theme === 'dark' ? "text-white" : "text-black")}>{countryInfo.currency}</div>
                                <input 
                                  type="number" 
                                  value={userOfferPrice}
                                  onChange={(e) => setUserOfferPrice(e.target.value)}
                                  placeholder="0.00"
                                  className={cn("w-full glass p-4 pl-12 rounded-2xl focus:outline-none border", theme === 'dark' ? "border-white/10 focus:border-white/50" : "border-black/10 focus:border-black/30")}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="p-8 bg-white/5 border-t border-white/5">
                    <button 
                      onClick={() => {
                        setMovingDetails(prev => ({
                          ...prev,
                          estimatedPrice: selectedRide.price + (movingDetails.furniture.length * 50) + (movingDetails.truckSize === 'Large' ? 500 : movingDetails.truckSize === 'Medium' ? 200 : 0)
                        }));
                        setShowMovingDetails(false);
                        startFindingDriver();
                      }}
                      disabled={movingDetails.furniture.length === 0}
                      className={cn(
                        "w-full py-5 rounded-2xl font-display font-extrabold text-lg shadow-2xl transition-all",
                        movingDetails.furniture.length > 0 ? (theme === 'dark' ? "bg-white text-black" : "bg-black text-white") : "opacity-30 cursor-not-allowed"
                      )}
                    >
                      {t('confirm')}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp-style Call Modal is now showInAppCall */}

          {/* Payouts Modal */}
          <AnimatePresence>
            {showPayouts && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-md h-[80vh] glass rounded-[40px] flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                      <h3 className="text-2xl font-display font-extrabold joy-gradient">{lang === 'fr' ? "Portefeuille Chauffeur" : "Driver Wallet"}</h3>
                      <p className="text-[10px] opacity-50 uppercase tracking-widest">{lang === 'fr' ? "Modèle de revenus : Chauffeur (80%) / JoyDrive (20%)" : "Earnings Model: Driver (80%) / JoyDrive (20%)"}</p>
                    </div>
                    <button onClick={() => setShowPayouts(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Earnings Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn(
                        "glass p-6 rounded-3xl border transition-all glow-option", 
                        user?.name === 'Joy Guest' 
                          ? "bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#B8860B] border-white/40 text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]" 
                          : (theme === 'dark' ? "border-white/5 bg-gradient-to-br from-white/10 to-transparent" : "border-black/5 bg-gradient-to-br from-black/5 to-transparent")
                      )}>
                        <p className={cn("text-[10px] uppercase tracking-widest mb-1", user?.name === 'Joy Guest' ? "text-black/60" : "opacity-50")}>{lang === 'fr' ? "Solde Net (80%)" : "Net Balance (80%)"}</p>
                        <p className={cn("text-2xl font-display font-bold", user?.name === 'Joy Guest' ? "text-black" : (theme === 'dark' ? "text-white" : "text-black"))}>{countryInfo.currency} {driverEarnings.toFixed(2)}</p>
                      </div>
                      <div className="glass p-6 rounded-3xl border border-white/5 glow-option">
                        <p className="text-[10px] opacity-50 uppercase tracking-widest mb-1">{lang === 'fr' ? "Commission Payée (20%)" : "Commission Paid (20%)"}</p>
                        <p className="text-lg font-bold opacity-50">{(driverEarnings * 0.25).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Split Details Card */}
                    <div className={cn("glass p-5 rounded-2xl border space-y-3", theme === 'dark' ? "border-white/20 bg-white/5" : "border-black/10 bg-black/5")}>
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-[10px] uppercase opacity-50 font-bold">{lang === 'fr' ? "Gains Brut" : "Gross Earnings"}</span>
                        <span className="font-bold">{(driverEarnings * 1.25).toFixed(2)} {countryInfo.currency}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="opacity-70">{lang === 'fr' ? "Votre part (80%)" : "Your Share (80%)"}</span>
                        <span className={cn("font-bold", theme === 'dark' ? "text-white" : "text-black")}>+{driverEarnings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="opacity-70">{lang === 'fr' ? "Commission Plateforme (20%)" : "Platform Commission (20%)"}</span>
                        <span className="text-red-400 font-bold">-{(driverEarnings * 0.25).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payout Methodology Info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <Info className="w-4 h-4" /> {lang === 'fr' ? "Méthodes de Paiement" : "Payment Methods"}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="glass p-4 rounded-2xl border border-white/5 space-y-2">
                          <p className={cn("text-[11px] font-bold uppercase", theme === 'dark' ? "text-white" : "text-black")}>{lang === 'fr' ? "Virement Hebdomadaire" : "Weekly Payout"}</p>
                          <p className="text-[10px] opacity-60 leading-relaxed">
                            {lang === 'fr' 
                              ? "Les gains cumulés du lundi au dimanche sont virés automatiquement chaque mardi matin sur votre compte bancaire enregistré."
                              : "Cumulative earnings from Monday to Sunday are automatically transferred every Tuesday morning to your registered bank account."}
                          </p>
                        </div>
                        <div className="glass p-4 rounded-2xl border border-white/5 space-y-2">
                          <p className={cn("text-[11px] font-bold uppercase", theme === 'dark' ? "text-white" : "text-black")}>{lang === 'fr' ? "Compensation Espèces" : "Cash Compensation"}</p>
                          <p className="text-[10px] opacity-60 leading-relaxed">
                            {lang === 'fr' 
                              ? "Pour les courses payées en espèces, la commission de 20% est déduite de votre solde numérique. Si votre solde devient négatif, vous devrez le recharger pour continuer à recevoir des courses."
                              : "For cash-paid trips, the 20% commission is deducted from your digital balance. If your balance becomes negative, you will need to top it up to continue receiving trips."}
                          </p>
                        </div>
                        <div className="glass p-4 rounded-2xl border border-white/5 space-y-2">
                          <p className={cn("text-[11px] font-bold uppercase", theme === 'dark' ? "text-white" : "text-black")}>{lang === 'fr' ? "Instant Pay (Bientôt)" : "Instant Pay (Coming Soon)"}</p>
                          <p className="text-[10px] opacity-60 leading-relaxed">
                            {lang === 'fr' 
                              ? "Option de retrait immédiat après chaque course pour les paiements par carte."
                              : "Option for immediate withdrawal after each trip for card payments."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details Form */}
                    <div className="space-y-4 p-5 rounded-3xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 shadow-[0_0_40px_rgba(212,175,55,0.05)]">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                        <Banknote className="w-4 h-4" /> Bank Transfer Details
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] opacity-40 uppercase ml-2">Bank Name</label>
                          <input 
                            type="text" 
                            value={payoutPreferences.bankName}
                            onChange={e => setPayoutPreferences({...payoutPreferences, bankName: e.target.value})}
                            placeholder="e.g. Standard Bank"
                            className={cn("w-full glass p-4 rounded-2xl text-sm outline-none border transition-all", theme === 'dark' ? "border-[#D4AF37]/20 focus:border-[#D4AF37]/60" : "border-[#D4AF37]/20 focus:border-[#D4AF37]/40")}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] opacity-40 uppercase ml-2">Account Holder</label>
                          <input 
                            type="text" 
                            value={payoutPreferences.accountHolder}
                            onChange={e => setPayoutPreferences({...payoutPreferences, accountHolder: e.target.value})}
                            placeholder="Full Name"
                            className={cn("w-full glass p-4 rounded-2xl text-sm outline-none border transition-all", theme === 'dark' ? "border-[#D4AF37]/20 focus:border-[#D4AF37]/60" : "border-[#D4AF37]/20 focus:border-[#D4AF37]/40")}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] opacity-40 uppercase ml-2">Account Number</label>
                            <input 
                              type="text" 
                              value={payoutPreferences.accountNumber}
                              onChange={e => setPayoutPreferences({...payoutPreferences, accountNumber: e.target.value})}
                              placeholder="000000000"
                              className={cn("w-full glass p-4 rounded-2xl text-sm outline-none border transition-all", theme === 'dark' ? "border-[#D4AF37]/20 focus:border-[#D4AF37]/60" : "border-[#D4AF37]/20 focus:border-[#D4AF37]/40")}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] opacity-40 uppercase ml-2">Branch Code</label>
                            <input 
                              type="text" 
                              value={payoutPreferences.branchCode}
                              onChange={e => setPayoutPreferences({...payoutPreferences, branchCode: e.target.value})}
                              placeholder="123456"
                              className={cn("w-full glass p-4 rounded-2xl text-sm outline-none border transition-all", theme === 'dark' ? "border-[#D4AF37]/20 focus:border-[#D4AF37]/60" : "border-[#D4AF37]/20 focus:border-[#D4AF37]/40")}
                            />
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          confetti();
                          setNotifications(prev => [{ id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5), text: "Payout preferences updated successfully!", time: 'Just now' }, ...prev]);
                          setShowNotifications(true);
                        }}
                        className="w-full bg-[#D4AF37] text-black py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-105 active:scale-95"
                      >
                        Update Payout Method
                      </button>
                    </div>

                    {/* Payout History */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-50">Recent Payouts</h4>
                      {payoutHistory.length === 0 ? (
                        <div className="glass p-8 rounded-3xl border border-dashed border-white/10 text-center opacity-40 italic text-sm">
                          No payout history yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {payoutHistory.map(p => (
                            <div key={p.id} className="glass p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-sm">{countryInfo.currency} {p.amount.toFixed(2)}</p>
                                <p className="text-[10px] opacity-40">{p.date}</p>
                              </div>
                              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest", p.status === 'Completed' ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500")}>
                                {p.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-8 bg-white/5 border-t border-white/5">
                    <button 
                      disabled={driverEarnings <= 0}
                      onClick={() => {
                        const amount = driverEarnings;
                        setPayoutHistory(prev => [{
                          id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                          amount,
                          date: new Date().toLocaleDateString(),
                          status: 'Pending'
                        }, ...prev]);
                        setDriverEarnings(0);
                        confetti();
                      }}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl",
                        driverEarnings > 0 ? (theme === 'dark' ? "bg-white text-black shadow-white/20" : "bg-black text-white shadow-black/20") : "bg-white/5 text-white/20 cursor-not-allowed"
                      )}
                    >
                      Request Payout
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Detailed Earnings Breakdown Modal */}
          <AnimatePresence>
            {showDriverEarningsDetails && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-md h-[85vh] glass rounded-[40px] flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                      <h3 className="text-2xl font-display font-extrabold joy-gradient">{lang === 'fr' ? "Détails des Gains" : "Earnings Breakdown"}</h3>
                      <p className="text-[10px] opacity-50 uppercase tracking-widest">{lang === 'fr' ? "Trajets Récents" : "Recent Trips"}</p>
                    </div>
                    <button onClick={() => setShowDriverEarningsDetails(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {driverTripHistory.length === 0 ? (
                      <div className="text-center py-20 opacity-30">
                        <BarChart2 className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">{lang === 'fr' ? "Aucun trajet enregistré" : "No trips recorded"}</p>
                      </div>
                    ) : (
                      driverTripHistory.map((trip) => (
                        <div key={trip.id} className="glass p-5 rounded-3xl border border-white/5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-bold text-sm truncate">{trip.customer}</p>
                              <p className="text-[10px] opacity-50 uppercase tracking-widest">{trip.date}</p>
                            </div>
                            <div className="text-right">
                              <p className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-black")}>{countryInfo.currency} {trip.breakdown.total}</p>
                              <p className="text-[8px] opacity-40 uppercase tracking-widest">{trip.rideType}</p>
                            </div>
                          </div>

                          <div className="bg-white/10 rounded-2xl p-4 space-y-2 border border-white/10">
                             <div className="flex justify-between items-center text-[11px]">
                               <span className="opacity-80 font-medium">{lang === 'fr' ? "Prix de Base" : "Base Fare"}</span>
                               <span className="font-bold">{countryInfo.currency} {trip.breakdown.baseFare}</span>
                             </div>
                             <div className="flex justify-between items-center text-[11px]">
                               <span className="opacity-80 font-medium">{lang === 'fr' ? "Kilométrage" : "Kilometers"} ({trip.breakdown.distance} km)</span>
                               <span className="font-bold">{countryInfo.currency} {(parseFloat(trip.breakdown.perKm) * trip.breakdown.distance).toFixed(2)}</span>
                             </div>
                             {parseFloat(trip.breakdown.surge) > 0 && (
                               <div className="flex justify-between items-center text-[11px] text-orange-400">
                                 <span className="font-bold">{lang === 'fr' ? "Majoration Traffic" : "Surge Pricing"}</span>
                                 <span>+{countryInfo.currency} {trip.breakdown.surge}</span>
                               </div>
                             )}
                             {parseFloat(trip.breakdown.bonuses) > 0 && (
                               <div className="flex justify-between items-center text-[11px] text-green-400">
                                 <span className="font-bold">{lang === 'fr' ? "Bonus / Pourboire" : "Bonuses / Tips"}</span>
                                 <span>+{countryInfo.currency} {trip.breakdown.bonuses}</span>
                               </div>
                             )}
                             {parseFloat(trip.breakdown.penalties) > 0 && (
                               <div className="flex justify-between items-center text-[11px] text-red-400">
                                 <span className="font-bold">{lang === 'fr' ? "Pénalité Attente" : "Wait Penalty"}</span>
                                 <span>-{countryInfo.currency} {trip.breakdown.penalties}</span>
                               </div>
                             )}
                             <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center text-xs font-black glow-option p-2 rounded-xl">
                               <span className="uppercase tracking-widest">{lang === 'fr' ? "NET CHAUFFEUR" : "NET EARNINGS"}</span>
                               <span className={theme === 'dark' ? "text-white" : "text-black"}>{countryInfo.currency} {trip.breakdown.total}</span>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-md"
          >
            <div className={cn(
              "p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3",
              notification.type === 'error' ? "bg-red-500/5 border-red-500/12 text-red-200" : 
              notification.type === 'success' ? "bg-green-500/20 border-green-500/50 text-green-200" :
              "bg-blue-500/20 border-blue-500/50 text-blue-200"
            )}>
              {notification.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <Info className="w-5 h-5 flex-shrink-0" />}
              <p className="text-xs font-bold">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="ml-auto opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
        {selectedVehicleDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicleDetails(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass p-8 rounded-[32px] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-6 group">
                   <div className="absolute inset-x-0 bottom-0 h-4 bg-black/10 rounded-[100%] blur-md scale-x-75" />
                   <img 
                     src={selectedVehicleDetails.image} 
                     alt={selectedVehicleDetails.name}
                     className="w-full h-full object-contain relative z-10"
                     referrerPolicy="no-referrer"
                   />
                </div>
                
                <h3 className="text-2xl font-display joy-gradient font-black uppercase tracking-tighter mb-2">
                  {selectedVehicleDetails.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-[#00FF88]/20 text-[#00FF88] text-[10px] font-black px-3 py-1 rounded-full border border-[#00FF88]/30">
                    {selectedVehicleDetails.type}
                  </span>
                  <span className="bg-white/10 text-white/70 text-[10px] font-black px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {selectedVehicleDetails.capacity} Passengers
                  </span>
                </div>

                <div className="w-full space-y-4 mb-8">
                  <div className="flex justify-between items-center p-4 glass rounded-2xl border border-white/5 bg-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Price</span>
                    <span className="text-lg font-black text-[#00FF88]">
                      {selectedVehicleDetails.id === 'joy_moving' 
                        ? (lang === 'fr' ? 'Négociable' : 'Negotiable') 
                        : `${countryInfo.currency} ${selectedVehicleDetails.calculatedPrice || selectedVehicleDetails.price}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 glass rounded-2xl border border-white/5 bg-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Payment</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Card or Cash</span>
                  </div>

                  <div className="flex justify-between items-start p-4 glass rounded-2xl border border-white/5 bg-white/5 text-left">
                     <div className="space-y-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 block">Conditions</span>
                       <p className="text-[10px] leading-relaxed opacity-70">
                          Strict safety protocols apply. No smoking or alcohol consumption allowed. Valid for door-to-door transit.
                       </p>
                     </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedVehicleDetails(null)}
                  className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Driver Terms Modal */}
        {showDriverTermsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] backdrop-blur-3xl bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full glass rounded-[40px] border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col max-h-[85vh] relative"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-black/20 to-white/5">
                <div>
                  <h3 className="text-2xl font-display font-black joy-gradient tracking-tight">{lang === 'fr' ? "CONDITIONS PARTENAIRES" : "PARTNER TERMS"}</h3>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest">{lang === 'fr' ? "JOYDRIVE FLEET 2026" : "JOYDRIVE FLEET 2026"}</p>
                </div>
                <button onClick={() => setShowDriverTermsModal(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all">
                  <X className="w-5 h-5 opacity-50" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest">{lang === 'fr' ? "Mode Opératoire" : "Operating Model"}</h4>
                  </div>
                  <p className="text-[11px] opacity-70 leading-relaxed pl-11">
                    {lang === 'fr' ? 
                      "En tant que chauffeur JoyDrive, vous êtes un partenaire indépendant. Vous utilisez votre propre véhicule et gérez votre emploi du temps. Vous acceptez les courses via l'application et suivez les protocoles de sécurité de la flotte Elite JoyDrive." : 
                      "As a JoyDrive driver, you are an independent partner. You use your own vehicle and manage your own schedule. You accept trips via the app and follow the security protocols of the JoyDrive Elite fleet."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#00FF88]/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-[#00FF88]" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest">{lang === 'fr' ? "Revenus & Commission" : "Earnings & Commission"}</h4>
                  </div>
                  <p className="text-[11px] opacity-70 leading-relaxed pl-11">
                    {lang === 'fr' ? 
                      "Vous conservez 80% du montant net de chaque course. JoyDrive prélève une commission de 20% pour couvrir l'infrastructure, l'assurance plateforme et le support marketing." : 
                      "You keep 80% of the net amount of each trip. JoyDrive takes a 20% commission to cover infrastructure, platform insurance, and marketing support."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#B8860B]/20 flex items-center justify-center">
                      <Banknote className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest">{lang === 'fr' ? "Paiements" : "Payouts"}</h4>
                  </div>
                  <p className="text-[11px] opacity-70 leading-relaxed pl-11">
                    {lang === 'fr' ? 
                      "Les paiements sont automatisés et envoyés chaque mardi matin par virement bancaire. Les revenus cumulés du lundi au dimanche précédent sont transférés sur vos coordonnées bancaires enregistrées." : 
                      "Payouts are automated and sent every Tuesday morning via bank transfer. Cumulative earnings from the previous Monday to Sunday are transferred to your registered bank account."}
                  </p>
                </div>

                <div className="bg-[#D4AF37]/5 p-6 rounded-3xl border border-[#D4AF37]/10 flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">{lang === 'fr' ? "SÉCURITÉ D'ABORD" : "SAFETY FIRST"}</p>
                    <p className="text-[10px] opacity-60 leading-relaxed">
                      {lang === 'fr' ? "Tous les chauffeurs doivent maintenir une note minimale de 4.5 étoiles pour rester actifs sur la plateforme." : 
                      "All drivers must maintain a minimum rating of 4.5 stars to remain active on the platform."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/20 border-t border-white/10">
                <button 
                  onClick={() => {
                    setDriverRegData({...driverRegData, acceptedTerms: true});
                    setShowDriverTermsModal(false);
                  }}
                  className="w-full py-5 bg-[#D4AF37] text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all"
                >
                  {lang === 'fr' ? "ACCEPTER ET CONTINUER" : "ACCEPT AND CONTINUE"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
