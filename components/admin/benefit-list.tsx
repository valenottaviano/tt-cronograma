'use client';

import { useState, useEffect } from 'react';
import { Benefit } from '@/lib/data';
import { fetchBenefitsFromSheets, getExistingBenefitsKeys } from '@/lib/firebase/seed-benefits';
import { createBenefit, getFirebaseBenefits, deleteBenefit } from '@/lib/firebase/benefits';
import { Edit2, Trash2, Plus, Gift, Instagram, MessageCircle, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function BenefitList() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    setLoading(true);
    const data = await getFirebaseBenefits();
    setBenefits(data);
    setLoading(false);
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      // 1. Fetch data from Google Sheets (Server Action)
      const fetchResponse = await fetchBenefitsFromSheets();
      if (!fetchResponse.success || !fetchResponse.benefits) {
        throw new Error(fetchResponse.error || 'No se pudieron recuperar los beneficios');
      }

      // 2. Get existing keys to avoid duplicates (Server Action)
      const existingKeys = await getExistingBenefitsKeys();
      const existingSet = new Set(existingKeys);

      let importedCount = 0;
      let skippedCount = 0;

      // 3. Save to Firestore one by one (on Client to use Auth)
      for (const benefit of fetchResponse.benefits) {
        const key = `${benefit.company.toLowerCase()}|${benefit.title.toLowerCase()}`;
        
        if (!existingSet.has(key)) {
          await createBenefit({
            title: benefit.title,
            description: benefit.description,
            company: benefit.company,
            logo: benefit.logo || '',
            linkCta: benefit.linkCta || '',
            instagramLink: benefit.instagramLink || '',
            whatsappLink: benefit.whatsappLink || '',
          });
          importedCount++;
        } else {
          skippedCount++;
        }
      }

      toast.success(`Importación completada: ${importedCount} nuevos, ${skippedCount} omitidos.`);
      fetchBenefits();
    } catch (error) {
      console.error('Error during import:', error);
      toast.error(`Error al importar: ${(error as Error).message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (benefit: Benefit) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el beneficio de "${benefit.company}"?`)) {
      return;
    }

    try {
      await deleteBenefit(benefit.id);
      toast.success('Beneficio eliminado correctamente');
      fetchBenefits();
    } catch (error) {
      console.error('Error deleting benefit:', error);
      toast.error('Error al eliminar el beneficio');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">Beneficios Activos</h2>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Total: {benefits.length} beneficios</p>
        </div>
        <Link
          href="/admin/benefits/new"
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white px-6 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-orange/20 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Nuevo Beneficio
        </Link>
      </div>

      {benefits.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 border-dashed p-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6">
            <Gift className="w-10 h-10 text-white/20" />
          </div>
          <p className="text-white/20 font-black uppercase tracking-[0.2em]">No hay beneficios registrados aún</p>
          <div className="mt-6">
             <button 
                onClick={handleImport}
                disabled={isImporting}
                className="flex items-center gap-2 mx-auto text-xs text-brand-orange font-black uppercase tracking-widest hover:underline disabled:opacity-50"
             >
                {isImporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                {isImporting ? 'Importando...' : '¿Importar desde Google Sheets?'}
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Empresa / Título</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Descripción</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Redes / Links</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {benefits.map((benefit) => (
                  <tr key={benefit.id} className="group hover:bg-white/[0.04] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10 group-hover:border-brand-orange/30 transition-colors flex items-center justify-center">
                          {benefit.logo ? (
                            <Image
                              src={benefit.logo}
                              alt={benefit.company}
                              fill
                              className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <Gift className="w-6 h-6 text-white/10" />
                          )}
                        </div>
                        <div className="max-w-md">
                          <p className="font-black text-lg text-white italic uppercase tracking-tighter leading-tight">{benefit.company}</p>
                          <p className="text-[10px] font-bold text-brand-orange truncate mt-1 tracking-wider uppercase">
                            {benefit.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-white/40 line-clamp-2 max-w-xs font-medium leading-relaxed">
                        {benefit.description}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {benefit.instagramLink && (
                          <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-pink-500 transition-colors" title="Instagram">
                            <Instagram className="w-4 h-4" />
                          </div>
                        )}
                        {benefit.whatsappLink && (
                          <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-green-500 transition-colors" title="WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                        )}
                        {benefit.linkCta && (
                          <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-blue-500 transition-colors" title="Web/CTA">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        )}
                        {!benefit.instagramLink && !benefit.whatsappLink && !benefit.linkCta && (
                          <span className="text-[10px] font-bold text-white/10 uppercase italic">Sin links</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/benefits/${benefit.id}/edit`}
                          className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5 hover:border-white/20"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(benefit)}
                          className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5 hover:border-red-500/20"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
