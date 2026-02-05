"use client";

import { motion } from "framer-motion";
import { MapPin, Star, Clock, Users } from "lucide-react";
import { Gym, Plan } from "@/types/database";
import { cn, formatCurrency } from "@/lib/utils";
import { CrowdMeterCompact } from "./CrowdMeter";

interface GymCardProps {
  gym: Gym & { plans?: Plan[] };
  onClick?: () => void;
  className?: string;
  layoutId?: string;
}

export function GymCard({ gym, onClick, className, layoutId }: GymCardProps) {
  const lowestPrice = gym.plans?.reduce(
    (min, plan) => (plan.price < min ? plan.price : min),
    gym.plans[0]?.price || 0
  );

  return (
    <motion.article
      layoutId={layoutId}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-void-100 border border-white/5 cursor-pointer",
        "hover:border-gold/30 transition-colors duration-500",
        className
      )}
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        <motion.img
          src={gym.photos[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"}
          alt={gym.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <CrowdMeterCompact
            currentCount={gym.current_crowd_count}
            maxCapacity={gym.max_capacity}
          />
          
          {/* Rating */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-void/60 backdrop-blur-sm rounded-full">
            <Star className="w-3.5 h-3.5 text-gold fill-gold" />
            <span className="text-xs font-medium text-pearl">4.9</span>
          </div>
        </div>

        {/* Price Tag */}
        {lowestPrice && (
          <div className="absolute bottom-4 right-4">
            <div className="px-3 py-1.5 bg-gold text-void text-sm font-bold rounded-lg">
              From {formatCurrency(lowestPrice)}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Location */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pearl mb-1 group-hover:text-gold transition-colors">
            {gym.name}
          </h3>
          <div className="flex items-center gap-1.5 text-pearl-muted">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm truncate">{gym.address}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {gym.amenities.slice(0, 3).map((amenity, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-white/5 rounded-full text-xs text-pearl-muted"
            >
              {amenity}
            </span>
          ))}
          {gym.amenities.length > 3 && (
            <span className="px-2.5 py-1 text-xs text-pearl-dim">
              +{gym.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-1 text-pearl-muted">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">Open Now</span>
          </div>
          <div className="flex items-center gap-1 text-pearl-muted">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs">
              {gym.current_crowd_count}/{gym.max_capacity} people
            </span>
          </div>
        </div>
      </div>

      {/* Hover Border Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(201,169,98,0.1) 0%, transparent 50%, rgba(201,169,98,0.1) 100%)",
        }}
      />
    </motion.article>
  );
}

// Featured Gym Card (larger variant)
export function FeaturedGymCard({ gym, onClick, className }: GymCardProps) {
  return (
    <motion.article
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-void-100 border border-white/5 cursor-pointer",
        "hover:border-gold/30 transition-all duration-500",
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          src={gym.photos[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"}
          alt={gym.name}
          className="w-full h-full object-cover opacity-40"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end min-h-[400px]">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/20 border border-gold/40 rounded-full w-fit mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Star className="w-3.5 h-3.5 text-gold fill-gold" />
          <span className="text-xs font-medium text-gold">Featured Space</span>
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-serif text-pearl mb-3">
          {gym.name}
        </h2>

        {/* Description */}
        <p className="text-pearl-muted text-lg mb-6 max-w-xl">
          {gym.description || "Premium fitness facility with world-class equipment and amenities."}
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold" />
            <span className="text-sm text-pearl">{gym.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gold" />
            <span className="text-sm text-pearl">
              {gym.current_crowd_count}/{gym.max_capacity} now
            </span>
          </div>
          <CrowdMeterCompact
            currentCount={gym.current_crowd_count}
            maxCapacity={gym.max_capacity}
          />
        </div>
      </div>

      {/* Corner Accent */}
      <div className="absolute top-8 right-8 w-20 h-20 border border-gold/20 rounded-full" />
      <div className="absolute top-12 right-12 w-12 h-12 border border-gold/30 rounded-full" />
    </motion.article>
  );
}

export default GymCard;
