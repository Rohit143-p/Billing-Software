import React from 'react';
import { X, Server, Database, Headphones } from 'lucide-react';
import { ProductPerformance } from '../types';

interface AllProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductPerformance[];
  currency: string;
}

export const AllProductsModal: React.FC<AllProductsModalProps> = ({
  isOpen,
  onClose,
  products,
  currency
}) => {
  if (!isOpen) return null;

  const extraProducts: ProductPerformance[] = [
    ...products,
    {
      id: 'prod-4',
      name: 'Custom Domain SSL & CDN',
      metricLabel: '210 Endpoints',
      revenue: 3850,
      iconName: 'storage'
    },
    {
      id: 'prod-5',
      name: 'Multi-Region Failover Pack',
      metricLabel: '15 Clusters',
      revenue: 5200,
      iconName: 'api'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Catalog Performance
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 mt-0.5">
              Products & Services
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Active revenue streams & unit breakdown</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto divide-y divide-slate-100 space-y-1">
          {extraProducts.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-3 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  {p.iconName === 'api' && <Server className="w-5 h-5" />}
                  {p.iconName === 'storage' && <Database className="w-5 h-5" />}
                  {p.iconName === 'support' && <Headphones className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{p.name}</h4>
                  <p className="text-xs text-slate-500">{p.metricLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-slate-900">
                  {currency}{p.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
