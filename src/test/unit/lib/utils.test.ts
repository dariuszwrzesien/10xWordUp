import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge classes correctly", () => {
      const result = cn("class1", "class2", "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const isDisabled = false;

      const result = cn("base", isActive && "active", isDisabled && "disabled");

      expect(result).toBe("base active");
    });

    it("should override Tailwind classes correctly", () => {
      // tailwind-merge should keep the last declaration
      const result = cn("px-2 py-1", "px-4");

      expect(result).toBe("py-1 px-4");
    });

    it("should handle undefined values", () => {
      const result = cn("class1", undefined, "class2");

      expect(result).toBe("class1 class2");
    });

    it("should handle null values", () => {
      const result = cn("class1", null, "class2");

      expect(result).toBe("class1 class2");
    });

    it("should handle empty strings", () => {
      const result = cn("class1", "", "class2");

      expect(result).toBe("class1 class2");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["class1", "class2"], "class3");

      expect(result).toBe("class1 class2 class3");
    });

    it("should handle objects with boolean values", () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });

      expect(result).toBe("class1 class3");
    });

    it("should merge Tailwind utility classes intelligently", () => {
      // Should keep the last conflicting class
      const result = cn("text-sm text-base", "text-lg");

      expect(result).toBe("text-lg");
    });

    it("should handle complex Tailwind class combinations", () => {
      const result = cn("p-4 bg-red-500", "p-6 bg-blue-500");

      expect(result).toBe("p-6 bg-blue-500");
    });

    it("should handle responsive classes", () => {
      const result = cn("text-sm md:text-base", "lg:text-lg");

      expect(result).toContain("text-sm");
      expect(result).toContain("md:text-base");
      expect(result).toContain("lg:text-lg");
    });

    it("should handle hover and focus states", () => {
      const result = cn("hover:bg-blue-500", "focus:ring-2");

      expect(result).toContain("hover:bg-blue-500");
      expect(result).toContain("focus:ring-2");
    });

    it("should handle mixed argument types", () => {
      const result = cn(
        "base",
        ["array1", "array2"],
        {
          conditional: true,
          excluded: false,
        },
        null,
        undefined,
        "final"
      );

      expect(result).toContain("base");
      expect(result).toContain("array1");
      expect(result).toContain("array2");
      expect(result).toContain("conditional");
      expect(result).not.toContain("excluded");
      expect(result).toContain("final");
    });

    it("should handle no arguments", () => {
      const result = cn();

      expect(result).toBe("");
    });

    it("should handle only falsy values", () => {
      const result = cn(null, undefined, false, "");

      expect(result).toBe("");
    });

    it("should preserve important modifiers", () => {
      const result = cn("text-red-500", "!text-blue-500");

      expect(result).toContain("!text-blue-500");
    });

    it("should work with component variants pattern", () => {
      const variants = {
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-200 text-gray-800",
      };

      const result = cn("px-4 py-2 rounded", variants.primary, "hover:opacity-90");

      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
      expect(result).toContain("rounded");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("text-white");
      expect(result).toContain("hover:opacity-90");
    });

    it("should handle dark mode classes", () => {
      const result = cn("bg-white dark:bg-gray-800", "text-gray-900 dark:text-white");

      expect(result).toContain("bg-white");
      expect(result).toContain("dark:bg-gray-800");
      expect(result).toContain("text-gray-900");
      expect(result).toContain("dark:text-white");
    });

    it("should merge conflicting padding/margin correctly", () => {
      const result = cn("p-4", "px-6");

      // tailwind-merge should keep px-6 and remove the x-axis padding from p-4
      expect(result).toContain("px-6");
    });

    it("should handle arbitrary values", () => {
      const result = cn("w-[100px]", "h-[200px]");

      expect(result).toContain("w-[100px]");
      expect(result).toContain("h-[200px]");
    });

    it("should override conflicting arbitrary values", () => {
      const result = cn("w-[100px]", "w-[200px]");

      expect(result).toBe("w-[200px]");
      expect(result).not.toContain("w-[100px]");
    });
  });
});

