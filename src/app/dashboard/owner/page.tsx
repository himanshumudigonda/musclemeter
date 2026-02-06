"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Minus,
  TrendingUp,
  QrCode,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Settings,
  Bell,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/providers";

interface Transaction {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user_name: string;
  plan_name: string;
  transaction_id_utr?: string;
}

interface GymData {
  id: string;
  name: string;
  current_crowd_count: number;
  max_capacity: number;
}

// Crowd Meter Component
function CrowdMeter({
  current,
  max,
  onIncrement,
  onDecrement,
  isUpdating,
}: {
  current: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isUpdating: boolean;
}) {
  const percentage = Math.round((current / max) * 100);
  const status =
    percentage >= 80 ? "busy" : percentage >= 50 ? "moderate" : "quiet";
  const statusColors = {
    busy: "text-status-danger",
    moderate: "text-status-warning",
    quiet: "text-status-success",
  };
  const statusLabels = {
    busy: "Busy",
    moderate: "Moderate",
    quiet: "Quiet",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden"
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 opacity-10 ${
          status === "busy"
            ? "bg-gradient-to-br from-status-danger to-transparent"
            : status === "moderate"
            ? "bg-gradient-to-br from-status-warning to-transparent"
            : "bg-gradient-to-br from-status-success to-transparent"
        }`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gold" />
            <span className="text-pearl-muted font-medium">Live Occupancy</span>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              status === "busy"
                ? "bg-status-danger/20"
                : status === "moderate"
                ? "bg-status-warning/20"
                : "bg-status-success/20"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                status === "busy"
                  ? "bg-status-danger"
                  : status === "moderate"
                  ? "bg-status-warning"
                  : "bg-status-success"
              }`}
            />
            <span className={`text-sm font-medium ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>
        </div>

        {/* Main Count */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Decrement */}
          <motion.button
            onClick={onDecrement}
            disabled={current <= 0 || isUpdating}
            className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-pearl hover:bg-white/10 hover:border-gold/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Minus className="w-6 h-6" />
          </motion.button>

          {/* Count Display */}
          <div className="text-center">
            <motion.div
              key={current}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              {isUpdating && (
                <Loader2 className="absolute -top-2 -right-2 w-5 h-5 text-gold animate-spin" />
              )}
              <span className="text-8xl md:text-9xl font-serif text-pearl tabular-nums">
                {current}
              </span>
            </motion.div>
            <p className="text-pearl-muted mt-2">
              of {max} capacity ({percentage}%)
            </p>
          </div>

          {/* Increment */}
          <motion.button
            onClick={onIncrement}
            disabled={current >= max || isUpdating}
            className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/20 hover:border-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              status === "busy"
                ? "bg-status-danger"
                : status === "moderate"
                ? "bg-status-warning"
                : "bg-status-success"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Transaction Item Component
function TransactionItem({ transaction }: { transaction: Transaction }) {
  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-status-warning" />,
    approved: <CheckCircle className="w-4 h-4 text-status-success" />,
    rejected: <XCircle className="w-4 h-4 text-status-danger" />,
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
          {statusIcons[transaction.status]}
        </div>
        <div>
          <p className="font-medium text-pearl">{transaction.user_name}</p>
          <p className="text-sm text-pearl-muted">
            {transaction.plan_name} • {formatTime(transaction.created_at)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-serif text-xl text-gold">₹{transaction.amount}</p>
        {transaction.transaction_id_utr && (
          <p className="text-xs text-pearl-dim font-mono">
            {transaction.transaction_id_utr.slice(0, 12)}...
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Main Dashboard Component
export default function OwnerDashboard() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [gym, setGym] = useState<GymData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Demo data
  const demoGym: GymData = {
    id: "demo-gym",
    name: "Iron Paradise",
    current_crowd_count: 23,
    max_capacity: 50,
  };

  const demoTransactions: Transaction[] = [
    {
      id: "1",
      amount: 299,
      status: "approved",
      created_at: new Date().toISOString(),
      user_name: "Rahul Sharma",
      plan_name: "Day Pass",
      transaction_id_utr: "UPI123456789",
    },
    {
      id: "2",
      amount: 1999,
      status: "pending",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user_name: "Priya Patel",
      plan_name: "Month Pass",
    },
    {
      id: "3",
      amount: 499,
      status: "approved",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      user_name: "Amit Kumar",
      plan_name: "Week Pass",
      transaction_id_utr: "UPI987654321",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured || !user) {
        // Demo mode
        setGym(demoGym);
        setTransactions(demoTransactions);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch owner's gym
        const { data: gymData, error: gymError } = await supabase
          .from("gyms")
          .select("*")
          .eq("owner_id", user.id)
          .single();

        if (gymError) {
          if (gymError.code === "PGRST116") {
            // No gym found - redirect to create
            router.push("/dashboard/owner/create");
            return;
          }
          throw gymError;
        }

        setGym(gymData as GymData);

        // Fetch recent bookings
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select(`
            id,
            amount,
            status,
            created_at,
            transaction_id_utr,
            profiles!bookings_user_id_fkey(full_name),
            plans!bookings_plan_id_fkey(name)
          `)
          .eq("gym_id", (gymData as GymData).id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (bookingsData) {
          setTransactions(
            (bookingsData as unknown[]).map((b: unknown) => {
              const booking = b as {
                id: string;
                amount: number;
                status: "pending" | "approved" | "rejected";
                created_at: string;
                transaction_id_utr?: string;
                profiles: { full_name: string };
                plans: { name: string };
              };
              return {
                id: booking.id,
                amount: booking.amount,
                status: booking.status,
                created_at: booking.created_at,
                transaction_id_utr: booking.transaction_id_utr,
                user_name: booking.profiles?.full_name || "Unknown",
                plan_name: booking.plans?.name || "Unknown Plan",
              };
            })
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime updates
    if (isSupabaseConfigured && user) {
      const channel = supabase
        .channel("gym-updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "gyms" },
          (payload) => {
            if (payload.new && (payload.new as GymData).id === gym?.id) {
              setGym(payload.new as GymData);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, router]);

  const updateCrowdCount = async (delta: number) => {
    if (!gym) return;

    const newCount = Math.max(0, Math.min(gym.max_capacity, gym.current_crowd_count + delta));
    if (newCount === gym.current_crowd_count) return;

    setIsUpdating(true);

    // Optimistic update
    setGym({ ...gym, current_crowd_count: newCount });

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("gyms")
          .update({ current_crowd_count: newCount } as never)
          .eq("id", gym.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating crowd count:", error);
        // Revert on error
        setGym({ ...gym, current_crowd_count: gym.current_crowd_count });
      }
    }

    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-pearl-muted mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-pearl mb-2">No Gym Found</h1>
          <p className="text-pearl-muted mb-6">Create your gym to get started</p>
          <Link
            href="/dashboard/owner/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-void rounded-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Gym
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Background effects */}
      <div className="fixed inset-0 noise-overlay opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-serif text-pearl"
            >
              {gym.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-pearl-muted"
            >
              Command Center
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl bg-white/5 text-pearl-muted hover:text-pearl hover:bg-white/10 transition-all"
            >
              <Bell className="w-5 h-5" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-xl bg-white/5 text-pearl-muted hover:text-pearl hover:bg-white/10 transition-all"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => signOut()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-3 rounded-xl bg-white/5 text-pearl-muted hover:text-status-danger hover:bg-status-danger/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Crowd Meter */}
          <div className="lg:col-span-2 space-y-8">
            <CrowdMeter
              current={gym.current_crowd_count}
              max={gym.max_capacity}
              onIncrement={() => updateCrowdCount(1)}
              onDecrement={() => updateCrowdCount(-1)}
              isUpdating={isUpdating}
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setShowScanner(true)}
                className="p-6 rounded-2xl bg-gold/10 border border-gold/30 hover:bg-gold/20 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <QrCode className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-pearl">Scan QR</p>
                <p className="text-sm text-pearl-muted">Check-in members</p>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/5 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-8 h-8 text-pearl-muted mb-3 group-hover:rotate-180 transition-transform duration-500" />
                <p className="font-medium text-pearl">Reset Count</p>
                <p className="text-sm text-pearl-muted">New day cleanup</p>
              </motion.button>
            </div>
          </div>

          {/* Sidebar - Transactions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-pearl">Revenue Stream</h2>
              <Link
                href="/dashboard/owner/transactions"
                className="text-sm text-gold hover:text-gold-400 flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Today's Stats */}
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
              <div className="flex items-center gap-2 text-gold mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Today</span>
              </div>
              <p className="text-3xl font-serif text-pearl">
                ₹{transactions.filter((t) => t.status === "approved").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-pearl-muted">
                {transactions.filter((t) => t.status === "approved").length} transactions
              </p>
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <TransactionItem transaction={transaction} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-pearl-muted">No transactions yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setShowScanner(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-void border border-white/10 rounded-3xl p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <QrCode className="w-16 h-16 text-gold mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-pearl mb-2">QR Scanner</h3>
              <p className="text-pearl-muted mb-6">
                Camera access required to scan member QR codes
              </p>
              <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center">
                <p className="text-pearl-dim">Camera feed will appear here</p>
              </div>
              <button
                onClick={() => setShowScanner(false)}
                className="mt-6 px-6 py-3 text-pearl-muted hover:text-pearl transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
