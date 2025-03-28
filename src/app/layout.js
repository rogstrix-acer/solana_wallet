import './globals.css';

export const metadata = {
  title: 'Solana Token App',
  description: 'A Solana token app built with Next.js App Router',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}