"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  variant?: "light" | "dark";
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  variant = "dark",
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center",
          variant === "light"
            ? "bg-[#f7f7f9] text-slate-900"
            : "bg-[#111112] text-slate-100",
          className,
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              ...(variant === "light"
                ? ({
                    "--aurora":
                      "repeating-linear-gradient(100deg,#e6eefc_10%,#dde7fb_15%,#d5e0f8_20%,#ccd9f6_25%,#e6eefc_30%)",
                    "--dark-gradient":
                      "repeating-linear-gradient(100deg,#ffffff_0%,#f2f5fb_7%,transparent_10%,transparent_12%,#ffffff_16%)",
                    "--white-gradient":
                      "repeating-linear-gradient(100deg,#f3f6fd_0%,#eef2fb_7%,transparent_10%,transparent_12%,#e9eef9_16%)",
                    "--gray-300": "#e6eefc",
                    "--gray-400": "#dde7fb",
                    "--gray-500": "#d5e0f8",
                    "--gray-600": "#ccd9f6",
                    "--gray-700": "#c3d2f4",
                    "--black": "#ffffff",
                    "--white": "#f9fbff",
                    "--transparent": "transparent",
                  } as React.CSSProperties)
                : ({
                    "--aurora":
                      "repeating-linear-gradient(100deg,#18181b_10%,#232326_15%,#222_20%,#222_25%,#18181b_30%)",
                    "--dark-gradient":
                      "repeating-linear-gradient(100deg,#000_0%,#18181b_7%,transparent_10%,transparent_12%,#000_16%)",
                    "--white-gradient":
                      "repeating-linear-gradient(100deg,#232326_0%,#18181b_7%,transparent_10%,transparent_12%,#111_16%)",
                    "--gray-300": "#232326",
                    "--gray-400": "#222",
                    "--gray-500": "#18181b",
                    "--gray-600": "#111112",
                    "--gray-700": "#000",
                    "--black": "#000",
                    "--white": "#222",
                    "--transparent": "transparent",
                  } as React.CSSProperties)),
            } as React.CSSProperties
          }
        >
          <div
            //   I'm sorry but this is what peak developer performance looks like // trigger warning
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-80 blur-[16px] filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--gray-700)_10%,var(--gray-500)_15%,var(--gray-400)_20%,var(--gray-300)_25%,var(--gray-600)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--gray-700)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--gray-700)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--gray-500)_0%,var(--gray-600)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--gray-700)_16%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
