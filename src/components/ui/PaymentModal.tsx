"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { X, Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn, generateUPILink, validateUTR, formatCurrency } from "@/lib/utils";
import { Plan, Gym } from "@/types/database";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  gym: Gym | null;
  onPaymentSubmit: (utr: string) => Promise<void>;
}

type PaymentStep = "qr" | "utr" | "processing" | "success" | "error";

export function PaymentModal({
  isOpen,
  onClose,
  plan,
  gym,
  onPaymentSubmit,
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>("qr");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Generate UPI link and QR code
  const generateQR = useCallback(async () => {
    if (!gym || !plan) return;

    const upiLink = generateUPILink(
      gym.upi_id,
      gym.name,
      plan.price,
      `${plan.name} - ${gym.name}`
    );

    try {
      const dataUrl = await QRCode.toDataURL(upiLink, {
        width: 280,
        margin: 2,
        color: {
          dark: "#FFFFFF",
          light: "#050505",
        },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  }, [gym, plan]);

  useEffect(() => {
    if (isOpen && gym && plan) {
      generateQR();
      setStep("qr");
      setUtr("");
      setUtrError("");
    }
  }, [isOpen, gym, plan, generateQR]);

  const handleCopyUPI = async () => {
    if (!gym) return;
    await navigator.clipboard.writeText(gym.upi_id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUTRSubmit = async () => {
    // Validate UTR
    if (!utr.trim()) {
      setUtrError("Please enter the UTR/Transaction ID");
      return;
    }

    if (!validateUTR(utr)) {
      setUtrError("Invalid UTR format. Please check and try again.");
      return;
    }

    setUtrError("");
    setIsSubmitting(true);
    setStep("processing");

    try {
      await onPaymentSubmit(utr);
      setStep("success");
    } catch (error) {
      console.error("Payment submission error:", error);
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("qr");
    setUtr("");
    setUtrError("");
    onClose();
  };

  if (!isOpen || !gym || !plan) return null;

  const upiLink = generateUPILink(
    gym.upi_id,
    gym.name,
    plan.price,
    `${plan.name} - ${gym.name}`
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md glass-card overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-gold" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-pearl-muted hover:text-pearl transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: QR Code */}
                  {step === "qr" && (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-center"
                    >
                      {/* Header */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-serif text-pearl mb-2">
                          Complete <span className="text-gold italic">Payment</span>
                        </h3>
                        <p className="text-pearl-muted text-sm">
                          Scan the QR code with any UPI app to pay
                        </p>
                      </div>

                      {/* Plan Info */}
                      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-pearl-muted text-sm">Plan</span>
                          <span className="text-pearl font-medium">{plan.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-pearl-muted text-sm">Duration</span>
                          <span className="text-pearl font-medium">{plan.duration_days} days</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                          <span className="text-pearl-muted text-sm">Amount</span>
                          <span className="text-2xl font-bold text-gold">
                            {formatCurrency(plan.price)}
                          </span>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-center mb-6">
                        <div className="relative p-4 bg-void rounded-2xl border border-gold/30">
                          {qrDataUrl ? (
                            <img
                              src={qrDataUrl}
                              alt="UPI QR Code"
                              className="w-56 h-56"
                            />
                          ) : (
                            <div className="w-56 h-56 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-gold animate-spin" />
                            </div>
                          )}
                          {/* Corner decorations */}
                          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-gold" />
                          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-gold" />
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-gold" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-gold" />
                        </div>
                      </div>

                      {/* UPI ID */}
                      <div className="mb-6">
                        <p className="text-xs text-pearl-muted mb-2">Or pay directly to UPI ID</p>
                        <div className="flex items-center justify-center gap-2">
                          <code className="px-3 py-2 bg-white/5 rounded-lg text-pearl text-sm font-mono">
                            {gym.upi_id}
                          </code>
                          <button
                            onClick={handleCopyUPI}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {isCopied ? (
                              <CheckCircle className="w-4 h-4 text-status-success" />
                            ) : (
                              <Copy className="w-4 h-4 text-pearl-muted" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Open in App Button */}
                      <a
                        href={upiLink}
                        className="block w-full py-3 bg-gradient-gold text-void font-semibold rounded-xl hover:opacity-90 transition-opacity mb-4"
                      >
                        Open in UPI App
                      </a>

                      {/* Next Button */}
                      <button
                        onClick={() => setStep("utr")}
                        className="w-full py-3 border border-white/20 text-pearl rounded-xl hover:bg-white/5 transition-colors"
                      >
                        I&apos;ve Completed Payment →
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: UTR Input */}
                  {step === "utr" && (
                    <motion.div
                      key="utr"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {/* Header */}
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-serif text-pearl mb-2">
                          Enter <span className="text-gold italic">UTR Number</span>
                        </h3>
                        <p className="text-pearl-muted text-sm">
                          Find the UTR/Transaction ID in your payment confirmation SMS or app
                        </p>
                      </div>

                      {/* UTR Input */}
                      <div className="mb-6">
                        <label className="block text-sm text-pearl-muted mb-2">
                          UTR / Transaction Reference Number
                        </label>
                        <input
                          type="text"
                          value={utr}
                          onChange={(e) => {
                            setUtr(e.target.value.toUpperCase());
                            setUtrError("");
                          }}
                          placeholder="e.g., 123456789012"
                          className={cn(
                            "input-luxury",
                            utrError && "border-status-danger focus:border-status-danger"
                          )}
                          maxLength={22}
                        />
                        {utrError && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-status-danger flex items-center gap-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {utrError}
                          </motion.p>
                        )}
                      </div>

                      {/* Help Text */}
                      <div className="mb-6 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                        <p className="text-xs text-pearl-muted leading-relaxed">
                          <strong className="text-gold">Where to find UTR?</strong>
                          <br />
                          Check your bank SMS, UPI app transaction history, or payment confirmation screen.
                          The UTR is usually a 12-22 character alphanumeric code.
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep("qr")}
                          className="flex-1 py-3 border border-white/20 text-pearl rounded-xl hover:bg-white/5 transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={handleUTRSubmit}
                          disabled={isSubmitting}
                          className="flex-1 py-3 bg-gradient-gold text-void font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          ) : (
                            "Verify Payment"
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Processing */}
                  {step === "processing" && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-6 border-4 border-gold/30 border-t-gold rounded-full"
                      />
                      <h3 className="text-xl font-serif text-pearl mb-2">
                        Verifying Payment
                      </h3>
                      <p className="text-pearl-muted text-sm">
                        Please wait while we submit your payment for verification...
                      </p>
                    </motion.div>
                  )}

                  {/* Step 4: Success */}
                  {step === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-status-success/20 flex items-center justify-center"
                      >
                        <CheckCircle className="w-10 h-10 text-status-success" />
                      </motion.div>
                      <h3 className="text-2xl font-serif text-pearl mb-2">
                        Payment <span className="text-gold italic">Submitted!</span>
                      </h3>
                      <p className="text-pearl-muted text-sm mb-6">
                        The gym owner will verify your payment shortly. You&apos;ll receive your access pass once approved.
                      </p>
                      <button
                        onClick={handleClose}
                        className="w-full py-3 bg-gradient-gold text-void font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Done
                      </button>
                    </motion.div>
                  )}

                  {/* Step 5: Error */}
                  {step === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-status-danger/20 flex items-center justify-center"
                      >
                        <AlertCircle className="w-10 h-10 text-status-danger" />
                      </motion.div>
                      <h3 className="text-2xl font-serif text-pearl mb-2">
                        Something went <span className="text-status-danger">wrong</span>
                      </h3>
                      <p className="text-pearl-muted text-sm mb-6">
                        There was an error submitting your payment. Please try again or contact support.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep("utr")}
                          className="flex-1 py-3 border border-white/20 text-pearl rounded-xl hover:bg-white/5 transition-colors"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={handleClose}
                          className="flex-1 py-3 bg-white/10 text-pearl rounded-xl hover:bg-white/20 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PaymentModal;
