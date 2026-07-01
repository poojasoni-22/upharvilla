"use client";

import { useMutation } from "convex/react";
import {
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";

export default function ContactPage() {
  const submitEnquiry = useMutation(api.enquiries.submit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitEnquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone ? formData.phone : undefined,
        message: formData.message,
      });
      toast.success("Message sent successfully! We will contact you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#faf9ff]">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-20 flex flex-col lg:flex-row gap-6 md:gap-12 items-stretch">
        {/* Left Column: Contact info — HIDDEN on mobile, visible on lg+ */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary via-[#ad8de9] to-[#c4aaff] rounded-3xl p-8 md:p-12 text-white flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full w-max block">
              Get in Touch
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
              Let&apos;s Create Something Special Together
            </h1>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              Have questions about our custom hampers, personalized engravings,
              or corporate gifting packages? Write to us and our support team
              will reply within 24 hours.
            </p>
          </div>

          <div className="relative z-10 space-y-8 my-10 lg:my-0">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                  Call Us
                </p>
                <p className="text-sm md:text-base font-semibold">
                  +91 81605 72007
                </p>
                <p className="text-[11px] text-white/50">
                  Mon – Sat, 9am – 7pm IST
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                  Email Us
                </p>
                <p className="text-sm md:text-base font-semibold">
                  support@upharvilla.in
                </p>
                <p className="text-[11px] text-white/50">
                  For support & general queries
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                  Visit Us
                </p>
                <p className="text-sm md:text-base font-semibold leading-relaxed">
                  Central Bazzar, Tigra Road,
                  <br />
                  Navsari, Gujarat, India 396445
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/20 pt-6 flex items-center justify-between text-xs text-white/70">
            <span>✨ Premium Gifting Experience</span>
            <span>upharVilla © 2026</span>
          </div>
        </div>

        {/* Right Column: Contact form */}
        <div className="flex-1 bg-white rounded-2xl md:rounded-3xl border border-neutral-100 shadow-lg md:shadow-xl p-5 sm:p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-xl w-full mx-auto space-y-5 md:space-y-6">
            {/* Mobile header */}
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Send a Message
              </h2>
              <p className="text-neutral-500 text-xs sm:text-sm">
                Fill out the form below and we will get back to you shortly.
                Fields marked with <span className="text-rose-500">*</span> are
                required.
              </p>
            </div>

            {/* Mobile-only compact contact info strip */}
            <div className="flex items-center gap-4 text-xs text-neutral-500 lg:hidden flex-wrap">
              <a
                href="tel:+918160572007"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">+91 81605 72007</span>
              </a>
              <a
                href="mailto:support@upharvilla.in"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">support@upharvilla.in</span>
              </a>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">Mon–Sat, 9am–7pm</span>
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="name"
                    className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase tracking-wider"
                  >
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full h-10 sm:h-11 px-3 sm:px-4 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="email"
                    className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase tracking-wider"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full h-10 sm:h-11 px-3 sm:px-4 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="phone"
                  className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase tracking-wider"
                >
                  Phone Number{" "}
                  <span className="text-neutral-455 text-[10px] lowercase italic">
                    (optional)
                  </span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full h-10 sm:h-11 px-3 sm:px-4 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="message"
                  className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase tracking-wider"
                >
                  Your Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can we help you today?"
                  className="w-full p-3 sm:p-4 text-sm bg-neutral-50 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary to-[#c4aaff] hover:from-primary/95 hover:to-[#c4aaff]/95 text-white py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase mt-1 sm:mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
