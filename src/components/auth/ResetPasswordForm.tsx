import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas/auth.schema";

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(true);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check if there's a valid reset token in the URL
  useEffect(() => {
    const checkToken = () => {
      // Check if the URL contains the required tokens
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);

      // Log all hash parameters for debugging
      console.log("Hash parameters:", Object.fromEntries(hashParams.entries()));

      const hasAccessToken = hashParams.has("access_token");

      if (!hasAccessToken) {
        setHasValidToken(false);
        toast.error("Link resetujący jest nieprawidłowy lub wygasł");
        console.error("Missing access_token");
      }

      setIsCheckingToken(false);
    };

    checkToken();
  }, []);

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);

    try {
      // Extract tokens from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      console.log("Sending tokens to API - access_token:", !!accessToken, "refresh_token:", !!refreshToken);

      if (!accessToken) {
        setHasValidToken(false);
        toast.error("Link resetujący jest nieprawidłowy lub wygasł");
        setIsLoading(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      // Add refresh token only if it exists
      if (refreshToken) {
        headers["X-Refresh-Token"] = refreshToken;
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers,
        body: JSON.stringify({
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle error response
        if (response.status === 401) {
          setHasValidToken(false);
          toast.error("Link resetujący jest nieprawidłowy lub wygasł");
        } else {
          toast.error(responseData.message || "Wystąpił błąd podczas resetowania hasła");
        }
        return;
      }

      // Success - password changed and user is now logged in
      setIsSuccess(true);
      toast.success("Hasło zostało zmienione pomyślnie!");
    } catch {
      toast.error("Wystąpił błąd podczas resetowania hasła");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking token
  if (isCheckingToken) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sprawdzanie linku...</CardTitle>
          <CardDescription>Proszę czekać</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  // Show error state if token is invalid
  if (!hasValidToken) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Link jest nieprawidłowy</CardTitle>
          <CardDescription>Link resetujący hasło wygasł lub jest nieprawidłowy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>Link resetujący jest ważny tylko przez 1 godzinę.</p>
            <p className="mt-2">Możesz poprosić o nowy link resetujący.</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button asChild className="w-full" size="lg">
            <a href="/forgot-password">Wyślij nowy link</a>
          </Button>
          <div className="text-sm text-muted-foreground text-center">
            <a href="/login" className="text-primary hover:underline font-medium">
              Powrót do logowania
            </a>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Hasło zostało zmienione!</CardTitle>
          <CardDescription>Zostałeś automatycznie zalogowany</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            className="w-full"
            size="lg"
            onClick={() => {
              // Redirect to home page after successful password reset
              window.location.href = "/";
            }}
          >
            <a href="/">Przejdź do aplikacji</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Ustaw nowe hasło</CardTitle>
        <CardDescription>Wprowadź nowe hasło do swojego konta 10xWordUp</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Nowe hasło
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormDescription>Minimum 8 znaków</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Potwierdź nowe hasło
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Resetowanie...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Zmień hasło
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          <a href="/login" className="text-primary hover:underline font-medium">
            Powrót do logowania
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
