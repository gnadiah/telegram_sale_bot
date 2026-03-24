import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label className={cn("text-sm font-medium text-slate-700", className)} ref={ref} {...props} />
));
Label.displayName = "Label";

export { Label };
