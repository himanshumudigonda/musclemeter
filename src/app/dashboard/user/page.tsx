"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Users,
  Star,
  Filter,
  Search,
  Navigation,
  Loader2,
  Heart,
  Clock,
  Zap,
  X,
  ChevronDown,
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
  distance?: number; // Calculated client-side
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Crowd status badge component
function CrowdBadge({ current, max }: { current: number; max: number }) {
  const percentage = Math.round((current / max) * 100);
  const status =
    percentage >= 80 ? "busy" : percentage >= 50 ? "moderate" : "quiet";

  const config = {
    busy: {
      bg: "bg-status-danger/20",
      text: "text-status-danger",
      dot: "bg-status-danger",
      label: "Busy",
      icon: "🔴",
    },
    moderate: {
      bg: "bg-status-warning/20",
      text: "text-status-warning",
      dot: "bg-status-warning",
      label: "Moderate",
      icon: "🟡",
    },
    quiet: {
      bg: "bg-status-success/20",
      text: "text-status-success",
      dot: "bg-status-success",
      label: "Quiet",
      icon: "🟢",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute top-3 left-3 px-3 py-1.5 rounded-full ${config[status].bg} backdrop-blur-md flex items-center gap-2`}
    >
      <span className="text-xs">{config[status].icon}</span>
      <span className={`text-xs font-medium ${config[status].text}`}>
        {config[status].label}: {percentage}%
      </span>
    </motion.div>
  );
}

// Gym Card Component (Masonry Style)
function GymCard({
  gym,
  index,
  onSelect,
}: {
  gym: Gym;
  index: number;
  onSelect: (gym: Gym) => void;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Random height for masonry effect
  const heights = ["h-64", "h-72", "h-80", "h-96"];
  const height = heights[index % heights.length];

  const defaultImage =
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80";
  const gymImage = gym.photos?.[0] || defaultImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={`relative ${height} rounded-2xl overflow-hidden cursor-pointer group`}
      onClick={() => onSelect(gym)}
      style={{ touchAction: "manipulation" }}
    >
      {/* Image */}
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="w-full h-full bg-white/5 animate-pulse" />
        )}
        <img
          src={gymImage}
          alt={gym.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />

      {/* Live Badge */}
      <CrowdBadge current={gym.current_crowd_count} max={gym.max_capacity} />

      {/* Like Button */}
      <motion.button
        className="absolute top-3 right-3 p-2 rounded-full bg-void/50 backdrop-blur-md"
        onClick={(e) => {
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isLiked ? "fill-status-danger text-status-danger" : "text-white"
          }`}
        />
      </motion.button>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-serif text-pearl mb-1 line-clamp-1">
          {gym.name}
        </h3>

        <div className="flex items-center gap-3 text-sm">
          {gym.distance !== undefined && (
            <span className="flex items-center gap-1 text-gold">
              <Navigation className="w-3 h-3" />
              {gym.distance.toFixed(1)} km
            </span>
          )}
          <span className="flex items-center gap-1 text-pearl-muted">
            <Users className="w-3 h-3" />
            {gym.current_crowd_count}/{gym.max_capacity}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Filter Drawer Component
function FilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: { sortBy: string; crowdLevel: string };
  setFilters: (filters: { sortBy: string; crowdLevel: string }) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-void/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-void border-t border-white/10 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            <h3 className="text-xl font-serif text-pearl mb-6">Filters</h3>

            {/* Sort By */}
            <div className="mb-6">
              <label className="text-sm text-pearl-muted mb-3 block">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "distance", label: "Nearest", icon: Navigation },
                  { value: "crowd", label: "Least Busy", icon: Users },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setFilters({ ...filters, sortBy: option.value })
                    }
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      filters.sortBy === option.value
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-white/10 text-pearl-muted hover:border-white/20"
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Crowd Level */}
            <div className="mb-6">
              <label className="text-sm text-pearl-muted mb-3 block">
                Crowd Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "all", label: "All" },
                  { value: "quiet", label: "🟢 Quiet" },
                  { value: "moderate", label: "🟡 Moderate" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setFilters({ ...filters, crowdLevel: option.value })
                    }
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      filters.crowdLevel === option.value
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-white/10 text-pearl-muted hover:border-white/20"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-gold text-void rounded-xl font-medium"
            >
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Main User Dashboard Component
export default function UserDashboard() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: "distance",
    crowdLevel: "all",
  });
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  // Demo data
  const demoGyms: Gym[] = [
    {
      id: "1",
      name: "Iron Paradise",
      description: "Premium strength training facility",
      address: "123 Fitness Avenue, Mumbai",
      location_lat: 19.076,
      location_lng: 72.8777,
      current_crowd_count: 23,
      max_capacity: 50,
      photos: [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      ],
      amenities: ["Weight Training", "Cardio", "Sauna"],
    },
    {
      id: "2",
      name: "Zen Flow Studio",
      description: "Yoga and mindfulness center",
      address: "456 Wellness Road, Mumbai",
      location_lat: 19.082,
      location_lng: 72.8812,
      current_crowd_count: 8,
      max_capacity: 25,
      photos: [
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
      ],
      amenities: ["Yoga", "Meditation", "Showers"],
    },
    {
      id: "3",
      name: "CrossFit Thunder",
      description: "High-intensity functional fitness",
      address: "789 Power Street, Mumbai",
      location_lat: 19.089,
      location_lng: 72.8654,
      current_crowd_count: 42,
      max_capacity: 45,
      photos: [
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
      ],
      amenities: ["CrossFit", "Strength", "Group Classes"],
    },
    {
      id: "4",
      name: "Aqua Fitness Hub",
      description: "Swimming and aqua aerobics",
      address: "321 Pool Lane, Mumbai",
      location_lat: 19.065,
      location_lng: 72.8901,
      current_crowd_count: 15,
      max_capacity: 60,
      photos: [
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80",
      ],
      amenities: ["Swimming Pool", "Sauna", "Lockers"],
    },
    {
      id: "5",
      name: "Elite Boxing Academy",
      description: "Professional boxing training",
      address: "555 Fighter Way, Mumbai",
      location_lat: 19.072,
      location_lng: 72.8733,
      current_crowd_count: 12,
      max_capacity: 30,
      photos: [
        "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
      ],
      amenities: ["Boxing", "Personal Training", "Showers"],
    },
    {
      id: "6",
      name: "24/7 Powerhouse",
      description: "Round-the-clock fitness access",
      address: "888 Midnight Road, Mumbai",
      location_lat: 19.095,
      location_lng: 72.8555,
      current_crowd_count: 31,
      max_capacity: 80,
      photos: [
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
      ],
      amenities: ["24/7 Access", "Cardio", "Weight Training"],
    },
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Mumbai if location denied
          setUserLocation({ lat: 19.076, lng: 72.8777 });
        }
      );
    }
  }, []);

  // Fetch gyms
  useEffect(() => {
    const fetchGyms = async () => {
      if (!isSupabaseConfigured) {
        setGyms(demoGyms);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("gyms")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;
        setGyms((data as Gym[]) || []);
      } catch (error) {
        console.error("Error fetching gyms:", error);
        setGyms(demoGyms);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGyms();

    // Subscribe to realtime updates
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel("gyms-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "gyms" },
          (payload) => {
            if (payload.eventType === "UPDATE") {
              setGyms((prev) =>
                prev.map((g) =>
                  g.id === (payload.new as Gym).id ? (payload.new as Gym) : g
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Process and filter gyms
  const processedGyms = useMemo(() => {
    let result = [...gyms];

    // Calculate distances if we have user location
    if (userLocation) {
      result = result.map((gym) => ({
        ...gym,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          gym.location_lat,
          gym.location_lng
        ),
      }));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (gym) =>
          gym.name.toLowerCase().includes(query) ||
          gym.address.toLowerCase().includes(query) ||
          gym.amenities.some((a) => a.toLowerCase().includes(query))
      );
    }

    // Apply crowd filter
    if (filters.crowdLevel !== "all") {
      result = result.filter((gym) => {
        const percentage = (gym.current_crowd_count / gym.max_capacity) * 100;
        if (filters.crowdLevel === "quiet") return percentage < 50;
        if (filters.crowdLevel === "moderate")
          return percentage >= 50 && percentage < 80;
        return true;
      });
    }

    // Apply sorting
    if (filters.sortBy === "distance" && userLocation) {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (filters.sortBy === "crowd") {
      result.sort(
        (a, b) =>
          a.current_crowd_count / a.max_capacity -
          b.current_crowd_count / b.max_capacity
      );
    }

    return result;
  }, [gyms, userLocation, searchQuery, filters]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void" style={{ touchAction: "manipulation" }}>
      {/* Background */}
      <div className="fixed inset-0 noise-overlay opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-void/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-xl font-serif">
              <span className="text-pearl">Muscle</span>
              <span className="text-gold italic">Meter</span>
            </Link>

            <div className="flex items-center gap-3">
              {user && profile && (
                <div className="flex items-center gap-2">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-8 h-8 rounded-full border border-gold/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-medium">
                      {profile.full_name?.[0] || "U"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gyms, amenities..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-pearl placeholder:text-pearl-dim focus:border-gold/50 focus:bg-white/[0.07] outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-pearl-muted hover:text-pearl hover:bg-white/10 transition-all"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 text-pearl-muted">
              <MapPin className="w-4 h-4 text-gold" />
              <span>{processedGyms.length} gyms nearby</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2 text-pearl-muted">
                <Zap className="w-4 h-4 text-status-success" />
                <span>Location active</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Masonry Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {processedGyms.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {processedGyms.map((gym, index) => (
              <div key={gym.id} className="break-inside-avoid">
                <GymCard
                  gym={gym}
                  index={index}
                  onSelect={setSelectedGym}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-pearl-muted mx-auto mb-4" />
            <h3 className="text-xl font-serif text-pearl mb-2">No gyms found</h3>
            <p className="text-pearl-muted">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </main>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Gym Detail Modal */}
      <AnimatePresence>
        {selectedGym && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="min-h-screen p-4">
              <button
                onClick={() => setSelectedGym(null)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-pearl z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="max-w-2xl mx-auto pt-12"
              >
                {/* Image */}
                <div className="relative h-64 rounded-3xl overflow-hidden mb-6">
                  <img
                    src={
                      selectedGym.photos?.[0] ||
                      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
                    }
                    alt={selectedGym.name}
                    className="w-full h-full object-cover"
                  />
                  <CrowdBadge
                    current={selectedGym.current_crowd_count}
                    max={selectedGym.max_capacity}
                  />
                </div>

                {/* Details */}
                <h1 className="text-3xl font-serif text-pearl mb-2">
                  {selectedGym.name}
                </h1>
                <p className="text-pearl-muted mb-4">{selectedGym.description}</p>

                <div className="flex items-center gap-4 mb-6 text-sm">
                  <span className="flex items-center gap-2 text-pearl-muted">
                    <MapPin className="w-4 h-4" />
                    {selectedGym.distance?.toFixed(1) || "?"} km away
                  </span>
                  <span className="flex items-center gap-2 text-pearl-muted">
                    <Users className="w-4 h-4" />
                    {selectedGym.current_crowd_count}/{selectedGym.max_capacity} people
                  </span>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-sm text-pearl-muted mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGym.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-pearl"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/gym/${selectedGym.id}`}
                  className="block w-full py-4 bg-gold text-void text-center rounded-xl font-medium"
                >
                  View Plans & Book
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
