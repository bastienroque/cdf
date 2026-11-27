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
import { isAdminRole, isSuperAdminRole } from "@/lib/auth/roles";

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

  const isAdmin = isAdminRole(role);
  const isSuperAdmin = isSuperAdminRole(role);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background px-6 py-3">
      {/* Equal outer columns keep the main menu exactly centered on desktop */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {/* Left: Logo & Title */}
        <Link
          href={`/${locale}`}
          className="flex min-w-0 items-center gap-2.5 justify-self-start font-display text-sm sm:text-h3 font-semibold tracking-tight text-foreground group"
        >
          <Image
            src="/CDF_LOGO.svg"
            alt="Cavaleiros da Francesinha Logo"
            width={38}
            height={38}
            className="h-9 sm:h-10 w-auto shrink-0 transition-transform group-hover:scale-105"
            priority
          />
          <span className="truncate tracking-tight text-sm sm:text-base inline">
            Cavaleiros da Francesinha
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex justify-center">
          <NavMenu />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center justify-end gap-4">
          {isAdmin && (
            <div className="hidden lg:flex items-center gap-4">
              <div className="h-5 w-px bg-border" />
              <AdminNavMenu isSuperAdmin={isSuperAdmin} />
            </div>
          )}
          <div className="hidden lg:block">
            <LocaleSwitcher currentLocale={locale} />
          </div>

          {/* Desktop Account Menu */}
          {isAdmin && (
            <div className="hidden lg:block">
              <AccountMenu locale={locale} isLoggedIn={isLoggedIn} />
            </div>
          )}

          {/* Mobile Nav Component */}
          <div className="flex lg:hidden">
            <MobileNav
              currentLocale={locale}
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              isSuperAdmin={isSuperAdmin}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
