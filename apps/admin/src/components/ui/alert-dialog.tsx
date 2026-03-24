"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialog = DialogPrimitive.Root;

const AlertDialogTrigger = DialogPrimitive.Trigger;

const AlertDialogPortal = DialogPrimitive.Portal;

type OverlayElement = React.ComponentRef<typeof DialogPrimitive.Overlay>;
type OverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
type ContentElement = React.ComponentRef<typeof DialogPrimitive.Content>;
type ContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
type TitleElement = React.ComponentRef<typeof DialogPrimitive.Title>;
type TitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
type DescriptionElement = React.ComponentRef<typeof DialogPrimitive.Description>;
type DescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;
type CloseElement = React.ComponentRef<typeof DialogPrimitive.Close>;
type CloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;

const AlertDialogOverlay = React.forwardRef<
  OverlayElement,
  OverlayProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-[90] bg-slate-950/30 backdrop-blur-sm", className)}
    {...props}
  />
));
AlertDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  ContentElement,
  ContentProps
>(({ className, children, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-[95] grid w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-3xl border border-border bg-white p-6 shadow-soft duration-200 focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </AlertDialogPortal>
));
AlertDialogContent.displayName = DialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  TitleElement,
  TitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-slate-950", className)} {...props} />
));
AlertDialogTitle.displayName = DialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  DescriptionElement,
  DescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-slate-600", className)} {...props} />
));
AlertDialogDescription.displayName = DialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants(), className)} {...props} />
  )
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />
  )
);
AlertDialogCancel.displayName = "AlertDialogCancel";

const AlertDialogClose = React.forwardRef<
  CloseElement,
  CloseProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    className={cn("rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600", className)}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close dialog</span>
  </DialogPrimitive.Close>
));
AlertDialogClose.displayName = DialogPrimitive.Close.displayName;

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger
};
