import { BenefitList } from '@/components/admin/benefit-list';

export default function AdminBenefitsPage() {
  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Beneficios</h1>
        <p className="text-white/40 font-medium tracking-widest uppercase text-xs mt-1">Administración de descuentos y beneficios exclusivos</p>
      </div>
      
      <BenefitList />
    </div>
  );
}
