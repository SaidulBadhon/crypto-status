import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio Details | Crypto Portfolio Tracker',
  description: 'View detailed information about your crypto portfolio snapshot',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function PortfolioDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
