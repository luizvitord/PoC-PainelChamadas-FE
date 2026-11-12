import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[220] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * Mantém o X visível no lugar padrão, mas impede o fechamento (X, Esc e clique fora).
   * Use quando fechar deixaria um processo pela metade; explique o motivo em `closeDisabledReason`.
   */
  closeDisabled?: boolean;
  closeDisabledReason?: string;
  /** Não renderiza o X. Prefira `closeDisabled` para manter o X padronizado em todos os modais. */
  hideCloseButton?: boolean;
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  (
    {
      className,
      children,
      closeDisabled = false,
      closeDisabledReason,
      hideCloseButton = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      ...props
    },
    ref,
  ) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[221] grid max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg grid-cols-[minmax(0,1fr)] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto overscroll-contain rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className,
      )}
      onEscapeKeyDown={(e) => {
        if (closeDisabled) e.preventDefault();
        onEscapeKeyDown?.(e);
      }}
      onPointerDownOutside={(e) => {
        if (closeDisabled) e.preventDefault();
        onPointerDownOutside?.(e);
      }}
      onInteractOutside={(e) => {
        if (closeDisabled) e.preventDefault();
        onInteractOutside?.(e);
      }}
      {...props}
    >
      {children}
      {/* X padrão do sistema: mesmo tamanho, estilo e posição em todos os modais */}
      {!hideCloseButton && (
        <DialogPrimitive.Close
          aria-disabled={closeDisabled || undefined}
          title={closeDisabled ? closeDisabledReason : "Fechar"}
          onClick={(e) => {
            if (closeDisabled) e.preventDefault();
          }}
          className={cn(
            "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-100 text-slate-500 transition-colors",
            "hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-slate-100 aria-disabled:hover:text-slate-500",
          )}
        >
          <X className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">{closeDisabled ? `Fechar indisponível: ${closeDisabledReason ?? ""}` : "Fechar"}</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
  ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("pr-12 text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
