"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LoginFormSchema, type LoginFormInput } from "@/lib/validation";
import type { ZodError } from "@/types/validation";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<LoginFormInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setErrors({ general: "Invalid email or password" });
    }
  }, [searchParams]);

  const handleChange = (field: keyof LoginFormInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      delete newErrors.general;
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    try {
      const result = LoginFormSchema.safeParse(formData);

      if (result.success) {
        setErrors({});
        return true;
      }

      const newErrors: Record<string, string> = {};

      if (result.error) {
        const zodError = result.error as ZodError;
        const errorArray = zodError.errors || zodError.issues || [];

        if (Array.isArray(errorArray)) {
          errorArray.forEach((error) => {
            const fieldName = error.path?.[0];
            const message = error.message || "Invalid value";

            if (typeof fieldName === "string") {
              newErrors[fieldName] = message;
            }
          });
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error("Validation error:", error);
      setErrors({ general: "Validation failed" });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Invalid email or password" });
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const hasRequiredFields =
    formData.email.length > 0 && formData.password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to your TaskFlow account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter your email"
                    className={`h-11 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className={`h-11 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {errors.general && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive text-center">
                    {errors.general}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!hasRequiredFields || isLoading}
                className="w-full h-11"
                size="lg"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:underline"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
