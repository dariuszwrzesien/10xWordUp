import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth.schema";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle error response
        toast.error(responseData.message || "Nieprawidłowy e-mail lub hasło");
        return;
      }

      // Success - show success message
      toast.success("Logowanie pomyślne! Przekierowywanie...");

      // Redirect to home page after successful login
      // Using window.location.href to ensure full page reload and middleware refresh
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch {
      toast.error("Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card data-testid="login-form-card">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Witaj!</CardTitle>
        <CardDescription>Zaloguj się do swojego konta 10xWordUp</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
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
                    <Input
                      type="email"
                      placeholder="twoj@email.com"
                      {...field}
                      disabled={isLoading}
                      data-testid="login-email-input"
                    />
                  </FormControl>
                  <FormMessage data-testid="login-email-error" />
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
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      data-testid="login-password-input"
                    />
                  </FormControl>
                  <FormMessage data-testid="login-password-error" />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                data-testid="login-forgot-password-link"
              >
                Nie pamiętasz hasła?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="login-submit-button">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Logowanie...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Zaloguj się
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          Nie masz jeszcze konta?{" "}
          <a href="/register" className="text-primary hover:underline font-medium" data-testid="login-register-link">
            Zarejestruj się
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
