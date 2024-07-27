import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  token?: {
    name: string;
    symbol: string;
    description: string;
    logo: string;
  };
}

const SEO: React.FC<SEOProps> = ({ title, description, image, token }) => {
  const router = useRouter();
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://bondle.xyz'; // Replace with your actual domain

  const seo = {
    title: title || 'Bondle - Explore and Trade Tokens',
    description: description || 'Explore, create, and trade tokens on the Bondle platform',
    image: image || `${domain}/default-og-image.jpg`,
    url: `${domain}${router.asPath}`,
  };

  if (token) {
    seo.title = `${token.name} (${token.symbol}) - Bondle`;
    seo.description = token.description || 'View token details on Bondle';
    seo.image = token.logo || seo.image;
  }

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Head>
  );
};

export default SEO;