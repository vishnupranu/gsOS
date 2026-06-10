import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../utils';

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = {
  default: {
    icon: Info,
    className: 'border-border bg-background-elevated',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-accent-green bg-accent-green/10',
  },
  error: {
    icon: AlertCircle,
    className: 'border-accent-red bg-accent-red/10',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-accent-yellow bg-accent-yellow/10',
  },
  destructive: {
    icon: AlertCircle,
    className: 'border-accent-red bg-accent-red/10',
  },
};

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: keyof typeof toastVariants;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant = 'default', ...props }, ref) => {
  const { icon: Icon, className: variantClassName } = toastVariants[variant];
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center space-x-3 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        variantClassName,
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <div className="flex-1">{props.children}</div>
    </ToastPrimitive.Root>
  );
});
Toast.displayName = 'Toast';

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-background-tertiary focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

// Toast hook for easy usage
type ToastActionElement = React.ReactElement<typeof ToastAction>;

interface ToastState {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: keyof typeof toastVariants;
}

interface UseToastOptions {
  defaultOptions?: ToastProps;
}

function useToastState(options: UseToastOptions = {}) {
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  const toast = React.useCallback(
    (props: Omit<ToastState, 'id'>) => {
      const id = Math.random().toString(36).slice(2, 11);
      setToasts(prev => [...prev, { ...props, id }]);
      return id;
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

function useToast(options: UseToastOptions = {}) {
  const [state, setState] = React.useState<ToastState[]>([]);
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, TOAST_REMOVE_DELAY);
    return () => clearTimeout(timer);
  }, [toasts]);

  const toast = React.useCallback(
    ({ ...props }: Omit<ToastState, 'id'>) => {
      setToasts(prev => {
        const newToasts = [...prev, { ...props, id: Math.random().toString(36).slice(2, 11) }];
        return newToasts.slice(-TOAST_LIMIT);
      });
    },
    []
  );

  return {
    toasts,
    toast,
    dismiss: React.useCallback((id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, []),
  };
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  useToast,
  type ToastProps,
  type ToastActionElement,
};