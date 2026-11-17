"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Banner } from "@/components/demo/banner";
import { HelpDrawer } from "@/components/demo/help-drawer";
import { LogoMark } from "@/components/demo/icons";
import { BRAND } from "@/lib/brand";

const SCREENS = [
  { href: "/demo", label: "Overview" },
  { href: "/demo/team", label: "Team" },
  { href: "/demo/surveys", label: "Surveys" },
  { href: "/demo/extensions", label: "Extensions" },
];

export function DemoShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [help, setHelp] = useState(false);
  const closeHelp = useCallback(() => setHelp(false), []);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Banner />
      <div className="app">
        <nav className="nav" aria-label="Demo">
          <div className="brand">
            <LogoMark />
            <div className="wm">
              {BRAND.product}
              <small>{BRAND.business}</small>
            </div>
          </div>
          <div className="navl">
            {SCREENS.map((s) => (
              <Link key={s.href} href={s.href} aria-current={path === s.href ? "page" : undefined}>
                {s.label}
              </Link>
            ))}
          </div>
          <button type="button" className="help" onClick={() => setHelp(true)}>
            <span className="long">How it works</span>
            <span className="short">Help</span>
          </button>
        </nav>
        <main className="main" id="main">{children}</main>
      </div>
      <HelpDrawer open={help} onClose={closeHelp} />
    </>
  );
}
