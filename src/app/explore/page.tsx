"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Map,
  Grid3X3,
  Star,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Gym, Plan } from "@/types/database";
import { cn } from "@/lib/utils";
import { GymCard, FeaturedGymCard, Button } from "@/components/ui";
import { PaymentModal } from "@/components/ui/PaymentModal";

// Filter types
interface Filters {
  search: string;
  priceRange: [number, number];
  crowdLevel: "all" | "low" | "medium" | "high";
  amenities: string[];
  sortBy: "distance" | "price" | "rating" | "crowd";
}

// Mock featured gym for demo
const MOCK_FEATURED_GYM: Gym & { plans: Plan[] } = {
  id: "featured-1",
  owner_id: "owner-1",
  name: "Iron Paradise Elite",
  description:
    "Mumbai's premier luxury fitness destination featuring world-class equipment, Olympic lifting platforms, and personalized training programs.",
  address: "Bandra West, Mumbai",
  location_lat: 19.0596,
  location_lng: 72.8295,
  upi_id: "ironparadise@upi",
  current_crowd_count: 45,
  max_capacity: 100,
  photos: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
  ],
  amenities: [
    "Olympic Lifting",
    "Sauna",
    "Personal Training",
    "Cafe",
    "Parking",
  ],
  opening_hours: { mon: "5:00 AM - 11:00 PM" },
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  plans: [
    {
      id: "plan-1",
      gym_id: "featured-1",
      name: "Day Pass",
      description: "Full access for 24 hours",
      price: 499,
      duration_days: 1,
      features: ["Full Gym Access", "Locker Room", "Towel Service"],
      is_popular: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "plan-2",
      gym_id: "featured-1",
      name: "Weekly Pass",
      description: "7 days of unlimited access",
      price: 1999,
      duration_days: 7,
      features: [
        "Full Gym Access",
        "Locker Room",
        "Towel Service",
        "1 PT Session",
      ],
      is_popular: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "plan-3",
      gym_id: "featured-1",
      name: "Monthly Pass",
      description: "30 days of premium access",
      price: 4999,
      duration_days: 30,
      features: [
        "Full Gym Access",
        "Locker Room",
        "Towel Service",
        "4 PT Sessions",
        "Sauna Access",
      ],
      is_popular: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// Mock gyms for demo
const MOCK_GYMS: (Gym & { plans: Plan[] })[] = [
  MOCK_FEATURED_GYM,
  {
    id: "gym-2",
    owner_id: "owner-2",
    name: "Fitness First Studio",
    description: "Modern fitness center with cutting-edge equipment",
    address: "Andheri East, Mumbai",
    location_lat: 19.1136,
    location_lng: 72.8697,
    upi_id: "fitnessfirst@upi",
    current_crowd_count: 28,
    max_capacity: 60,
    photos: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
    ],
    amenities: ["Cardio Zone", "Weights", "Group Classes", "Parking"],
    opening_hours: { mon: "6:00 AM - 10:00 PM" },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plans: [
      {
        id: "plan-4",
        gym_id: "gym-2",
        name: "Day Pass",
        price: 299,
        duration_days: 1,
        features: ["Full Access"],
        is_popular: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: null,
      },
    ],
  },
  {
    id: "gym-3",
    owner_id: "owner-3",
    name: "CrossFit Box Central",
    description: "Intense CrossFit training facility",
    address: "Lower Parel, Mumbai",
    location_lat: 19.0,
    location_lng: 72.83,
    upi_id: "crossfitbox@upi",
    current_crowd_count: 15,
    max_capacity: 30,
    photos: [
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
    ],
    amenities: ["CrossFit", "Olympic Lifting", "Coaching", "Community"],
    opening_hours: { mon: "5:30 AM - 9:00 PM" },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plans: [
      {
        id: "plan-5",
        gym_id: "gym-3",
        name: "Drop-In",
        price: 599,
        duration_days: 1,
        features: ["1 Class"],
        is_popular: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: null,
      },
    ],
  },
  {
    id: "gym-4",
    owner_id: "owner-4",
    name: "Zen Yoga & Wellness",
    description: "Peaceful yoga and meditation center",
    address: "Juhu, Mumbai",
    location_lat: 19.1075,
    location_lng: 72.8263,
    upi_id: "zenyoga@upi",
    current_crowd_count: 8,
    max_capacity: 25,
    photos: [
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
    ],
    amenities: ["Yoga", "Meditation", "Wellness", "Spa"],
    opening_hours: { mon: "6:00 AM - 8:00 PM" },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plans: [
      {
        id: "plan-6",
        gym_id: "gym-4",
        name: "Single Class",
        price: 399,
        duration_days: 1,
        features: ["1 Yoga Class"],
        is_popular: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: null,
      },
    ],
  },
  {
    id: "gym-5",
    owner_id: "owner-5",
    name: "PowerHouse Gym",
    description: "Hardcore bodybuilding gym",
    address: "Malad West, Mumbai",
    location_lat: 19.1874,
    location_lng: 72.8484,
    upi_id: "powerhouse@upi",
    current_crowd_count: 52,
    max_capacity: 80,
    photos: [
      "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800&q=80",
    ],
    amenities: ["Heavy Weights", "Machines", "Supplements", "Coaching"],
    opening_hours: { mon: "5:00 AM - 11:00 PM" },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plans: [
      {
        id: "plan-7",
        gym_id: "gym-5",
        name: "Day Pass",
        price: 199,
        duration_days: 1,
        features: ["Full Access"],
        is_popular: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: null,
      },
    ],
  },
];

// Available amenities for filtering
const AMENITIES = [
  "Cardio",
  "Weights",
  "CrossFit",
  "Yoga",
  "Swimming",
  "Sauna",
  "Personal Training",
  "Group Classes",
  "Parking",
  "Cafe",
];

export default function ExplorePage() {
  const [gyms, setGyms] = useState<(Gym & { plans: Plan[] })[]>(MOCK_GYMS);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    priceRange: [0, 10000],
    crowdLevel: "all",
    amenities: [],
    sortBy: "distance",
  });

  // Selected gym for booking
  const [selectedGym, setSelectedGym] = useState<
    (Gym & { plans: Plan[] }) | null
  >(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGymDetail, setShowGymDetail] = useState(false);

  // Fetch gyms from Supabase
  const fetchGyms = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("gyms")
        .select(
          `
          *,
          plans(*)
        `
        )
        .eq("is_active", true);

      if (error) throw error;

      if (data && data.length > 0) {
        setGyms(data as (Gym & { plans: Plan[] })[]);
      }
    } catch (error) {
      console.error("Error fetching gyms:", error);
      // Keep mock data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  // Filter gyms based on current filters
  const filteredGyms = gyms.filter((gym) => {
    // Search filter
    if (
      filters.search &&
      !gym.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !gym.address.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Crowd level filter
    if (filters.crowdLevel !== "all") {
      const percentage = (gym.current_crowd_count / gym.max_capacity) * 100;
      if (filters.crowdLevel === "low" && percentage >= 40) return false;
      if (
        filters.crowdLevel === "medium" &&
        (percentage < 40 || percentage >= 70)
      )
        return false;
      if (filters.crowdLevel === "high" && percentage < 70) return false;
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((amenity) =>
        gym.amenities.some((a) =>
          a.toLowerCase().includes(amenity.toLowerCase())
        )
      );
      if (!hasAllAmenities) return false;
    }

    // Price range filter
    if (gym.plans && gym.plans.length > 0) {
      const lowestPrice = Math.min(...gym.plans.map((p) => p.price));
      if (
        lowestPrice < filters.priceRange[0] ||
        lowestPrice > filters.priceRange[1]
      ) {
        return false;
      }
    }

    return true;
  });

  // Handle gym selection
  const handleGymClick = (gym: Gym & { plans: Plan[] }) => {
    setSelectedGym(gym);
    setShowGymDetail(true);
  };

  // Handle plan selection
  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  // Handle payment submission
  const handlePaymentSubmit = async (utr: string) => {
    if (!selectedGym || !selectedPlan) return;

    // Create booking in Supabase
    const { error } = await supabase.from("bookings").insert({
      user_id: "demo-user", // Replace with actual user ID from auth
      gym_id: selectedGym.id,
      plan_id: selectedPlan.id,
      amount: selectedPlan.price,
      transaction_id_utr: utr,
      status: "pending",
    } as never);

    if (error) {
      console.error("Error creating booking:", error);
      throw error;
    }

    // Success - modal will show success state
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-void/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group">
              <h1 className="text-xl font-serif">
                <span className="text-pearl">Muscle</span>
                <span className="text-gold italic">Meter</span>
              </h1>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-muted" />
                <input
                  type="text"
                  placeholder="Search gyms, locations..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-pearl placeholder:text-pearl-dim focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    view === "grid"
                      ? "bg-gold text-void"
                      : "text-pearl-muted hover:text-pearl"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("map")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    view === "map"
                      ? "bg-gold text-void"
                      : "text-pearl-muted hover:text-pearl"
                  )}
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>

              {/* Filters Button */}
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              >
                Filters
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 border-t border-white/5 mt-4">
                  <div className="flex flex-wrap gap-4">
                    {/* Crowd Level */}
                    <div>
                      <label className="block text-xs text-pearl-muted mb-2">
                        Crowd Level
                      </label>
                      <div className="flex gap-2">
                        {(["all", "low", "medium", "high"] as const).map(
                          (level) => (
                            <button
                              key={level}
                              onClick={() =>
                                setFilters({ ...filters, crowdLevel: level })
                              }
                              className={cn(
                                "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                                filters.crowdLevel === level
                                  ? "bg-gold text-void border-gold"
                                  : "border-white/10 text-pearl-muted hover:border-white/20"
                              )}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-xs text-pearl-muted mb-2">
                        Sort By
                      </label>
                      <div className="relative">
                        <select
                          value={filters.sortBy}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              sortBy: e.target.value as Filters["sortBy"],
                            })
                          }
                          className="appearance-none px-4 py-1.5 pr-8 bg-white/5 border border-white/10 rounded-lg text-sm text-pearl focus:outline-none focus:border-gold/50"
                        >
                          <option value="distance">Distance</option>
                          <option value="price">Price</option>
                          <option value="rating">Rating</option>
                          <option value="crowd">Crowd Level</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-pearl-muted pointer-events-none" />
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex-1">
                      <label className="block text-xs text-pearl-muted mb-2">
                        Amenities
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {AMENITIES.slice(0, 6).map((amenity) => (
                          <button
                            key={amenity}
                            onClick={() => {
                              const newAmenities = filters.amenities.includes(
                                amenity
                              )
                                ? filters.amenities.filter((a) => a !== amenity)
                                : [...filters.amenities, amenity];
                              setFilters({
                                ...filters,
                                amenities: newAmenities,
                              });
                            }}
                            className={cn(
                              "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                              filters.amenities.includes(amenity)
                                ? "bg-gold text-void border-gold"
                                : "border-white/10 text-pearl-muted hover:border-white/20"
                            )}
                          >
                            {amenity}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={() =>
                        setFilters({
                          search: "",
                          priceRange: [0, 10000],
                          crowdLevel: "all",
                          amenities: [],
                          sortBy: "distance",
                        })
                      }
                      className="self-end text-xs text-pearl-muted hover:text-gold transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-pearl-muted">
            <span className="text-pearl font-medium">{filteredGyms.length}</span>{" "}
            gyms found
          </p>
          <div className="flex items-center gap-2 text-xs text-pearl-dim">
            <MapPin className="w-3.5 h-3.5" />
            <span>Mumbai, India</span>
          </div>
        </div>

        {isLoading ? (
          // Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Featured Gym */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <FeaturedGymCard
                gym={filteredGyms[0] || MOCK_FEATURED_GYM}
                onClick={() =>
                  handleGymClick(filteredGyms[0] || MOCK_FEATURED_GYM)
                }
              />
            </motion.div>

            {/* Gym Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGyms.slice(1).map((gym, index) => (
                <motion.div
                  key={gym.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GymCard gym={gym} onClick={() => handleGymClick(gym)} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Gym Detail Modal */}
      <AnimatePresence>
        {showGymDetail && selectedGym && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-void/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGymDetail(false)}
            />
            <motion.div
              className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-void-100 rounded-3xl border border-white/10 overflow-hidden flex flex-col lg:flex-row"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Left - Image */}
              <div className="relative lg:w-1/2 h-64 lg:h-auto">
                <img
                  src={
                    selectedGym.photos[0] ||
                    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
                  }
                  alt={selectedGym.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-void-100 via-transparent to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setShowGymDetail(false)}
                  className="absolute top-4 right-4 p-3 rounded-full bg-void/50 backdrop-blur-sm text-pearl hover:bg-void/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Right - Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-sm text-gold">4.9 Rating</span>
                  </div>
                  <h2 className="text-3xl font-serif text-pearl mb-2">
                    {selectedGym.name}
                  </h2>
                  <div className="flex items-center gap-2 text-pearl-muted">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedGym.address}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-pearl-muted mb-6">
                  {selectedGym.description ||
                    "Premium fitness facility with world-class equipment and amenities."}
                </p>

                {/* Amenities */}
                <div className="mb-8">
                  <h3 className="text-sm text-pearl-dim uppercase tracking-wider mb-3">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGym.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-pearl"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Plans */}
                <div>
                  <h3 className="text-sm text-pearl-dim uppercase tracking-wider mb-4">
                    Choose a Plan
                  </h3>
                  <div className="space-y-3">
                    {selectedGym.plans?.map((plan) => (
                      <motion.button
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all",
                          plan.is_popular
                            ? "border-gold/50 bg-gold/5"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-pearl">
                                {plan.name}
                              </h4>
                              {plan.is_popular && (
                                <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-pearl-muted">
                              {plan.duration_days} day
                              {plan.duration_days > 1 ? "s" : ""} access
                            </p>
                          </div>
                          <span className="text-xl font-bold text-gold">
                            ₹{plan.price}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {plan.features.map((feature, i) => (
                            <span
                              key={i}
                              className="text-xs text-pearl-dim"
                            >
                              • {feature}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        gym={selectedGym}
        onPaymentSubmit={handlePaymentSubmit}
      />
    </div>
  );
}
