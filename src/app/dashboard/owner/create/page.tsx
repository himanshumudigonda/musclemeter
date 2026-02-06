"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Loader2,
  Upload,
  X,
  Plus,
  Check,
  Sparkles,
  Building2,
  Camera,
  CreditCard,
  Trash2,
} from "lucide-react";
import { useCreationStore, GymPlan } from "@/store/creationStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/providers";

// Step indicator component
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i + 1 <= current ? "bg-gold" : "bg-white/10"
          }`}
          initial={{ width: 20 }}
          animate={{ width: i + 1 === current ? 40 : 20 }}
        />
      ))}
    </div>
  );
}

// Step 1: Name Your Space
function StepName() {
  const { data, updateData } = useCreationStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 text-gold"
        >
          <Building2 className="w-5 h-5" />
          <span className="text-sm tracking-[0.2em] uppercase">Step 1 of 4</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-serif text-pearl"
        >
          Name your <span className="text-gold italic">space</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-pearl-muted"
        >
          What do you call your fitness sanctuary?
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="text-sm text-pearl-muted tracking-wide">
            Gym Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="e.g., Iron Paradise"
            className="w-full bg-transparent border-b border-white/20 focus:border-gold py-4 text-2xl font-serif text-pearl placeholder:text-pearl-dim outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-pearl-muted tracking-wide">
            Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Tell athletes what makes your gym special..."
            rows={3}
            className="w-full bg-transparent border-b border-white/20 focus:border-gold py-4 text-lg text-pearl placeholder:text-pearl-dim outline-none transition-colors resize-none"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Step 2: Location
function StepLocation() {
  const { data, updateData } = useCreationStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState("");

  const detectLocation = () => {
    setIsDetecting(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        updateData({
          location_lat: latitude,
          location_lng: longitude,
        });

        // Try to get address from coordinates (reverse geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const result = await response.json();
          if (result.display_name) {
            updateData({ address: result.display_name });
          }
        } catch {
          // Silently fail - user can enter address manually
        }

        setIsDetecting(false);
      },
      (error) => {
        setLocationError(
          error.code === 1
            ? "Location access denied. Please enter address manually."
            : "Unable to detect location. Please try again."
        );
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 text-gold"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-sm tracking-[0.2em] uppercase">Step 2 of 4</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-serif text-pearl"
        >
          Where is <span className="text-gold italic">it?</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-pearl-muted"
        >
          Help athletes find their way to you
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        {/* Auto-detect button */}
        <motion.button
          onClick={detectLocation}
          disabled={isDetecting}
          className="w-full p-6 rounded-2xl border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-all flex items-center justify-center gap-3 group"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {isDetecting ? (
            <Loader2 className="w-5 h-5 text-gold animate-spin" />
          ) : (
            <MapPin className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
          )}
          <span className="text-pearl font-medium">
            {isDetecting ? "Detecting location..." : "Auto-detect my location"}
          </span>
        </motion.button>

        {locationError && (
          <p className="text-status-danger text-sm">{locationError}</p>
        )}

        {data.location_lat && data.location_lng && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-status-success/10 border border-status-success/30 rounded-xl flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-status-success" />
            <span className="text-status-success text-sm">
              Location detected: {data.location_lat.toFixed(4)}, {data.location_lng.toFixed(4)}
            </span>
          </motion.div>
        )}

        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
          <p className="text-center text-pearl-dim text-sm bg-void px-4 relative inline-block left-1/2 -translate-x-1/2">
            or enter manually
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-pearl-muted tracking-wide">
            Full Address
          </label>
          <textarea
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            placeholder="123 Fitness Street, Gym City, 12345"
            rows={2}
            className="w-full bg-transparent border-b border-white/20 focus:border-gold py-4 text-lg text-pearl placeholder:text-pearl-dim outline-none transition-colors resize-none"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Step 3: Photos
function StepPhotos() {
  const { data, addPhoto, removePhoto } = useCreationStore();
  const maxPhotos = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = maxPhotos - data.photos.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => addPhoto(file));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 text-gold"
        >
          <Camera className="w-5 h-5" />
          <span className="text-sm tracking-[0.2em] uppercase">Step 3 of 4</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-serif text-pearl"
        >
          Upload the <span className="text-gold italic">vibe</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-pearl-muted"
        >
          Show off your space with up to 5 photos
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.photoUrls.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden group"
            >
              <img
                src={url}
                alt={`Gym photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-void/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removePhoto(index)}
                  className="p-3 bg-status-danger rounded-full hover:bg-status-danger/80 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>
          ))}

          {data.photos.length < maxPhotos && (
            <motion.label
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-gold/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 bg-white/[0.02]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-8 h-8 text-pearl-muted" />
              <span className="text-sm text-pearl-muted">
                Add photo ({data.photos.length}/{maxPhotos})
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.label>
          )}
        </div>

        {data.photos.length === 0 && (
          <p className="text-pearl-dim text-sm text-center">
            Tip: Photos of equipment, atmosphere, and amenities work best
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// Step 4: Plans & Payment
function StepPlans() {
  const { data, updateData, addPlan, removePlan } = useCreationStore();
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    duration_days: "1",
    features: "",
  });

  const amenityOptions = [
    "Weight Training",
    "Cardio Zone",
    "CrossFit",
    "Yoga Studio",
    "Swimming Pool",
    "Sauna",
    "Parking",
    "Showers",
    "Lockers",
    "Personal Training",
    "Group Classes",
    "Juice Bar",
  ];

  const toggleAmenity = (amenity: string) => {
    const current = data.amenities;
    if (current.includes(amenity)) {
      updateData({ amenities: current.filter((a) => a !== amenity) });
    } else {
      updateData({ amenities: [...current, amenity] });
    }
  };

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.price) return;

    const plan: GymPlan = {
      id: crypto.randomUUID(),
      name: newPlan.name,
      price: parseFloat(newPlan.price),
      duration_days: parseInt(newPlan.duration_days),
      features: newPlan.features.split(",").map((f) => f.trim()).filter(Boolean),
      is_popular: data.plans.length === 0, // First plan is popular by default
    };

    addPlan(plan);
    setNewPlan({ name: "", price: "", duration_days: "1", features: "" });
    setShowPlanForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 text-gold"
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-sm tracking-[0.2em] uppercase">Step 4 of 4</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-serif text-pearl"
        >
          Set the <span className="text-gold italic">rules</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-pearl-muted"
        >
          Define your pricing and capacity
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-8"
      >
        {/* UPI ID */}
        <div className="space-y-2">
          <label className="text-sm text-pearl-muted tracking-wide">
            UPI ID (for direct payments)
          </label>
          <input
            type="text"
            value={data.upi_id}
            onChange={(e) => updateData({ upi_id: e.target.value })}
            placeholder="yourname@upi"
            className="w-full bg-transparent border-b border-white/20 focus:border-gold py-4 text-xl text-pearl placeholder:text-pearl-dim outline-none transition-colors"
          />
        </div>

        {/* Max Capacity */}
        <div className="space-y-2">
          <label className="text-sm text-pearl-muted tracking-wide">
            Maximum Capacity
          </label>
          <input
            type="number"
            value={data.max_capacity}
            onChange={(e) => updateData({ max_capacity: parseInt(e.target.value) || 50 })}
            min={1}
            max={1000}
            className="w-full bg-transparent border-b border-white/20 focus:border-gold py-4 text-xl text-pearl placeholder:text-pearl-dim outline-none transition-colors"
          />
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <label className="text-sm text-pearl-muted tracking-wide">
            Amenities
          </label>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((amenity) => (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  data.amenities.includes(amenity)
                    ? "bg-gold text-void"
                    : "bg-white/5 text-pearl-muted hover:bg-white/10"
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-pearl-muted tracking-wide">
              Membership Plans
            </label>
            <button
              onClick={() => setShowPlanForm(true)}
              className="flex items-center gap-2 text-gold text-sm hover:text-gold-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </div>

          {/* Existing plans */}
          <div className="space-y-3">
            {data.plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-pearl">{plan.name}</span>
                    {plan.is_popular && (
                      <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-pearl-muted text-sm">
                    ₹{plan.price} / {plan.duration_days} day{plan.duration_days > 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => removePlan(plan.id)}
                  className="p-2 text-pearl-dim hover:text-status-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* New plan form */}
          <AnimatePresence>
            {showPlanForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-gold/30 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="Plan name"
                    className="bg-transparent border-b border-white/20 focus:border-gold py-2 text-pearl placeholder:text-pearl-dim outline-none"
                  />
                  <input
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                    placeholder="Price (₹)"
                    className="bg-transparent border-b border-white/20 focus:border-gold py-2 text-pearl placeholder:text-pearl-dim outline-none"
                  />
                </div>
                <select
                  value={newPlan.duration_days}
                  onChange={(e) => setNewPlan({ ...newPlan, duration_days: e.target.value })}
                  className="w-full bg-void border-b border-white/20 focus:border-gold py-2 text-pearl outline-none"
                >
                  <option value="1">1 Day Pass</option>
                  <option value="7">7 Days (Week)</option>
                  <option value="30">30 Days (Month)</option>
                  <option value="90">90 Days (Quarter)</option>
                  <option value="365">365 Days (Year)</option>
                </select>
                <input
                  type="text"
                  value={newPlan.features}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                  placeholder="Features (comma-separated)"
                  className="w-full bg-transparent border-b border-white/20 focus:border-gold py-2 text-pearl placeholder:text-pearl-dim outline-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddPlan}
                    className="flex-1 py-2 bg-gold text-void rounded-lg font-medium hover:bg-gold-400 transition-colors"
                  >
                    Add Plan
                  </button>
                  <button
                    onClick={() => setShowPlanForm(false)}
                    className="px-4 py-2 text-pearl-muted hover:text-pearl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {data.plans.length === 0 && !showPlanForm && (
            <p className="text-pearl-dim text-sm text-center py-4">
              Add at least one plan for athletes to book
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Page Component
export default function CreateGymPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { currentStep, data, nextStep, prevStep, reset } = useCreationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim().length >= 2;
      case 2:
        return data.address.trim().length > 0 || (data.location_lat && data.location_lng);
      case 3:
        return true; // Photos are optional
      case 4:
        return data.upi_id.trim().length > 0 && data.plans.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!isSupabaseConfigured || !user) {
      // Demo mode - just go to dashboard
      reset();
      router.push("/dashboard");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Upload photos to Supabase Storage
      const photoUrls: string[] = [];
      for (const photo of data.photos) {
        const fileName = `${user.id}/${Date.now()}-${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("gym-photos")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("gym-photos")
          .getPublicUrl(fileName);

        photoUrls.push(urlData.publicUrl);
      }

      // Create gym
      const { data: gym, error: gymError } = await supabase
        .from("gyms")
        .insert({
          owner_id: user.id,
          name: data.name,
          description: data.description,
          address: data.address,
          location_lat: data.location_lat || 0,
          location_lng: data.location_lng || 0,
          upi_id: data.upi_id,
          max_capacity: data.max_capacity,
          photos: photoUrls,
          amenities: data.amenities,
        } as never)
        .select()
        .single();

      if (gymError) throw gymError;

      // Create plans
      for (const plan of data.plans) {
        const { error: planError } = await supabase.from("plans").insert({
          gym_id: (gym as { id: string }).id,
          name: plan.name,
          price: plan.price,
          duration_days: plan.duration_days,
          features: plan.features,
          is_popular: plan.is_popular,
        } as never);

        if (planError) throw planError;
      }

      reset();
      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating gym:", err);
      setError("Failed to create gym. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: Record<number, React.ReactNode> = {
    1: <StepName />,
    2: <StepLocation />,
    3: <StepPhotos />,
    4: <StepPlans />,
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Background effects */}
      <div className="fixed inset-0 noise-overlay opacity-30 pointer-events-none" />
      <motion.div
        className="fixed top-1/4 -right-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => (currentStep === 1 ? router.back() : prevStep())}
            className="flex items-center gap-2 text-pearl-muted hover:text-pearl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{currentStep === 1 ? "Cancel" : "Back"}</span>
          </button>

          <StepIndicator current={currentStep} total={4} />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <div key={currentStep}>{steps[currentStep]}</div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-status-danger/10 border border-status-danger/30 rounded-xl text-status-danger text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          className="mt-12 flex justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {currentStep < 4 ? (
            <motion.button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-3 px-8 py-4 bg-gold text-void font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-400 transition-colors"
              whileHover={{ scale: canProceed() ? 1.02 : 1 }}
              whileTap={{ scale: canProceed() ? 0.98 : 1 }}
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-3 px-8 py-4 bg-gold text-void font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-400 transition-colors"
              whileHover={{ scale: canProceed() && !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: canProceed() && !isSubmitting ? 0.98 : 1 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Launch Your Gym</span>
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
