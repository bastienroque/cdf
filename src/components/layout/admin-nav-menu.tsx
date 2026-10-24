"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { adminLinks } from "@/lib/admin-links";
import { Crown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface AdminNavMenuProps {
  onNavigate?: () => void;
}

export function AdminNavMenu({ onNavigate }: AdminNavMenuProps) {
  const [openValue, setOpenValue] = useState<string | null>(null);
  const pathname = usePathname();
  const t = useTranslations("admin");

  useEffect(() => {
    setOpenValue(null);
  }, [pathname]);

  const handleLinkClick = () => {
    setOpenValue(null);
    onNavigate?.();
  };

  return (
    <NavigationMenu value={openValue} onValueChange={setOpenValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="admin">
          <NavigationMenuTrigger className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 transition-colors">
            <Crown className="h-3.5 w-3.5" />
            <span>{t("navTrigger")}</span>
          </NavigationMenuTrigger>

          <NavigationMenuContent>
            <ul className="flex flex-col gap-1 p-1 w-55 bg-popover overflow-hidden">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <li key={link.href} className="w-full">
                    <NavigationMenuLink
                      render={
                        <Link href={link.href} onClick={handleLinkClick} />
                      }
                      className={`block w-full px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                        isActive
                          ? "bg-amber-500/15 text-amber-500 font-semibold"
                          : "text-foreground hover:bg-muted hover:text-amber-600"
                      }`}
                    >
                      {t(`links.${link.labelKey}`)}
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
