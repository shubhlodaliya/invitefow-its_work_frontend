import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "@/app/components/ui/password-input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import apiCall from "@/app/utils/api";

interface ResetPasswordPageProps {
  onNext: (password: string) => void;
  onBack: () => void;
}

export function ResetPasswordPage({ onNext, onBack }: ResetPasswordPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { from?: string } | null) || null;

  useEffect(() => {
    const flow = localStorage.getItem('resetFlowStep');
    const email = localStorage.getItem('resetEmail');
    const verifiedThisSession = sessionStorage.getItem('otpVerified') === 'true';
    const cameFromVerify = fromState?.from === 'verify-otp';

    if (flow !== 'otp-verified' || !email || (!verifiedThisSession && !cameFromVerify)) {
      navigate('/forget-password', { replace: true });
    }
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!hasLowerCase) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!hasNumbers) {
      setError("Password must contain at least one number");
      return;
    }

    if (!hasSpecialChar) {
      setError("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    onNext(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2">
            <div className="text-4xl">💍</div>
          </div>
          <CardTitle className="text-2xl">
            Wedding Card PDF Generator
          </CardTitle>
          <CardDescription>
            Enter your new password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg">
              Reset Password
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-blue-600 hover:underline"
              >
                Back
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
