import { useState, useEffect } from "react";
import Hero from "@/components/sections/Hero";
import FacilitatorsBlock from "@/components/sections/FacilitatorsBlock";
import RetreatBlock from "@/components/sections/RetreatBlock";
import TestimonialsBlock from "@/components/sections/TestimonialsBlock";
import BlogBlock from "@/components/sections/BlogBlock";
import NewsletterBlock from "@/components/sections/NewsletterBlock";
import SEO from "@/components/SEO";
import { loadSEOData, type SEOData } from "@/lib/seo-loader";

export default function Index() {
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    const data = await loadSEOData('homepage');
    console.log('Homepage SEO data loaded:', data);
    setSeoData(data);
    setIsLoading(false);
  };

  return (
    <div>
      <SEO
        title={seoData?.metaTitle || "Активация Кундалини — фасилитаторы и ретриты"}
        description={seoData?.metaDescription || "Активация кундалини — фасилитаторы и ретриты онлайн и офлайн"}
        image={seoData?.metaImage || "https://cdn.builder.io/api/v1/image/assets%2Ff7c6ff3df7e24636ad711d68d812700a%2F11cd1920330447038be7d4baff54a53d?format=webp&width=1200"}
      />
      <Hero />
      <FacilitatorsBlock />
      <RetreatBlock />
      <TestimonialsBlock />
      <BlogBlock />
      <NewsletterBlock />
    </div>
  );
}
