import { BenefitForm } from '@/components/admin/benefit-form';
import { getFirebaseBenefit } from '@/lib/firebase/benefits';
import { notFound } from 'next/navigation';

interface EditBenefitPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBenefitPage({ params }: EditBenefitPageProps) {
  const { id } = await params;
  const benefit = await getFirebaseBenefit(id);

  if (!benefit) {
    notFound();
  }

  return (
    <div className="space-y-10 pb-20">
      <BenefitForm initialData={benefit} />
    </div>
  );
}
