"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

export function AppHeader({
  links,
  cerrarSesionAction,
}: {
  links: NavLink[];
  cerrarSesionAction: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-heading text-lg text-secondary italic">
          Receta<span className="text-primary not-italic">.</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => {
            const activo = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  activo ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <form action={cerrarSesionAction}>
            <Button variant="ghost" size="sm" type="submit">
              Cerrar sesión
            </Button>
          </form>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="italic">Receta Electrónica</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-2 text-sm hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <form action={cerrarSesionAction} className="mt-2 px-4 pb-4">
              <Button variant="outline" size="sm" type="submit" className="w-full">
                Cerrar sesión
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
