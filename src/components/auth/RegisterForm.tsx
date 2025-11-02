import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth.schema";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle error response
        toast.error(responseData.message || "Wystąpił błąd podczas rejestracji");
        return;
      }

      // Success - show success message with email confirmation info
      if (responseData.emailConfirmationRequired) {
        toast.success(responseData.message || "Konto utworzone! Sprawdź email, aby potwierdzić rejestrację.", {
          duration: 8000, // Show longer for important message
        });

        // Reset form after successful registration
        form.reset();
      } else {
        toast.success(responseData.message || "Konto utworzone pomyślnie!");

        // If no email confirmation required, redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch {
      toast.error("Wystąpił błąd podczas rejestracji");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card data-testid="register-form-card">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Dołącz do 10xWordUp</CardTitle>
        <CardDescription>Utwórz konto i zacznij naukę angielskiego już dziś</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="register-form">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Adres e-mail
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="twoj@email.com" {...field} disabled={isLoading} data-testid="register-email-input" />
                  </FormControl>
                  <FormMessage data-testid="register-email-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Hasło
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} data-testid="register-password-input" />
                  </FormControl>
                  <FormDescription>Minimum 8 znaków</FormDescription>
                  <FormMessage data-testid="register-password-error" />
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
                    Potwierdź hasło
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} data-testid="register-confirm-password-input" />
                  </FormControl>
                  <FormMessage data-testid="register-confirm-password-error" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="register-submit-button">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Tworzenie konta...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Utwórz konto
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          Masz już konto?{" "}
          <a href="/login" className="text-primary hover:underline font-medium" data-testid="register-login-link">
            Zaloguj się
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
