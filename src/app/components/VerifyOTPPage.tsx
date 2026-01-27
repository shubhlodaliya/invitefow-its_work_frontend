import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/app/components/ui/input-otp";

interface VerifyOTPPageProps {
  onNext: (otp: string) => void;
  onBack: () => void;
}

export function VerifyOTPPage({ onNext, onBack }: VerifyOTPPageProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const expire = Number(localStorage.getItem("otpExpireAt"));
    if (expire && !isNaN(expire)) {
      const remaining = Math.ceil((expire - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 120;
  });
  const [sending, setSending] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    if (!email) return;

    if (secondsLeft <= 0) return;

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const resendOTP = async () => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      alert("No email found. Please go back and enter your email.");
      onBack();
      return;
    }

    try {
      setSending(true);
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const expireAt = Date.now() + 120000; // 2 minutes
        localStorage.setItem("otpExpireAt", String(expireAt));
        setSecondsLeft(120);

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        timerRef.current = window.setInterval(() => {
          setSecondsLeft((s) => {
            const next = s - 1;
            if (next <= 0) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              return 0;
            }
            return next;
          });
        }, 1000);

        alert(data.message || "OTP resent successfully");
      } else {
        alert(data.error || data.message || "Failed to resend OTP");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setError("");
    onNext(otp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="text-4xl">💍</div>
          <CardTitle className="text-2xl">Wedding Card PDF Generator</CardTitle>
          <CardDescription>Enter the 6-digit verification code</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg">
              Verify OTP
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <button
                  type="button"
                  onClick={onBack}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back
                </button>
              </div>

              <div className="text-sm">
                {secondsLeft > 0 ? (
                  <span className="text-gray-600">Resend in {formatTime(secondsLeft)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={sending}
                    className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
