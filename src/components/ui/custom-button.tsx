import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const customButtonVariants = cva(
  "group inline-flex items-center justify-center gap-2 rounded-sm border border-transparent font-semibold uppercase transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solid fill
        primary: "",
        // Light background tint + border accent
        secondary: "",
        // Neutral background with subtle border
        outline:
          "border-border bg-background text-foreground hover:bg-muted hover:border-amber-500/40",
        // Clean text/icon button
        ghost: "hover:bg-muted hover:text-foreground",
      },
      intent: {
        default: "",
        amber: "",
        destructive: "",
      },
      size: {
        default: "px-7 py-3 text-sm tracking-wider font-body",
        sm: "px-2.5 py-1 text-xs tracking-wider font-body [&_svg]:size-3.5",
        md: "px-5 py-2 text-sm tracking-wider font-body",
        lg: "px-8 py-3.5 text-sm font-bold tracking-widest font-body",
        icon: "size-8 p-0",
        "icon-sm": "size-7 p-0",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        intent: "default",
        className: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      {
        variant: "primary",
        intent: "amber",
        className: "bg-amber-500 text-black hover:bg-amber-400 font-semibold",
      },
      {
        variant: "primary",
        intent: "destructive",
        className: "bg-red-600 text-white hover:bg-red-500",
      },

      {
        variant: "secondary",
        intent: "amber",
        className:
          "border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-500 dark:text-amber-400",
      },
      {
        variant: "secondary",
        intent: "destructive",
        className:
          "border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20",
      },
      {
        variant: "secondary",
        intent: "default",
        className:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
    ],
    defaultVariants: {
      variant: "primary",
      intent: "default",
      size: "default",
    },
  },
);

type CustomButtonBaseProps = VariantProps<typeof customButtonVariants> & {
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CustomButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = CustomButtonBaseProps &
  React.ComponentProps<typeof Link> & {
    href: string;
  };

export type CustomButtonProps = ButtonAsButton | ButtonAsLink;

export function CustomButton({
  className,
  variant,
  intent,
  size,
  children,
  ...props
}: CustomButtonProps) {
  const combinedClassName = cn(
    customButtonVariants({ variant, intent, size, className }),
  );

  if (props.href !== undefined) {
    const { href, ...linkProps } = props as ButtonAsLink;
    return (
      <Link href={href} className={combinedClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
