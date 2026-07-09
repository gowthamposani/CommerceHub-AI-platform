import { forwardRef } from 'react';
import type {
  ComponentProps,
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary text-white shadow-soft hover:bg-brand-primaryDark focus-visible:ring-brand-primary',
  secondary:
    'bg-brand-secondary text-brand-text border border-brand-border hover:border-brand-primary/30 hover:bg-white focus-visible:ring-brand-primary',
  ghost:
    'bg-transparent text-brand-text hover:bg-brand-secondary/80 focus-visible:ring-brand-primary',
  danger:
    'bg-brand-danger text-white hover:bg-brand-danger/90 focus-visible:ring-brand-danger',
};

export function buttonClassName(variant: ButtonVariant = 'primary', fullWidth = false): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    buttonVariants[variant],
    fullWidth && 'w-full',
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth = false, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClassName(variant, fullWidth), className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';

export function ButtonLink({
  to,
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
} & Omit<ComponentProps<typeof Link>, 'to' | 'className' | 'children'>): React.ReactElement {
  return (
    <Link to={to} className={cn(buttonClassName(variant, fullWidth), className)} {...props}>
      {children}
    </Link>
  );
}

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-3xl border border-brand-border bg-white shadow-soft', className)} {...props} />
  ),
);

Card.displayName = 'Card';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-text shadow-sm outline-none transition placeholder:text-brand-muted/70 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[128px] w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-text shadow-sm outline-none transition placeholder:text-brand-muted/70 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-text shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
        className,
      )}
      {...props}
    />
  ),
);

Select.displayName = 'Select';

type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const badgeVariants: Record<BadgeTone, string> = {
  primary: 'bg-brand-primary/12 text-brand-primaryDark',
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  info: 'bg-blue-50 text-blue-700',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        badgeVariants[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Spinner({ className }: { className?: string }): React.ReactElement {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-primary', className)} />;
}

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const alertVariants: Record<AlertTone, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
};

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn('rounded-3xl border px-4 py-3', alertVariants[tone], className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {tone === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          <div className={cn('text-sm', title && 'mt-1')}>{children}</div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-primaryDark">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-2xl font-semibold text-brand-text sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-brand-muted">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  required = false,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  required?: boolean;
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <label htmlFor={htmlFor} className="text-sm font-medium text-brand-text">
          {label}
        </label>
        {required ? <span className="text-brand-primary">*</span> : null}
      </div>
      {children}
      {hint && !error ? <p className="text-xs text-brand-muted">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-brand-danger">{error}</p> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
}): React.ReactElement {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-brand-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-brand-text">{value}</p>
          {trend ? <p className="mt-2 text-xs font-medium text-brand-primaryDark">{trend}</p> : null}
        </div>
        <div className="rounded-2xl bg-brand-secondary p-3 text-brand-primaryDark">{icon}</div>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}): React.ReactElement {
  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      {icon ? <div className="rounded-full bg-brand-secondary p-4 text-brand-primaryDark">{icon}</div> : null}
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-text">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-brand-muted">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </Card>
  );
}

export function LoadingScreen({ title, description }: { title: string; description: string }): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <Spinner />
        <div>
          <h2 className="text-lg font-semibold text-brand-text">{title}</h2>
          <p className="mt-2 text-sm text-brand-muted">{description}</p>
        </div>
      </Card>
    </div>
  );
}

export function InlineLoader({ label = 'Loading' }: { label?: string }): React.ReactElement {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-brand-muted">
      <Spinner className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

export function SectionBadge({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <Badge tone="primary" className="border border-brand-primary/15 bg-brand-primary/10">
      {children}
    </Badge>
  );
}
