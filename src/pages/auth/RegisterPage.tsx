import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  CircleDollarSign,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { UserRole } from "../../types";

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("entrepreneur");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password Strength Meter Helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-gray-200" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score, label: "Weak", color: "bg-error-500" };
      case 2:
        return { score, label: "Fair", color: "bg-warning-500" };
      case 3:
        return { score, label: "Good", color: "bg-primary-500" };
      case 4:
        return { score, label: "Strong", color: "bg-success-500" };
      default:
        return { score: 0, label: "", color: "bg-gray-200" };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, role);
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Business Nexus to connect with partners
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                I am registering as a
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
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              startAdornment={<User size={18} />}
            />

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              startAdornment={<Mail size={18} />}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {password && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Password Strength:</span>
                  <span
                    className={`font-bold ${
                      passwordStrength.score <= 1
                        ? "text-error-600"
                        : passwordStrength.score === 2
                          ? "text-warning-600"
                          : passwordStrength.score === 3
                            ? "text-primary-600"
                            : "text-success-600"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 1
                        ? passwordStrength.color
                        : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 2
                        ? passwordStrength.color
                        : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 3
                        ? passwordStrength.color
                        : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 4
                        ? passwordStrength.color
                        : "bg-gray-200"
                    }`}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  Tip: Use 8+ characters with uppercase letters, numbers, and
                  special symbols.
                </p>
              </div>
            )}

            <Input
              label="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              startAdornment={<Lock size={18} />}
              endAdornmentInteractive={true}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 interactive-button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
            />

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500 interactive-link"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500 interactive-link"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="interactive-button"
            >
              Create account
            </Button>
          </form>

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
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 interactive-link"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
