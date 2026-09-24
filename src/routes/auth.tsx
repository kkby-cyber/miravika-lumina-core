import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCustomerSession,
  sendPasswordReset,
  signInCustomer,
  signUpCustomer,
} from "@/lib/customer-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — MIRAVIKA" },
      {
        name: "description",
        content: "Sign in or create your MIRAVIKA customer account.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    void getCustomerSession().then(({ session }) => {
      if (!active) return;

      if (session) {
        void navigate({ to: "/account", replace: true });
        return;
      }

      setCheckingSession(false);
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-5 w-5 animate-spin text-gold" aria-label="Loading" />
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (mode !== "forgot" && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signin") {
        const result = await signInCustomer(normalizedEmail, password);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Welcome back to MIRAVIKA.");
        await navigate({ to: "/account", replace: true });
        return;
      }

      if (mode === "signup") {
        const result = await signUpCustomer(normalizedEmail, password);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        const session = await getCustomerSession();

        if (session.session) {
          toast.success("Your MIRAVIKA account is ready.");
          await navigate({ to: "/account", replace: true });
        } else {
          toast.success("Account created. Please check your email to confirm your account.");
          setMode("signin");
          setPassword("");
          setConfirmPassword("");
        }

        return;
      }

      const result = await sendPasswordReset(normalizedEmail);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Password reset instructions have been sent to your email.");
      setMode("signin");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "signin"
      ? "Welcome back"
      : mode === "signup"
        ? "Create your account"
        : "Reset password";

  const description =
    mode === "signin"
      ? "Sign in to access your orders, saved details and wishlist."
      : mode === "signup"
        ? "Create a MIRAVIKA account for a more seamless shopping experience."
        : "Enter your email and we’ll send you a secure password reset link.";

  return (
    <div className="min-h-[70vh] px-4 py-12 md:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden border border-border/70 bg-card md:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-ivory p-10 md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">MIRAVIKA</p>
            <h2 className="mt-8 max-w-sm font-display text-5xl leading-[1.05] text-foreground">
              Luxury, curated for you.
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
              Keep your orders, saved addresses and wishlist connected across your MIRAVIKA shopping
              experience.
            </p>
          </div>

          <p className="text-xs uppercase tracking-[0.18em] text-gold">Luxury Redefined</p>
        </div>

        <div className="p-6 sm:p-10 md:p-14">
          <div className="mb-8">
            <LockKeyhole className="h-6 w-6 text-gold" strokeWidth={1.4} />
            <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
          </div>

          <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email address</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-none pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="auth-password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      onClick={() => setMode("forgot")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <Input
                    id="auth-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-none pl-10 pr-10"
                    disabled={loading}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="auth-confirm-password">Confirm password</Label>
                <Input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-none"
                  disabled={loading}
                  minLength={6}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-11 w-full rounded-full bg-foreground text-ivory hover:bg-foreground/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
            </Button>
          </form>

          <div className="mt-7 border-t border-border/70 pt-6 text-center text-sm">
            {mode === "signin" && (
              <p className="text-muted-foreground">
                New to MIRAVIKA?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-4"
                  onClick={() => setMode("signup")}
                >
                  Create an account
                </button>
              </p>
            )}

            {mode === "signup" && (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-4"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
                onClick={() => setMode("signin")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </button>
            )}
          </div>

          <p className="mt-7 text-center text-[11px] leading-5 text-muted-foreground">
            By continuing, you agree to MIRAVIKA’s{" "}
            <Link to="/terms" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
