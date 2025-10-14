import type { Metadata } from 'next';

import './globals.css';
import 'ol/ol.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast/ToastContext';

export const metadata: Metadata = {
  title: 'MindCare',
  description: 'Aplicação Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
