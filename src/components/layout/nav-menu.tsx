"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navGroups } from "@/lib/nav-links";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function NavMenu() {
  const [openValue, setOpenValue] = useState<string | null>(null);
  const t = useTranslations("common.nav");

  return (
    <NavigationMenu value={openValue} onValueChange={setOpenValue}>
      <NavigationMenuList>
        {navGroups.map((group) => {
          const groupLabel = t(group.labelKey);

          return (
            <NavigationMenuItem key={group.labelKey} value={group.labelKey}>
              <NavigationMenuTrigger className="font-body text-ui text-foreground uppercase tracking-wider text-xs">
                {groupLabel}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-50 gap-1 p-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink
                        className="font-body text-ui text-foreground hover:bg-muted p-2 rounded-sm block text-sm transition-colors"
                        render={
                          <Link
                            href={link.href}
                            onClick={() => setOpenValue(null)}
                          >
                            {t(link.labelKey)}
                          </Link>
                        }
                      />
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
