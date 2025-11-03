import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UserMenuProps {
  userEmail: string;
}

export default function UserMenu({ userEmail }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas wylogowania");
      }

      toast.success("Wylogowano pomyślnie");
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd podczas wylogowania");
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="user-menu-trigger">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline" data-testid="user-email">
            {userEmail}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" data-testid="user-menu-content">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Twoje konto</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer"
          data-testid="logout-button"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? "Wylogowywanie..." : "Wyloguj się"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
