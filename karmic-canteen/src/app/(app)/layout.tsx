import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  UtensilsCrossed
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/sign-out-button";

const navItems = [
  {
    href: "/dashboard",
    label: "Employee Dashboard",
    icon: LayoutDashboard,
    roles: ["employee", "admin"]
  },
  {
    href: "/admin",
    label: "Admin Control",
    icon: ClipboardList,
    roles: ["admin"]
  }
];

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-slate-900"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <ChefHat className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Karmic Solutions
              </p>
              <h1 className="text-xl font-semibold leading-tight">
                Karmic Canteen
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-2 rounded-full bg-slate-100 px-2 py-2 text-sm font-medium text-slate-600 md:flex">
              {navItems
                .filter((item) =>
                  item.roles.includes((session.user?.role as string) ?? "")
                )
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-full px-4 py-2 transition hover:bg-white hover:text-slate-900"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                <span
                  className={`flex size-8 items-center justify-center rounded-xl text-white shadow-inner ${(session.user?.avatarColor as string) ?? "bg-slate-500"}`}
                >
                  <UtensilsCrossed className="size-4" />
                </span>
                <div>
                  <p className="font-semibold leading-tight">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {session.user?.department}
                  </p>
                </div>
              </div>
              <SignOutButton>
                <LogOut className="size-4" />
                Sign out
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
