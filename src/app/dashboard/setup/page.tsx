"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Camera,
  Check,
  Loader2,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui";

// Available amenities
const AMENITIES_OPTIONS = [
  "Cardio Zone",
  "Free Weights",
  "Machines",
  "CrossFit",
  "Olympic Lifting",
  "Yoga Studio",
  "Group Classes",
  "Personal Training",
  "Swimming Pool",
  "Sauna",
  "Steam Room",
  "Locker Room",
  "Showers",
  "Towel Service",
  "Parking",
  "Cafe",
  "Supplements Shop",
  "Wi-Fi",
  "Air Conditioning",
  "24/7 Access",
];

// Plan template
interface PlanTemplate {
  name: string;
  duration_days: number;
  price: number;
  features: string[];
  is_popular: boolean;
}

export default function GymSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [gymData, setGymData] = useState({
    name: "",
    description: "",
    address: "",
    location_lat: 19.076,
    location_lng: 72.8777,
    upi_id: "",
    max_capacity: 50,
    amenities: [] as string[],
    opening_hours: {
      mon: "6:00 AM - 10:00 PM",
      tue: "6:00 AM - 10:00 PM",
      wed: "6:00 AM - 10:00 PM",
      thu: "6:00 AM - 10:00 PM",
      fri: "6:00 AM - 10:00 PM",
      sat: "7:00 AM - 8:00 PM",
      sun: "7:00 AM - 6:00 PM",
    },
    photos: [] as string[],
  });

  const [plans, setPlans] = useState<PlanTemplate[]>([
    {
      name: "Day Pass",
      duration_days: 1,
      price: 299,
      features: ["Full Gym Access", "Locker Room"],
      is_popular: false,
    },
    {
      name: "Weekly Pass",
      duration_days: 7,
      price: 1499,
      features: ["Full Gym Access", "Locker Room", "Towel Service"],
      is_popular: true,
    },
    {
      name: "Monthly Pass",
      duration_days: 30,
      price: 3999,
      features: ["Full Gym Access", "Locker Room", "Towel Service", "Guest Pass"],
      is_popular: false,
    },
  ]);

  const totalSteps = 4;

  // Toggle amenity
  const toggleAmenity = (amenity: string) => {
    setGymData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Update plan
  const updatePlan = (index: number, field: keyof PlanTemplate, value: unknown) => {
    setPlans((prev) =>
      prev.map((plan, i) => (i === index ? { ...plan, [field]: value } : plan))
    );
  };

  // Add new plan
  const addPlan = () => {
    setPlans((prev) => [
      ...prev,
      {
        name: "New Plan",
        duration_days: 1,
        price: 0,
        features: [],
        is_popular: false,
      },
    ]);
  };

  // Remove plan
  const removePlan = (index: number) => {
    setPlans((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Create gym
      const { data: gymResult, error: gymError } = await supabase
        .from("gyms")
        .insert({
          owner_id: user.id,
          name: gymData.name,
          description: gymData.description,
          address: gymData.address,
          location_lat: gymData.location_lat,
          location_lng: gymData.location_lng,
          upi_id: gymData.upi_id,
          max_capacity: gymData.max_capacity,
          amenities: gymData.amenities,
          opening_hours: gymData.opening_hours,
          photos: gymData.photos.length > 0 
            ? gymData.photos 
            : ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"],
        } as never)
        .select()
        .single();

      if (gymError) throw gymError;

      // Create plans
      const plansToInsert = plans.map((plan) => ({
        gym_id: (gymResult as { id: string }).id,
        name: plan.name,
        price: plan.price,
        duration_days: plan.duration_days,
        features: plan.features,
        is_popular: plan.is_popular,
      }));

      const { error: plansError } = await supabase
        .from("plans")
        .insert(plansToInsert as never);

      if (plansError) throw plansError;

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating gym:", error);
      alert("Error creating gym. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step validation
  const canProceed = () => {
    switch (step) {
      case 1:
        return gymData.name && gymData.address && gymData.max_capacity > 0;
      case 2:
        return gymData.amenities.length > 0;
      case 3:
        return gymData.upi_id && plans.length > 0 && plans.every((p) => p.price > 0);
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-void/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="group">
            <h1 className="text-xl font-serif">
              <span className="text-pearl">Muscle</span>
              <span className="text-gold italic">Meter</span>
            </h1>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-8 h-1 rounded-full transition-colors",
                  s <= step ? "bg-gold" : "bg-white/10"
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm mb-4">
                  <Building2 className="w-4 h-4" />
                  <span>Step 1 of 4</span>
                </div>
                <h2 className="text-4xl font-serif text-pearl mb-3">
                  Tell us about your <span className="text-gold italic">gym</span>
                </h2>
                <p className="text-pearl-muted">
                  Basic information that helps athletes find you
                </p>
              </div>

              <div className="space-y-6 max-w-xl mx-auto">
                {/* Gym Name */}
                <div>
                  <label className="block text-sm text-pearl-muted mb-2">
                    Gym Name *
                  </label>
                  <input
                    type="text"
                    value={gymData.name}
                    onChange={(e) =>
                      setGymData({ ...gymData, name: e.target.value })
                    }
                    placeholder="Iron Paradise Elite"
                    className="input-luxury"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-pearl-muted mb-2">
                    Description
                  </label>
                  <textarea
                    value={gymData.description}
                    onChange={(e) =>
                      setGymData({ ...gymData, description: e.target.value })
                    }
                    placeholder="Tell athletes what makes your gym special..."
                    rows={4}
                    className="input-luxury resize-none"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm text-pearl-muted mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-pearl-dim" />
                    <input
                      type="text"
                      value={gymData.address}
                      onChange={(e) =>
                        setGymData({ ...gymData, address: e.target.value })
                      }
                      placeholder="Bandra West, Mumbai"
                      className="input-luxury pl-12"
                    />
                  </div>
                </div>

                {/* Max Capacity */}
                <div>
                  <label className="block text-sm text-pearl-muted mb-2">
                    Maximum Capacity *
                  </label>
                  <input
                    type="number"
                    value={gymData.max_capacity}
                    onChange={(e) =>
                      setGymData({
                        ...gymData,
                        max_capacity: parseInt(e.target.value) || 0,
                      })
                    }
                    min={1}
                    className="input-luxury"
                  />
                  <p className="mt-2 text-xs text-pearl-dim">
                    This is used for the live crowd meter feature
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Amenities */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Step 2 of 4</span>
                </div>
                <h2 className="text-4xl font-serif text-pearl mb-3">
                  What do you <span className="text-gold italic">offer?</span>
                </h2>
                <p className="text-pearl-muted">
                  Select all amenities available at your gym
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <motion.button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                      gymData.amenities.includes(amenity)
                        ? "bg-gold text-void border-gold"
                        : "bg-white/5 text-pearl-muted border-white/10 hover:border-white/20"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {gymData.amenities.includes(amenity) && (
                      <Check className="w-4 h-4 inline mr-2" />
                    )}
                    {amenity}
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-pearl-muted text-sm mt-8">
                Selected: {gymData.amenities.length} amenities
              </p>
            </motion.div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm mb-4">
                  <DollarSign className="w-4 h-4" />
                  <span>Step 3 of 4</span>
                </div>
                <h2 className="text-4xl font-serif text-pearl mb-3">
                  Set your <span className="text-gold italic">pricing</span>
                </h2>
                <p className="text-pearl-muted">
                  Configure your UPI and membership plans
                </p>
              </div>

              {/* UPI ID */}
              <div className="max-w-xl mx-auto mb-8">
                <label className="block text-sm text-pearl-muted mb-2">
                  UPI ID for Payments *
                </label>
                <input
                  type="text"
                  value={gymData.upi_id}
                  onChange={(e) =>
                    setGymData({ ...gymData, upi_id: e.target.value })
                  }
                  placeholder="yourgym@upi"
                  className="input-luxury"
                />
                <p className="mt-2 text-xs text-pearl-dim">
                  Athletes will pay directly to this UPI ID. Zero platform fees!
                </p>
              </div>

              {/* Plans */}
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-pearl">Membership Plans</h3>
                  <button
                    onClick={addPlan}
                    className="flex items-center gap-2 text-sm text-gold hover:text-gold-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Plan
                  </button>
                </div>

                {plans.map((plan, index) => (
                  <motion.div
                    key={index}
                    layout
                    className={cn(
                      "p-5 rounded-xl border bg-white/[0.02]",
                      plan.is_popular ? "border-gold/50" : "border-white/10"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-pearl-dim mb-1">
                            Plan Name
                          </label>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) =>
                              updatePlan(index, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-pearl focus:outline-none focus:border-gold/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-pearl-dim mb-1">
                            Duration (days)
                          </label>
                          <input
                            type="number"
                            value={plan.duration_days}
                            onChange={(e) =>
                              updatePlan(
                                index,
                                "duration_days",
                                parseInt(e.target.value) || 1
                              )
                            }
                            min={1}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-pearl focus:outline-none focus:border-gold/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-pearl-dim mb-1">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={plan.price}
                            onChange={(e) =>
                              updatePlan(
                                index,
                                "price",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min={0}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-pearl focus:outline-none focus:border-gold/50"
                          />
                        </div>
                      </div>
                      {plans.length > 1 && (
                        <button
                          onClick={() => removePlan(index)}
                          className="ml-4 p-2 text-pearl-dim hover:text-status-danger transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-pearl-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plan.is_popular}
                          onChange={(e) =>
                            updatePlan(index, "is_popular", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/50"
                        />
                        Mark as Popular
                      </label>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm mb-4">
                  <Check className="w-4 h-4" />
                  <span>Step 4 of 4</span>
                </div>
                <h2 className="text-4xl font-serif text-pearl mb-3">
                  Review & <span className="text-gold italic">Launch</span>
                </h2>
                <p className="text-pearl-muted">
                  Make sure everything looks good before going live
                </p>
              </div>

              {/* Review Card */}
              <div className="max-w-2xl mx-auto p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
                {/* Gym Preview */}
                <div className="mb-8 pb-8 border-b border-white/10">
                  <h3 className="text-sm text-pearl-dim uppercase tracking-wider mb-4">
                    Your Gym
                  </h3>
                  <div className="flex gap-6">
                    <div className="w-32 h-32 rounded-xl bg-gradient-gold flex items-center justify-center">
                      <Camera className="w-8 h-8 text-void/50" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-serif text-pearl mb-2">
                        {gymData.name || "Your Gym Name"}
                      </h4>
                      <p className="text-pearl-muted flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4" />
                        {gymData.address || "Your address"}
                      </p>
                      <p className="text-pearl-muted flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Capacity: {gymData.max_capacity} people
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-8 pb-8 border-b border-white/10">
                  <h3 className="text-sm text-pearl-dim uppercase tracking-wider mb-4">
                    Amenities ({gymData.amenities.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {gymData.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-pearl"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-8 pb-8 border-b border-white/10">
                  <h3 className="text-sm text-pearl-dim uppercase tracking-wider mb-4">
                    Pricing Plans
                  </h3>
                  <div className="space-y-3">
                    {plans.map((plan, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                      >
                        <div>
                          <span className="font-medium text-pearl">
                            {plan.name}
                          </span>
                          <span className="text-pearl-muted ml-2">
                            ({plan.duration_days} days)
                          </span>
                          {plan.is_popular && (
                            <span className="ml-2 px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <span className="text-xl font-bold text-gold">
                          {formatCurrency(plan.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UPI */}
                <div>
                  <h3 className="text-sm text-pearl-dim uppercase tracking-wider mb-4">
                    Payment
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-gold" />
                    <div>
                      <p className="text-pearl font-medium">
                        UPI ID: {gymData.upi_id}
                      </p>
                      <p className="text-sm text-pearl-muted">
                        Payments go directly to your account
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10 max-w-4xl mx-auto">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
            disabled={step === 1}
            className="flex items-center gap-2 text-pearl-muted hover:text-pearl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < totalSteps ? (
            <Button
              variant="primary"
              onClick={() => setStep((s) => Math.min(totalSteps, s + 1) as 1 | 2 | 3 | 4)}
              disabled={!canProceed()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )
              }
            >
              {isSubmitting ? "Creating..." : "Launch Your Gym"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
