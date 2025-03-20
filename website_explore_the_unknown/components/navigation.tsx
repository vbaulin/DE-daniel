"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, FolderGit2, BookOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/waitlist",
      label: "Discover",
      icon: FolderGit2,
    },
    {
      href: "/methods",
      label: "Methods",
      icon: BookOpen,
    },
    {
      href: "/team",
      label: "Team",
      icon: Users,
    },
  ];

  return (
    <nav className="w-full px-4">
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-center items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center text-sm transition-colors hover:text-blue-400",
                  pathname === route.href
                    ? "text-blue-400 font-medium"
                    : "text-gray-400"
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {route.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] bg-black p-6">
            <div className="flex flex-col space-y-6 mt-6">
              {routes.map((route) => {
                const Icon = route.icon;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center text-lg transition-colors hover:text-blue-400",
                      pathname === route.href
                        ? "text-blue-400 font-medium"
                        : "text-gray-400"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
