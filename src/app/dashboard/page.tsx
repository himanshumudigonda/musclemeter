"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Calendar,
  Activity,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import { supabase, subscribeToBookings } from "@/lib/supabase";
import { Gym, Booking, Plan, Profile } from "@/types/database";
import { cn, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui";
import { CrowdMeter } from "@/components/ui/CrowdMeter";
import Link from "next/link";

// Types for extended booking with relations
interface BookingWithRelations extends Booking {
  plan: Plan;
  user: Profile;
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "gold",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  color?: "gold" | "green" | "blue" | "red";
}) {
  const colorStyles = {
    gold: "from-gold/20 to-gold/5 border-gold/30",
    green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    red: "from-red-500/20 to-red-500/5 border-red-500/30",
  };

  const iconColors = {
    gold: "text-gold",
    green: "text-emerald-500",
    blue: "text-blue-500",
    red: "text-red-500",
  };

  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-2xl border bg-gradient-to-br",
        colorStyles[color]
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl bg-white/5", iconColors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm",
              trend.isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            <TrendingUp
              className={cn("w-4 h-4", !trend.isPositive && "rotate-180")}
            />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-pearl mb-1">{value}</h3>
      <p className="text-sm text-pearl-muted">{title}</p>
      {subtitle && <p className="text-xs text-pearl-dim mt-1">{subtitle}</p>}
    </motion.div>
  );
}

// Crowd Control Component
function CrowdControl({
  gym,
  onUpdate,
}: {
  gym: Gym;
  onUpdate: (count: number) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localCount, setLocalCount] = useState(gym.current_crowd_count);

  useEffect(() => {
    setLocalCount(gym.current_crowd_count);
  }, [gym.current_crowd_count]);

  const handleIncrement = async () => {
    if (localCount >= gym.max_capacity) return;
    setIsUpdating(true);
    const newCount = localCount + 1;
    setLocalCount(newCount);
    await onUpdate(newCount);
    setIsUpdating(false);
  };

  const handleDecrement = async () => {
    if (localCount <= 0) return;
    setIsUpdating(true);
    const newCount = localCount - 1;
    setLocalCount(newCount);
    await onUpdate(newCount);
    setIsUpdating(false);
  };

  return (
    <motion.div
      className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-pearl">Live Crowd Meter</h3>
          <p className="text-sm text-pearl-muted">
            Update as people enter/exit
          </p>
        </div>
        <motion.div
          className={cn(
            "w-3 h-3 rounded-full",
            isUpdating ? "bg-amber-500" : "bg-emerald-500"
          )}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Crowd Meter Display */}
      <div className="mb-8">
        <CrowdMeter
          currentCount={localCount}
          maxCapacity={gym.max_capacity}
          size="lg"
        />
      </div>

      {/* Counter Display */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <motion.button
          onClick={handleDecrement}
          disabled={localCount <= 0 || isUpdating}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold",
            "bg-red-500/20 text-red-500 border-2 border-red-500/30",
            "disabled:opacity-30 disabled:cursor-not-allowed",
            "hover:bg-red-500/30 transition-colors"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Minus className="w-6 h-6" />
        </motion.button>

        <div className="text-center">
          <motion.span
            key={localCount}
            className="block text-6xl font-bold text-pearl"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {localCount}
          </motion.span>
          <span className="text-pearl-muted text-sm">
            of {gym.max_capacity} capacity
          </span>
        </div>

        <motion.button
          onClick={handleIncrement}
          disabled={localCount >= gym.max_capacity || isUpdating}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold",
            "bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/30",
            "disabled:opacity-30 disabled:cursor-not-allowed",
            "hover:bg-emerald-500/30 transition-colors"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        {[5, 10, "Reset"].map((action) => (
          <button
            key={action}
            onClick={async () => {
              if (action === "Reset") {
                setLocalCount(0);
                await onUpdate(0);
              } else {
                const newCount = Math.min(
                  localCount + (action as number),
                  gym.max_capacity
                );
                setLocalCount(newCount);
                await onUpdate(newCount);
              }
            }}
            className="py-2 text-sm text-pearl-muted bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {action === "Reset" ? action : `+${action}`}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// Booking Card Component
function BookingCard({
  booking,
  onApprove,
  onReject,
}: {
  booking: BookingWithRelations;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setIsProcessing(true);
    if (action === "approve") {
      await onApprove(booking.id);
    } else {
      await onReject(booking.id);
    }
    setIsProcessing(false);
  };

  const statusColors = {
    pending: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    approved: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    rejected: "text-red-500 bg-red-500/10 border-red-500/30",
    expired: "text-pearl-dim bg-white/5 border-white/10",
  };

  const statusIcons = {
    pending: AlertCircle,
    approved: CheckCircle,
    rejected: XCircle,
    expired: Clock,
  };

  const StatusIcon = statusIcons[booking.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-void font-bold">
            {booking.user?.full_name?.charAt(0) || "A"}
          </div>
          <div>
            <h4 className="font-medium text-pearl">
              {booking.user?.full_name || "Anonymous User"}
            </h4>
            <p className="text-xs text-pearl-muted">{booking.plan?.name}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
            statusColors[booking.status]
          )}
        >
          <StatusIcon className="w-3 h-3" />
          <span className="capitalize">{booking.status}</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-pearl-dim block text-xs mb-1">Amount</span>
          <span className="text-gold font-semibold">
            {formatCurrency(booking.amount)}
          </span>
        </div>
        <div>
          <span className="text-pearl-dim block text-xs mb-1">UTR</span>
          <span className="text-pearl font-mono text-xs">
            {booking.transaction_id_utr || "—"}
          </span>
        </div>
        <div>
          <span className="text-pearl-dim block text-xs mb-1">Date</span>
          <span className="text-pearl-muted">
            {formatDate(booking.created_at)}
          </span>
        </div>
        <div>
          <span className="text-pearl-dim block text-xs mb-1">Time</span>
          <span className="text-pearl-muted">
            {formatTime(booking.created_at)}
          </span>
        </div>
      </div>

      {/* Actions for pending bookings */}
      {booking.status === "pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleAction("reject")}
            disabled={isProcessing}
            className="flex-1"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAction("approve")}
            disabled={isProcessing}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// Main Dashboard Component
export default function OwnerDashboard() {
  const { user, profile, signOut } = useAuth();
  const [gym, setGym] = useState<Gym | null>(null);
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">(
    "pending"
  );
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingBookings: 0,
    todayVisitors: 0,
    activeMembers: 0,
  });

  // Fetch gym data
  const fetchGymData = useCallback(async () => {
    if (!user) return;

    const { data: gymResult, error: gymError } = await supabase
      .from("gyms")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (gymError || !gymResult) {
      console.error("Error fetching gym:", gymError);
      return;
    }

    const gymData = gymResult as Gym;
    setGym(gymData);

    // Fetch bookings for this gym
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        plan:plans(*),
        user:profiles(*)
      `
      )
      .eq("gym_id", gymData.id)
      .order("created_at", { ascending: false });

    if (bookingsError || !bookingsData) {
      console.error("Error fetching bookings:", bookingsError);
      setIsLoading(false);
      return;
    }

    const typedBookings = bookingsData as BookingWithRelations[];
    setBookings(typedBookings);

    // Calculate stats
    const approved = typedBookings.filter((b) => b.status === "approved");
    const pending = typedBookings.filter((b) => b.status === "pending");
    const totalRevenue = approved.reduce((sum, b) => sum + (b.amount || 0), 0);

    setStats({
      totalRevenue,
      pendingBookings: pending.length,
      todayVisitors: gymData.current_crowd_count || 0,
      activeMembers: approved.length,
    });

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGymData();
  }, [fetchGymData]);

  // Real-time subscription
  useEffect(() => {
    if (!gym) return;

    const channel = subscribeToBookings(gym.id, (payload) => {
      console.log("Real-time update:", payload);
      fetchGymData(); // Refresh data on changes
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gym, fetchGymData]);

  // Update crowd count
  const updateCrowdCount = async (count: number) => {
    if (!gym) return;

    const { error } = await supabase
      .from("gyms")
      .update({ current_crowd_count: count, updated_at: new Date().toISOString() } as never)
      .eq("id", gym.id);

    if (error) {
      console.error("Error updating crowd count:", error);
    } else {
      setGym({ ...gym, current_crowd_count: count });
    }
  };

  // Approve booking
  const approveBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || !booking.plan) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + booking.plan.duration_days);

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "approved",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", bookingId);

    if (error) {
      console.error("Error approving booking:", error);
    } else {
      fetchGymData();
    }
  };

  // Reject booking
  const rejectBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", bookingId);

    if (error) {
      console.error("Error rejecting booking:", error);
    } else {
      fetchGymData();
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-pearl mb-4">
            No Gym Found
          </h2>
          <p className="text-pearl-muted mb-6">
            You haven&apos;t set up your gym yet.
          </p>
          <Link href="/dashboard/setup">
            <Button variant="primary">Set Up Your Gym</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-void/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="group">
              <h1 className="text-xl font-serif">
                <span className="text-pearl">Muscle</span>
                <span className="text-gold italic">Meter</span>
              </h1>
            </Link>
            <ChevronRight className="w-4 h-4 text-pearl-dim" />
            <span className="text-pearl-muted">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <motion.button
              className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-pearl-muted" />
              {stats.pendingBookings > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-void text-xs font-bold rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {stats.pendingBookings}
                </motion.span>
              )}
            </motion.button>

            {/* Settings */}
            <Link href="/dashboard/settings">
              <motion.button
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5 text-pearl-muted" />
              </motion.button>
            </Link>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-medium text-pearl">
                  {profile?.full_name || "Owner"}
                </p>
                <p className="text-xs text-pearl-muted">{gym.name}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-lg hover:bg-red-500/10 text-pearl-muted hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-serif text-pearl mb-2">
            Welcome back, <span className="text-gold italic">{profile?.full_name?.split(" ")[0]}</span>
          </h2>
          <p className="text-pearl-muted">
            Here&apos;s what&apos;s happening at {gym.name} today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            trend={{ value: 12, isPositive: true }}
            color="gold"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingBookings}
            subtitle="Needs your attention"
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Today's Visitors"
            value={stats.todayVisitors}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
            color="green"
          />
          <StatCard
            title="Active Members"
            value={stats.activeMembers}
            icon={Activity}
            color="gold"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crowd Control (Left) */}
          <div className="lg:col-span-1">
            <CrowdControl gym={gym} onUpdate={updateCrowdCount} />
          </div>

          {/* Bookings (Right) */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
              {/* Tabs */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-pearl">
                  Recent Bookings
                </h3>
                <div className="flex gap-2">
                  {(["pending", "approved", "all"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-4 py-2 text-sm rounded-lg transition-colors",
                        activeTab === tab
                          ? "bg-gold text-void font-medium"
                          : "bg-white/5 text-pearl-muted hover:bg-white/10"
                      )}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {tab === "pending" && stats.pendingBookings > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-void/30 rounded text-xs">
                          {stats.pendingBookings}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {filteredBookings.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Calendar className="w-12 h-12 text-pearl-dim mx-auto mb-4" />
                      <p className="text-pearl-muted">No bookings found</p>
                    </motion.div>
                  ) : (
                    filteredBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onApprove={approveBooking}
                        onReject={rejectBooking}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
