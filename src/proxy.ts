import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["pt", "en", "fr"],
  defaultLocale: "pt",
  localePrefix: "always",
});

export default async function proxy(request: NextRequest) {
  // 1. Run intlMiddleware first
  const intlResponse = intlMiddleware(request);

  // If next-intl decided to redirect (e.g. root / to /pt), return immediately
  // to avoid unnecessary database hits and session checks.
  if (
    intlResponse.headers.get("x-middleware-redirect") ||
    intlResponse.status === 307 ||
    intlResponse.status === 308
  ) {
    return intlResponse;
  }

  // 2. Initialize Supabase Server Client tied to the response cycle
  let supabaseResponse = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = intlResponse;
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 3. Fetch user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const locale = ["pt", "en", "fr"].includes(segments[0]) ? segments[0] : "pt";
  const pathWithoutLocale =
    "/" +
    (["pt", "en", "fr"].includes(segments[0])
      ? segments.slice(1).join("/")
      : segments.join("/"));

  const isAdminRoute = pathWithoutLocale.startsWith("/admin");
  const isAppRoute = pathWithoutLocale.startsWith("/review");

  // 4. Protect App Routes
  if (isAppRoute && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Protect Admin Routes & Check Role
  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("next", pathWithoutLocale);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
