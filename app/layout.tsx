import type { Metadata } from 'next';
import './globals.css';
import { Bebas_Neue as BebasNeue, Montserrat } from 'next/font/google';

const bebas = BebasNeue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: 'SteelMatch Pro',
  description: 'AI-matched U.S. steel partners - certified, fast, sustainable.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bebas.variable} ${montserrat.variable} font-montserrat bg-[#fefcf6]`}>
        {children}
      </body>
    </html>
  );
}

