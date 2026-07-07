"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Mail,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

const isValidPassword = (pw: string) => {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
};

const AuthPage = () => {
  const { data: session, isPending } = authClient.useSession();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending || session) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setOtp("");
    setShowOTP(false);
  };

  const handleSocialAuth = async (provider: "google") => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        if (!showOTP) {
          const { error } = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "forget-password",
          });
          if (error) throw error;
          setShowOTP(true);
          toast.success("Reset OTP sent to your email!");
          return;
        }

        if (otp.length !== 6) {
          toast.error("Please enter the 6-digit OTP");
          setIsLoading(false);
          return;
        }

        const { error } = await authClient.emailOtp.resetPassword({
          email,
          otp,
          password,
        });

        if (error) throw error;

        toast.success("Password reset successful! Please sign in.");
        resetForm();
        setIsForgotPassword(false);
        setIsLogin(true);
        return;
      }

      if (isLogin) {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/");
      } else {
        if (!isValidPassword(password)) {
          toast.error(
            "Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.",
          );
          setIsLoading(false);
          return;
        }

        if (!showOTP) {
          const { error } = await authClient.signUp.email({
            email,
            password,
            name: name || email.split("@")[0],
          });

          if (error) {
            toast.error(error.message || "Failed to create account");
            setIsLoading(false);
            return;
          }

          setShowOTP(true);
          toast.success("OTP sent to your email!");
          setIsLoading(false);
          return;
        }

        if (otp.length !== 6) {
          toast.error("Please enter a valid 6-digit OTP");
          setIsLoading(false);
          return;
        }

        const { error: verifyError } = await authClient.emailOtp.verifyEmail({
          email,
          otp,
        });

        if (verifyError) {
          toast.error(verifyError.message || "Invalid or expired OTP");
          setIsLoading(false);
          return;
        }

        // Automatically sign in the user after verification
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });

        if (signInError) {
          toast.error(
            "Verified, but failed to sign in automatically. Please log in manually.",
          );
          setIsLogin(true);
          setShowOTP(false);
          return;
        }

        toast.success("Account created and verified! Welcome to upharVilla.");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      setIsLoading(false);
    } catch (_error: any) {
      toast.error("Failed to logout");
      setIsLoading(false);
    }
  };

  const isFormValid = isForgotPassword
    ? showOTP
      ? otp.length === 6 && isValidPassword(password)
      : email.trim().length > 0
    : isLogin
      ? email.trim().length > 0 && password.trim().length > 0
      : showOTP
        ? otp.length === 6
        : name.trim().length > 0 &&
          email.trim().length > 0 &&
          isValidPassword(password);

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Pane: Cinematic Brand Image (Desktop Only) */}
      <div className="hidden md:block relative md:w-[56%] lg:w-[62%] h-full overflow-hidden">
        <div className="absolute inset-0 animate-custom-zoom">
          <Image
            src="/auth-background.webp"
            alt="upharVilla Luxury"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Cinematic subtle overlay */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Right Pane: Authentication Control Panel */}
      <div className="flex-1 h-full bg-gradient-to-b from-[#fcfcff] to-white flex flex-col justify-between p-4 md:p-6 lg:p-8 relative overflow-y-auto md:overflow-hidden">
        {/* Top Header Row */}
        <header className="flex justify-between items-center w-full z-20 pb-2 md:pb-0">
          <button
            type="button"
            onClick={() => {
              // Check if history has pages to go back to, otherwise fallback to home
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 text-xs font-semibold shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Go Back</span>
          </button>

          <div className="flex items-center gap-2.5 ml-auto">
            {session && (
              <Button
                variant="outline"
                className="h-9! px-4! rounded-full border-zinc-200 hover:bg-zinc-50 flex items-center gap-1.5 text-xs font-semibold hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                Logout
              </Button>
            )}
          </div>
        </header>

        {/* Center Content: Auth Card */}
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[400px] md:max-w-[440px] mx-auto py-2">
          <div className="w-full">
            {/* Static brand logo centered above form */}
            <div
              className="cursor-pointer flex items-center justify-center transition-all duration-300 active:scale-95 hover:opacity-90 hover:scale-[1.02] mb-2"
              onClick={() => router.push("/")}
            >
              <Image
                src="/logo.png"
                alt="upharVilla Logo"
                width={993}
                height={294}
                sizes="185px"
                className="w-[170px] sm:w-[185px] h-auto object-contain"
                priority
              />
            </div>

            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-transparent border-none shadow-none p-0 flex flex-col justify-center w-full"
            >
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 shadow-inner">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                      Check your email
                    </h2>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      We've sent a{" "}
                      {isForgotPassword ? "password reset link" : "secure link"}{" "}
                      to{" "}
                      <span className="font-bold text-zinc-900">{email}</span>
                      .<br />
                      Please check your inbox or spam folder to complete.
                    </p>
                  </div>
                  <div className="w-full p-4 bg-zinc-50 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-zinc-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Verification successful
                  </div>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsSuccess(false);
                      setIsForgotPassword(false);
                    }}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                  >
                    {isForgotPassword
                      ? "Back to Login"
                      : "Try a different email"}
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      isForgotPassword
                        ? showOTP
                          ? "forgot-otp"
                          : "forgot-email"
                        : isLogin
                          ? "login"
                          : "signup"
                    }
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5 md:space-y-4"
                  >
                    <div className="flex flex-col items-center text-center space-y-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 tracking-tight font-serif">
                        {isForgotPassword
                          ? "Reset Password"
                          : isLogin
                            ? "Welcome Back"
                            : "Create Account"}
                      </h2>
                      <p className="text-xs font-medium text-muted-foreground leading-normal max-w-[280px]">
                        {isForgotPassword
                          ? showOTP
                            ? "Enter the code and your new password"
                            : "Enter your email to receive a reset code"
                          : isLogin
                            ? "Sign in to your account with your email"
                            : "Join upharVilla for custom gifting experiences"}
                      </p>
                    </div>

                    <form
                      onSubmit={handleEmailAuth}
                      className="space-y-2 md:space-y-2.5"
                    >
                      {(!isLogin && showOTP) ||
                      (isForgotPassword && showOTP) ? (
                        <div className="flex flex-col items-center justify-center space-y-3 py-1">
                          <p className="text-xs text-zinc-500 text-center leading-relaxed">
                            Please enter the 6-digit code sent to <br />
                            <span className="font-semibold text-zinc-955">
                              {email}
                            </span>
                          </p>
                          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={0}
                                className="w-10 h-10 md:h-12 text-lg rounded-l-xl"
                              />
                              <InputOTPSlot
                                index={1}
                                className="w-10 h-10 md:h-12 text-lg"
                              />
                              <InputOTPSlot
                                index={2}
                                className="w-10 h-10 md:h-12 text-lg rounded-r-xl"
                              />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={3}
                                className="w-10 h-10 md:h-12 text-lg rounded-l-xl"
                              />
                              <InputOTPSlot
                                index={4}
                                className="w-10 h-10 md:h-12 text-lg"
                              />
                              <InputOTPSlot
                                index={5}
                                className="w-10 h-10 md:h-12 text-lg rounded-r-xl"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                          {isForgotPassword && (
                            <div className="w-full relative mt-2 group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors duration-205" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-10 md:h-12 pl-11 bg-white border-neutral-200/80 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-655 transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {!isLogin && (
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors duration-200" />
                              <Input
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-10 md:h-12 pl-11 bg-white border-neutral-200/80 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all text-sm"
                              />
                            </div>
                          )}
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors duration-200" />
                            <Input
                              type="email"
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-10 md:h-12 pl-11 bg-white border-neutral-200/80 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all text-sm"
                            />
                          </div>
                          {!isForgotPassword && (
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors duration-200" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-10 md:h-12 pl-11 bg-white border-neutral-200/80 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )}

                          {isLogin && !isForgotPassword && (
                            <div className="flex justify-end px-1">
                              <button
                                type="button"
                                onClick={() => {
                                  resetForm();
                                  setIsForgotPassword(true);
                                }}
                                className="text-xs font-semibold text-primary hover:underline transition-colors"
                              >
                                Forgot Password?
                              </button>
                            </div>
                          )}
                          {!isLogin &&
                            password.length > 0 &&
                            !isValidPassword(password) && (
                              <p className="text-[10px] text-red-500 text-left px-1 mt-1 leading-relaxed">
                                Password must be at least 8 characters, with an
                                uppercase, a lowercase, a number, and a special
                                character.
                              </p>
                            )}
                        </>
                      )}

                      <Button
                        type="submit"
                        disabled={
                          isLoading || (!isLogin && showOTP && otp.length !== 6)
                        }
                        className={`w-full h-10 md:h-12 text-white rounded-xl font-semibold transition-all mt-1 flex items-center justify-center gap-2 cursor-pointer duration-200 ${
                          isFormValid
                            ? "bg-primary hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] shadow-md shadow-primary/10"
                            : "bg-primary/50 cursor-not-allowed shadow-none"
                        }`}
                      >
                        {isLoading && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {isForgotPassword
                          ? showOTP
                            ? "Reset Password"
                            : "Send Reset OTP"
                          : !isLogin && showOTP
                            ? "Verify & Create Account"
                            : isLogin
                              ? "Sign In"
                              : "Sign Up"}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                      </Button>
                    </form>

                    <div className="relative py-0.5 md:py-1 flex items-center justify-center">
                      <div className="w-full h-px bg-zinc-200" />
                      <span className="absolute bg-white px-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest rounded-full transition-colors duration-200">
                        Or continue with
                      </span>
                    </div>

                    <div className="grid grid-cols-1">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => handleSocialAuth("google")}
                        className="h-10 md:h-12 border-neutral-200/80 bg-white hover:bg-neutral-50 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] duration-200 w-full text-xs font-semibold text-neutral-600"
                      >
                        <Image
                          src="/google.png"
                          alt="Google"
                          width={18}
                          height={18}
                        />
                        <span>Google</span>
                      </Button>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          if (isForgotPassword) {
                            setIsForgotPassword(false);
                          } else {
                            setIsLogin(!isLogin);
                          }
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-955 transition-colors"
                      >
                        {isForgotPassword ? (
                          <>
                            Remembered your password?{" "}
                            <span className="font-bold text-zinc-955 hover:underline">
                              Sign In
                            </span>
                          </>
                        ) : isLogin ? (
                          <>
                            Don't have an account?{" "}
                            <span className="font-bold text-zinc-955 hover:underline">
                              Sign Up
                            </span>
                          </>
                        ) : (
                          <>
                            Already have an account?{" "}
                            <span className="font-bold text-zinc-955 hover:underline">
                              Sign In
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="w-full text-center text-[10px] text-neutral-400 font-light mt-auto pt-2 pb-1">
          &copy; {new Date().getFullYear()} upharVilla. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
