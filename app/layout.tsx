import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Using DigitalOcean\'s App Platform to remove DevOps pain',
  description: 'this is a webinar about how to use App Platform  to get rid of devops pain. No more complex build scripts. Buildpacks do the magic. You don\'t need to worry about managing certs, DNS, log forwarding, metrics, scaling, or anything more than your core business problem.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}