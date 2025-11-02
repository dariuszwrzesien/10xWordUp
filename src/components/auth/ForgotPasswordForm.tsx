import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas/auth.schema";

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle error response
        toast.error(responseData.message || "Wystąpił błąd podczas wysyłania linku");
        return;
      }

      // Success - always show the same message for security
      setIsSubmitted(true);
      toast.success("Jeśli konto istnieje, link został wysłany");
    } catch {
      toast.error("Wystąpił błąd podczas wysyłania linku");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card data-testid="forgot-password-success-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription data-testid="forgot-password-success-message">
            Jeśli konto z tym adresem e-mail istnieje, wysłaliśmy link do resetowania hasła
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-2">
            <p>Link resetujący jest ważny przez 1 godzinę.</p>
            <p>Jeśli nie otrzymałeś wiadomości, sprawdź folder spam.</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
            className="w-full"
            data-testid="forgot-password-resend-button"
          >
            Wyślij ponownie
          </Button>
          <div className="text-sm text-muted-foreground text-center">
            <a href="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1" data-testid="forgot-password-back-to-login-link">
              <ArrowLeft className="h-3 w-3" />
              Powrót do logowania
            </a>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card data-testid="forgot-password-form-card">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Nie pamiętasz hasła?</CardTitle>
        <CardDescription>Podaj swój adres e-mail, a wyślemy Ci link do resetowania hasła</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="forgot-password-form">
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
                    <Input type="email" placeholder="twoj@email.com" {...field} disabled={isLoading} data-testid="forgot-password-email-input" />
                  </FormControl>
                  <FormMessage data-testid="forgot-password-email-error" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="forgot-password-submit-button">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  Wyślij link resetujący
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          <a href="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1" data-testid="forgot-password-login-link">
            <ArrowLeft className="h-3 w-3" />
            Powrót do logowania
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
