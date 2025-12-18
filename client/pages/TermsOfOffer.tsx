import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';

interface TermsOfOffer {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_TERMS: TermsOfOffer = {
  id: 'main',
  title: 'Договор оферты',
  content: 'Договор оферты будет добавлен позже.',
};

export default function TermsOfOffer() {
  const [terms, setTerms] = useState<TermsOfOffer>(DEFAULT_TERMS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const { data, error } = await supabase
          .from('terms_of_offer')
          .select('*')
          .maybeSingle();

        if (!error && data) {
          setTerms(data);
        }
      } catch (error) {
        console.error('Failed to load terms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTerms();
  }, []);

  if (isLoading) {
    return (
      <section className="container py-20">
        <div className="text-center">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="container py-20">
      <SEO description="Договор оферты" title="Договор оферты" />
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{terms.title}</h1>
        
        <div className="prose prose-sm max-w-none">
          {terms.content ? (
            <div
              dangerouslySetInnerHTML={{ __html: terms.content.replace(/\n/g, '<br />') }}
              className="whitespace-pre-wrap text-foreground leading-relaxed"
            />
          ) : (
            <p className="text-muted-foreground">Договор оферты ещё не добавлен.</p>
          )}
        </div>
      </div>
    </section>
  );
}
