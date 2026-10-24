import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import { NavMenu } from "./nav-menu";
import { AdminNavMenu } from "./admin-nav-menu";
import { LocaleSwitcher } from "./locale-switcher";
import { AccountMenu } from "./account-menu";
import { MobileNav } from "./mobile-nav";

export async function Navbar({ locale }: { locale: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;
  let role: string | null = null;

  if (user) {
    const [profile] = await db
      .select({
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    role = profile?.role ?? null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo & Title */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 font-display text-sm sm:text-h3 font-semibold tracking-tight text-foreground group"
        >
          <Image
            src="/CDF_LOGO.svg"
            alt="Cavaleiros da Francesinha Logo"
            width={38}
            height={38}
            className="h-9 sm:h-10 w-auto shrink-0 transition-transform group-hover:scale-105"
            priority
          />
          <span className="tracking-tight text-sm sm:text-base">
            Cavaleiros da Francesinha
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex justify-center">
          <NavMenu />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {role === "admin" && (
            <div className="hidden md:flex items-center gap-4">
              <div className="h-5 w-px bg-border" />
              <AdminNavMenu />
            </div>
          )}
          <div className="hidden md:block">
            <LocaleSwitcher currentLocale={locale} />
          </div>

          {/* Desktop Account Menu */}
          {/* <div className="hidden md:block">
            <AccountMenu locale={locale} isLoggedIn={isLoggedIn} />
          </div> */}

          {/* Mobile Nav Component */}
          <div className="flex md:hidden">
            <MobileNav
              currentLocale={locale}
              isLoggedIn={isLoggedIn}
              role={role}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
