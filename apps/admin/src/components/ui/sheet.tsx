import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetClose = DialogPrimitive.Close;

const SheetPortal = DialogPrimitive.Portal;

type OverlayElement = React.ComponentRef<typeof DialogPrimitive.Overlay>;
type OverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
type ContentElement = React.ComponentRef<typeof DialogPrimitive.Content>;
type ContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
type TitleElement = React.ComponentRef<typeof DialogPrimitive.Title>;
type TitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
type DescriptionElement = React.ComponentRef<typeof DialogPrimitive.Description>;
type DescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;

const SheetOverlay = React.forwardRef<
  OverlayElement,
  OverlayProps
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm", className)}
      {...props}
    />
  );
});
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  ContentElement,
  ContentProps
>(({ children, className, ...props }, ref) => {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r border-border bg-white p-5 shadow-soft focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <X className="h-4 w-4" />
          <span className="sr-only">Close navigation</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetTitle = React.forwardRef<
  TitleElement,
  TitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-base font-semibold text-slate-900", className)} {...props} />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  DescriptionElement,
  DescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
