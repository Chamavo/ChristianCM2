import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maths à l\'école des sorciers — Préparation Libermann',
  description: 'Parcours adaptatif de maths CM2 sur 15 jours, gamifié Harry Potter, pour le concours d\'entrée en 6ème.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
