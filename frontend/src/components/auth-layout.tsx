import { Link } from 'react-router-dom';
import { BadgeCheck, ShieldCheck, Sparkles, Truck } from 'lucide-react';

import { appConfig } from '../config';
import { ButtonLink, Card, SectionBadge } from './ui';

export function AuthLayout({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="grid gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <section className="relative overflow-hidden rounded-[28px] border border-brand-border bg-[linear-gradient(160deg,rgba(201,139,43,0.14),rgba(245,242,237,0.95))] p-8 shadow-soft sm:p-10">
        <div className="absolute right-8 top-8 hidden h-40 w-40 rounded-full bg-white/40 blur-3xl lg:block" />
        <SectionBadge>Customer portal</SectionBadge>
        <div className="mt-6 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primaryDark">
            {appConfig.appName}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-brand-text sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-brand-muted">{description}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: ShieldCheck,
              title: 'JWT secured',
              text: 'Access, refresh, and protected routes stay aligned with backend session rules.',
            },
            {
              icon: Truck,
              title: 'Shopping ready',
              text: 'Browse products, save favorites, build carts, and check out in a clean flow.',
            },
            {
              icon: BadgeCheck,
              title: 'Customer first',
              text: 'Profile and address management are built for repeat, low-friction ordering.',
            },
            {
              icon: Sparkles,
              title: 'Polished theme',
              text: 'Soft shadows, rounded surfaces, and gold accents keep the portal premium.',
            },
          ].map((item) => (
            <Card key={item.title} className="bg-white/80 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-brand-secondary p-3 text-brand-primaryDark">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-brand-text">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{item.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink to="/products" variant="secondary">
            Browse products
          </ButtonLink>
          <Link to="/" className="text-sm font-semibold text-brand-primaryDark underline-offset-4 hover:underline">
            Back to landing
          </Link>
        </div>
      </section>

      <Card className="p-6 sm:p-8">
        {children}
        <div className="mt-6 border-t border-brand-border pt-5 text-sm text-brand-muted">{footer}</div>
      </Card>
    </div>
  );
}

