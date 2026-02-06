"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  Star,
  Dumbbell,
  Wifi,
  Car,
  Droplets,
  Wind,
  Loader2,
  X,
  Check,
  CreditCard,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/providers";

interface Gym {
  id: string;
  name: string;
  description: string;
  address: string;
  location_lat: number;
  location_lng: number;
  current_crowd_count: number;
  max_capacity: number;
  photos: string[];
  amenities: string[];
  upi_id: string;
  opening_hours: Record<string, string>;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_popular: boolean;
}

// Amenity icon mapping
const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  Parking: <Car className="w-4 h-4" />,
  Showers: <Droplets className="w-4 h-4" />,
  "Air Conditioning": <Wind className="w-4 h-4" />,
  "Personal Training": <Dumbbell className="w-4 h-4" />,
};

// Crowd status component
function CrowdStatus({ current, max }: { current: number; max: number }) {
  const percentage = Math.round((current / max) * 100);
  const status =
    percentage >= 80 ? "busy" : percentage >= 50 ? "moderate" : "quiet";

  const config = {
    busy: {
      bg: "bg-status-danger/20",
      text: "text-status-danger",
      label: "Busy",
      icon: "🔴",
    },
    moderate: {
      bg: "bg-status-warning/20",
      text: "text-status-warning",
      label: "Moderate",
      icon: "🟡",
    },
    quiet: {
      bg: "bg-status-success/20",
      text: "text-status-success",
      label: "Quiet",
      icon: "🟢",
    },
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full ${config[status].bg}`}
      >
        <span>{config[status].icon}</span>
        <span className={`text-sm font-medium ${config[status].text}`}>
          {config[status].label}
        </span>
      </div>
      <div className="text-pearl-muted">
        <Users className="w-4 h-4 inline mr-1" />
        <span className="text-sm">
          {current}/{max} ({percentage}% capacity)
        </span>
      </div>
    </div>
  );
}

// Plan card component
function PlanCard({
  plan,
  onSelect,
}: {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-2xl border ${
        plan.is_popular
          ? "border-gold/50 bg-gold/5"
          : "border-white/10 bg-white/[0.02]"
      } hover:border-gold/30 transition-all group cursor-pointer`}
      onClick={() => onSelect(plan)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {plan.is_popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-xs font-medium bg-gold text-void rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-serif text-pearl mb-2">{plan.name}</h3>
        <p className="text-pearl-muted text-sm">{plan.description}</p>
      </div>

      <div className="text-center mb-6">
        <span className="text-4xl font-serif text-gold">₹{plan.price}</span>
        <span className="text-pearl-muted text-sm ml-1">
          / {plan.duration_days} {plan.duration_days === 1 ? "day" : "days"}
        </span>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-pearl-muted">
            <Check className="w-4 h-4 text-gold flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <button className="w-full py-3 rounded-xl bg-gold/10 border border-gold/30 text-gold font-medium hover:bg-gold/20 transition-all group-hover:border-gold">
        Select Plan
      </button>
    </motion.div>
  );
}

// Payment modal component
function PaymentModal({
  plan,
  gym,
  onClose,
}: {
  plan: Plan;
  gym: Gym;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [utrId, setUtrId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!utrId.trim() || !user) return;

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured) {
        await supabase.from("bookings").insert({
          user_id: user.id,
          gym_id: gym.id,
          plan_id: plan.id,
          amount: plan.price,
          transaction_id_utr: utrId,
          status: "pending",
        } as never);
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md p-6 rounded-2xl bg-luxury-black border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif text-pearl">Complete Payment</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-pearl-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-status-success/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-status-success" />
            </div>
            <h4 className="text-xl font-serif text-pearl mb-2">
              Booking Submitted!
            </h4>
            <p className="text-pearl-muted text-sm">
              The gym owner will verify your payment shortly.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Plan Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-pearl">{plan.name}</p>
                  <p className="text-sm text-pearl-muted">{gym.name}</p>
                </div>
                <p className="text-2xl font-serif text-gold">₹{plan.price}</p>
              </div>
            </div>

            {/* UPI QR / Instructions */}
            <div className="text-center mb-6">
              <p className="text-pearl-muted text-sm mb-4">
                Pay to UPI ID:
              </p>
              <div className="p-3 rounded-lg bg-white/5 border border-gold/30 inline-block">
                <code className="text-gold font-mono">{gym.upi_id || "gym@upi"}</code>
              </div>
            </div>

            {/* UTR Input */}
            <div className="mb-6">
              <label className="block text-sm text-pearl-muted mb-2">
                Enter UPI Transaction ID (UTR)
              </label>
              <input
                type="text"
                value={utrId}
                onChange={(e) => setUtrId(e.target.value)}
                placeholder="e.g., 123456789012"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-pearl placeholder:text-pearl-dim focus:border-gold/50 outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!utrId.trim() || isSubmitting}
              className="w-full py-3 rounded-xl bg-gold text-void font-medium hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Confirm Payment
                </>
              )}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// Main Gym Page
export default function GymPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gymId = params.id as string;

  const [gym, setGym] = useState<Gym | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Demo data
  const demoGym: Gym = {
    id: gymId,
    name: "Iron Paradise",
    description:
      "A premium fitness destination with state-of-the-art equipment, expert trainers, and a luxurious atmosphere designed for serious athletes.",
    address: "123 Fitness Avenue, Mumbai 400001",
    location_lat: 19.076,
    location_lng: 72.8777,
    current_crowd_count: 23,
    max_capacity: 50,
    photos: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920&q=80",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=80",
    ],
    amenities: ["WiFi", "Parking", "Showers", "Air Conditioning", "Personal Training"],
    upi_id: "ironparadise@upi",
    opening_hours: {
      monday: "5:00 AM - 11:00 PM",
      tuesday: "5:00 AM - 11:00 PM",
      wednesday: "5:00 AM - 11:00 PM",
      thursday: "5:00 AM - 11:00 PM",
      friday: "5:00 AM - 11:00 PM",
      saturday: "6:00 AM - 10:00 PM",
      sunday: "6:00 AM - 10:00 PM",
    },
  };

  const demoPlans: Plan[] = [
    {
      id: "1",
      name: "Day Pass",
      description: "Perfect for travelers or trying us out",
      price: 299,
      duration_days: 1,
      features: ["Full gym access", "Locker room", "Towel service"],
      is_popular: false,
    },
    {
      id: "2",
      name: "Monthly",
      description: "Our most popular choice",
      price: 1999,
      duration_days: 30,
      features: [
        "Unlimited access",
        "Free group classes",
        "Personal training session",
        "Nutrition consultation",
      ],
      is_popular: true,
    },
    {
      id: "3",
      name: "Quarterly",
      description: "Best value for committed athletes",
      price: 4999,
      duration_days: 90,
      features: [
        "All Monthly benefits",
        "Priority booking",
        "Guest passes (2/month)",
        "Merchandise discount",
      ],
      is_popular: false,
    },
  ];

  useEffect(() => {
    const fetchGym = async () => {
      if (!isSupabaseConfigured) {
        setGym(demoGym);
        setPlans(demoPlans);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch gym
        const { data: gymData, error: gymError } = await supabase
          .from("gyms")
          .select("*")
          .eq("id", gymId)
          .single();

        if (gymError) throw gymError;
        setGym(gymData as Gym);

        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from("plans")
          .select("*")
          .eq("gym_id", gymId)
          .eq("is_active", true)
          .order("price", { ascending: true });

        if (plansError) throw plansError;
        setPlans(plansData as Plan[]);
      } catch (error) {
        console.error("Error fetching gym:", error);
        // Fallback to demo
        setGym(demoGym);
        setPlans(demoPlans);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGym();
  }, [gymId]);

  // Auto-rotate images
  useEffect(() => {
    if (!gym?.photos.length) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % gym.photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [gym?.photos.length]);

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      router.push(`/login?role=athlete&redirect=/gym/${gymId}`);
      return;
    }
    setSelectedPlan(plan);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="text-pearl-muted">Loading gym details...</p>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-pearl mb-4">Gym Not Found</h1>
          <Link href="/dashboard/user" className="text-gold hover:underline">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {/* Background Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={gym.photos[currentImageIndex] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"}
              alt={gym.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/50 to-transparent" />

        {/* Back Button */}
        <motion.div
          className="absolute top-6 left-6 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/dashboard/user"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-pearl hover:bg-black/70 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back</span>
          </Link>
        </motion.div>

        {/* Image Indicators */}
        {gym.photos.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {gym.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentImageIndex ? "bg-gold w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 -mt-20 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Gym Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-luxury-black border border-white/10 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl font-serif text-pearl mb-2">
                  {gym.name}
                </h1>
                <div className="flex items-center gap-2 text-pearl-muted">
                  <MapPin className="w-4 h-4" />
                  <span>{gym.address}</span>
                </div>
              </div>
              <CrowdStatus
                current={gym.current_crowd_count}
                max={gym.max_capacity}
              />
            </div>

            <p className="text-pearl-muted mb-6">{gym.description}</p>

            {/* Amenities */}
            <div className="flex flex-wrap gap-3">
              {gym.amenities.map((amenity, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-pearl-muted text-sm"
                >
                  {amenityIcons[amenity] || <Dumbbell className="w-4 h-4" />}
                  {amenity}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Plans Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-gold" />
              <h2 className="text-2xl font-serif text-pearl">
                Membership <span className="text-gold italic">Plans</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <PlanCard plan={plan} onSelect={handleSelectPlan} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Opening Hours */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-gold" />
              <h3 className="text-lg font-serif text-pearl">Opening Hours</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(gym.opening_hours).map(([day, hours]) => (
                <div key={day} className="text-sm">
                  <p className="text-pearl-muted capitalize">{day}</p>
                  <p className="text-pearl">{hours}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            gym={gym}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
