import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://chofu-households-asajima.sites.openai.com'),
  title: '「家族の街」調布市で、いまやほぼ2世帯に1世帯が一人暮らしだ。',
  description: 'SSDSE-Aと国勢調査から、調布市の単独世帯割合を多摩26市との比較と25年間の推移で読み解くD3.js可視化。',
  openGraph: {
    title: '「家族の街」調布市で、いまやほぼ2世帯に1世帯が一人暮らしだ。',
    description: '調布市の世帯構成を、比較と25年の変化で読み解く。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '調布市の単独世帯割合を100世帯に見立てた可視化' }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '「家族の街」調布市で、いまやほぼ2世帯に1世帯が一人暮らしだ。',
    description: '調布市の世帯構成を、比較と25年の変化で読み解く。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
