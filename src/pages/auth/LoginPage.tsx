import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  CircleDollarSign,
  Building2,
  LogIn,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { UserRole } from "../../types";
import toast from "react-hot-toast";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("entrepreneur");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  const { login } = useAuth();
  const navigate = useNavigate();

  // OTP Countdown timer
  useEffect(() => {
    let interval: any;
    if (loginStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginStep, resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (loginStep === 1) {
      if (!email || !password) {
        setError("Please enter your email and password");
        return;
      }
      setIsLoading(true);
      // Simulate sending OTP
      setTimeout(() => {
        setIsLoading(false);
        setLoginStep(2);
        setResendTimer(30);
        toast.success(
          "Security Code sent to your device! (Demo OTP is 123456)",
        );
      }, 800);
      return;
    }

    // OTP Verification step
    if (loginStep === 2) {
      if (otpCode !== "123456") {
        setError("Invalid verification code. Please use 123456.");
        return;
      }

      setIsLoading(true);
      try {
        await login(email, password, role);
        // Redirect based on user role
        navigate(
          role === "entrepreneur"
            ? "/dashboard/entrepreneur"
            : "/dashboard/investor",
        );
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    }
  };

  // For demo purposes, pre-filled credentials
  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === "entrepreneur") {
      setEmail("sarah@techwave.io");
      setPassword("password123");
    } else {
      setEmail("michael@vcinnovate.com");
      setPassword("password123");
    }
    setRole(userRole);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center interactive-button">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          Sign in to Business Nexus
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect with investors and entrepreneurs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 rounded-lg">
          {error && (
            <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loginStep === 1 ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I am a
                </label>
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors interactive-button ${
                      role === "entrepreneur"
                        ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setRole("entrepreneur")}
                  >
                    <Building2 size={18} className="mr-2" />
                    Entrepreneur
                  </button>

                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors interactive-button ${
                      role === "investor"
                        ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setRole("investor")}
                  >
                    <CircleDollarSign size={18} className="mr-2" />
                    Investor
                  </button>
                </div>
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                startAdornment={<User size={18} />}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                startAdornment={<Lock size={18} />}
                endAdornmentInteractive={true}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 interactive-button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:text-primary-500 interactive-link"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                leftIcon={<LogIn size={18} />}
                className="interactive-button"
              >
                Sign in
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center border border-primary-100 shadow-inner">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                  We sent a 6-digit confirmation code to{" "}
                  <strong className="text-gray-800">{email}</strong>.
                </p>
              </div>

              <Input
                label="Security OTP Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 123456"
                required
                maxLength={6}
                fullWidth
                startAdornment={<Lock size={18} />}
              />

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={() => {
                    setResendTimer(30);
                    toast.success("Security code sent!");
                  }}
                  className={`font-semibold transition-colors ${
                    resendTimer > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-primary-600 hover:text-primary-500"
                  }`}
                >
                  {resendTimer > 0
                    ? `Resend Code in ${resendTimer}s`
                    : "Resend Code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginStep(1);
                    setError(null);
                  }}
                  className="text-primary-600 hover:text-primary-500 font-semibold"
                >
                  Back to Sign In
                </button>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                leftIcon={<ShieldCheck size={18} />}
                className="interactive-button"
              >
                Verify & Log In
              </Button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => fillDemoCredentials("entrepreneur")}
                leftIcon={<Building2 size={16} />}
                fullWidth
                className="interactive-button"
              >
                Entrepreneur Demo
              </Button>

              <Button
                variant="outline"
                onClick={() => fillDemoCredentials("investor")}
                leftIcon={<CircleDollarSign size={16} />}
                fullWidth
                className="interactive-button"
              >
                Investor Demo
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 interactive-link"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
