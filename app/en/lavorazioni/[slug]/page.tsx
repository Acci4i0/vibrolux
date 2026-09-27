import { LavorazioneView, lavorazioneMeta, lavorazioneParams } from '@/components/views';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = lavorazioneParams;
export const generateMetadata = async ({ params }: Props) => lavorazioneMeta('en', (await params).slug);

export default async function Lavorazione({ params }: Props) {
  return <LavorazioneView lang="en" slug={(await params).slug} />;
}
