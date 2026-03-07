import Hero from '@/components/Hero';
import Welcome from '@/components/Welcome';
import News from '@/components/News';
import OpenMornings from '@/components/OpenMornings';
import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';
import { sanityFetch } from '@/lib/sanity';
import { homepageQuery } from '@/lib/queries';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata(
  'DPRIDE International School',
  'Welcome to DPRIDE International School, Abuja. Discover our programs, admissions, and latest news.',
  '/'
);

type NewsItem = {
  title?: string;
  slug?: { current: string };
  excerpt?: string;
  publishedAt?: string;
};

type OpenMorningsData = {
  title?: string;
  description?: string;
  dates?: { date: string; time: string }[];
  bookingRequired?: boolean;
};

type HomepageData = {
  heroTitle?: string;
  headteacherMessage?: { name?: string; message?: string };
  news?: NewsItem[];
  openMornings?: OpenMorningsData;
};

export default async function PageWithMetadata() {
  const data = (await sanityFetch(homepageQuery).catch(() => null)) as HomepageData | null;
  const heroTitle = data?.heroTitle || 'Welcome to DPRIDE International School';
  const headteacherMessage = data?.headteacherMessage || {
    name: 'Maryam Salihu Mohammed',
    message:
      'DPRIDE International School, Abuja provides high-quality western education while nurturing strong moral values. We help every child grow through academic excellence, character development, and a caring learning environment.',
  };
  const newsItems = data?.news || [];
  const openMornings = data?.openMornings;

  return (
    <main className="min-h-screen">
      <Hero />

      <section className="py-16 bg-white">
        <Container>
          <SectionHeader title={heroTitle} align="center" />
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
            Discover what makes our school the perfect environment for your child&apos;s growth and success.
          </p>
        </Container>
      </section>

      <Welcome message={headteacherMessage.message} name={headteacherMessage.name} />

      {newsItems.length > 0 && (
        <section className="py-20 bg-white">
          <Container>
            <SectionHeader title="Latest News" align="center" />
            <News items={newsItems} />
          </Container>
        </section>
      )}

      <OpenMornings
        title={openMornings?.title}
        description={openMornings?.description}
        dates={openMornings?.dates}
        bookingRequired={openMornings?.bookingRequired}
      />
    </main>
  );
}
