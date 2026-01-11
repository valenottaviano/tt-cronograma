'use client';

import { useState } from 'react';
import { Product } from '@/lib/firebase/products';
import { OrderInput, createOrder } from '@/lib/firebase/orders';
import { uploadReceipt } from '@/lib/firebase/storage';
import { formatPrice } from '@/components/navbar';
import { X, Upload, CheckCircle2, Loader2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
  product: Product;
  selectedSize: string;
  onClose: () => void;
}

const ALIAS = 'rparodi26';

export function CheckoutModal({ product, selectedSize, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(ALIAS);
    toast.success('Alias copiado al portapapeles');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande (máx 5MB)');
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      toast.error('Debes adjuntar el comprobante de pago');
      return;
    }

    setIsSubmitting(true);
    try {
      const receiptUrl = await uploadReceipt(receiptFile);
      
      const orderData: OrderInput = {
        productId: product.id,
        productName: product.name,
        size: selectedSize,
        totalPrice: product.price,
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerPhone: customerInfo.phone,
        receiptUrl,
      };

      await createOrder(orderData);
      setIsFinished(true);
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Hubo un error al procesar tu compra. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#050505] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">¡Gracias por tu compra!</h2>
            <p className="text-white/60">Recibimos tu comprobante. Procesaremos tu pedido y te contactaremos a la brevedad.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-colors uppercase tracking-widest text-sm"
          >
            Cerrar
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#050505] border border-white/10 rounded-3xl w-full max-w-lg relative overflow-hidden shadow-2xl my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Finalizar Compra</h2>
            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Paso {step} de 2</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Product Summary Short */}
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{product.name}</h3>
                    <p className="text-xs text-white/40">Talle: {selectedSize} • {formatPrice(product.price)}</p>
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="space-y-4">
                  <div className="bg-brand-orange/10 border border-brand-orange/20 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-brand-orange">Datos Transferencia</h4>
                    <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/40 font-bold uppercase">Alias</p>
                        <p className="font-mono text-lg font-bold text-white tracking-wider">{ALIAS}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={handleCopyAlias}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="pt-2">
                       <p className="text-2xl font-black italic tracking-tighter text-center">
                        Total: <span className="text-brand-orange">{formatPrice(product.price)}</span>
                       </p>
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                    <p className="text-xs text-yellow-500/80 font-medium leading-relaxed">
                      * Realizá la transferencia al alias indicado por el total del producto para poder continuar con el pedido.
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 transition-transform active:scale-[0.98] uppercase tracking-widest text-sm shadow-xl"
                >
                  Ya realicé la transferencia
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Nombre</label>
                    <input 
                      type="text" 
                      required
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                      placeholder="Juan"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Apellido</label>
                    <input 
                      type="text" 
                      required
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                      placeholder="Pérez"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Teléfono (WhatsApp)</label>
                  <input 
                    type="tel" 
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="Ej: 11 1234 5678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Comprobante de Pago</label>
                  <label 
                    className={cn(
                      "w-full h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative",
                      receiptFile 
                        ? "border-green-500/50 bg-green-500/5" 
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
                    {receiptFile ? (
                      <div className="text-center p-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-white truncate max-w-[250px]">{receiptFile.name}</p>
                        <p className="text-xs text-white/40 mt-1">Hacé click para cambiar</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <p className="text-sm font-bold text-white/60">Adjuntar archivo</p>
                        <p className="text-xs text-white/30 mt-1">Imagen o PDF (Máx 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white/5 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-colors uppercase tracking-widest text-sm border border-white/10"
                  >
                    Volver
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !receiptFile}
                    className="flex-[2] bg-brand-orange text-white font-black py-4 rounded-2xl hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand-orange/20 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Finalizar Pedido'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}
