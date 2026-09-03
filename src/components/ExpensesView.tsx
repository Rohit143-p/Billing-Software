import React, { useState } from 'react';
import {
  Package,
  Receipt,
  TrendingUp,
  TrendingDown,
  Cloud,
  Briefcase,
  Megaphone,
  Building,
  ChevronDown,
  Plus,
  FileDown,
  CheckCircle2
} from 'lucide-react';
import { Expense, InventoryItem } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  inventory: InventoryItem[];
  currency: string;
  onOpenAddExpense: () => void;
  onRestockItem: (sku: string, addQty: number) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  inventory,
  currency,
  onOpenAddExpense,
  onRestockItem
}) => {
  const [trendRange, setTrendRange] = useState('Last 6 Months');
  const [selectedSkuForRestock, setSelectedSkuForRestock] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const [exportNotice, setExportNotice] = useState(false);

  // Expense trend data (6 months)
  const expenseChartData = [
    { month: 'Jan', value: 380, height: 38 },
    { month: 'Feb', value: 420, height: 42 },
    { month: 'Mar', value: 460, height: 46 },
    { month: 'Apr', value: 410, height: 41 },
    { month: 'May', value: 490, height: 49 },
    { month: 'Jun', value: 482.5, height: 48.25 }
  ];

  // Dynamic calculations
  const totalMonthlyExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Export report handler
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Type,Item,Category,Amount_or_Qty,Date_or_SKU']
        .concat(
          expenses.map(
            (e) => `Expense,"${e.title}","${e.category}",${e.amount},${e.date}`
          )
        )
        .concat(
          inventory.map(
            (i) => `Inventory,"${i.name}","${i.category}",${i.currentQty},${i.sku}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RevenueFlow_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('cloud') || category.toLowerCase().includes('aws')) {
      return <Cloud className="w-5 h-5" />;
    }
    if (category.toLowerCase().includes('contractor') || category.toLowerCase().includes('engineer')) {
      return <Briefcase className="w-5 h-5" />;
    }
    if (category.toLowerCase().includes('market') || category.toLowerCase().includes('adwords')) {
      return <Megaphone className="w-5 h-5" />;
    }
    return <Building className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block mb-1">
            Capital Outflow & Inventory
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Expenses & Assets
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time asset valuation, operational costs, and inventory monitoring.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            Export Report
          </button>

          <button
            onClick={onOpenAddExpense}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Report exported successfully to CSV format!
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: CURRENT INVENTORY VALUE */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Inventory Valuation
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            {currency}1.24M
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-semibold rounded-md">
            <TrendingUp className="w-3.5 h-3.5" />
            +2.4% vs prior month
          </div>
        </div>

        {/* Card 2: MONTHLY EXPENSES (MTD) */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Expenses (MTD)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            {currency}{totalMonthlyExpenses > 0 ? (totalMonthlyExpenses / 1000).toFixed(1) + 'K' : '482.5K'}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 text-xs font-semibold rounded-md">
            <TrendingDown className="w-3.5 h-3.5" />
            -1.2% outflow rate
          </div>
        </div>
      </div>

      {/* Expense Trends */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Outflow Velocity
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Expense Trends
            </h3>
          </div>

          <div className="relative">
            <select
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 px-3 py-1.5 pr-8 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last 12 Months">Last 12 Months</option>
              <option value="Current Quarter">Current Quarter</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Chart with Y-axis ticks */}
        <div className="relative pt-2 pb-1">
          <div className="flex items-stretch gap-2">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between text-xs font-medium text-slate-400 py-2 h-44 text-right pr-2">
              <span>{currency}1M</span>
              <span>{currency}500k</span>
              <span>0</span>
            </div>

            {/* SVG Chart area */}
            <div className="flex-1 h-44 relative border-l border-b border-slate-200">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
              >
                {/* Horizontal guide lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#F1F5F9" strokeWidth="1" />

                {/* Bars */}
                {expenseChartData.map((d, idx) => {
                  const barWidth = 34;
                  const barX = 25 + idx * 78;
                  const barHeight = (d.height / 100) * 130;
                  const barY = 150 - barHeight;

                  return (
                    <g key={d.month} className="group cursor-pointer">
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill="#BFDBFE"
                        className="transition-colors hover:fill-blue-600"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Month labels */}
          <div className="flex justify-between items-center pl-12 pr-4 mt-2 text-xs font-medium text-slate-500">
            {expenseChartData.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Expenses by Category */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Drain Allocation
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Top Expenses by Category
            </h3>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            + Add New
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {expenses.slice(0, 4).map((exp) => (
            <div
              key={exp.id}
              className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2.5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  {getCategoryIcon(exp.title)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">
                    {exp.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exp.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-slate-900">
                  {currency}{exp.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
                Threshold Surveillance
              </span>
              <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Low Stock Alerts
              </h3>
            </div>
            <span className="bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase mt-3">
              Action Required
            </span>
          </div>

          <button
            onClick={() => setSelectedSkuForRestock(inventory[0]?.sku || null)}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Manage
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200 pb-2">
                <th className="pb-2 font-semibold">Item / SKU</th>
                <th className="pb-2 text-center font-semibold">Current Qty</th>
                <th className="pb-2 text-right font-semibold">Reorder Pt</th>
                <th className="pb-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.slice(0, 3).map((item) => {
                const isCritical = item.currentQty <= item.reorderPt / 2;
                return (
                  <tr key={item.sku} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pr-2">
                      <p className="font-semibold text-sm text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        SKU: {item.sku}
                      </p>
                    </td>

                    <td className="py-3.5 text-center">
                      <span
                        className={`font-bold text-sm ${
                          isCritical ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        {item.currentQty}
                      </span>
                    </td>

                    <td className="py-3.5 text-right text-xs text-slate-600">
                      {item.reorderPt}
                    </td>

                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedSkuForRestock(item.sku)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Mini Modal */}
      {selectedSkuForRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-in zoom-in-95">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block mb-1">
                Restock Protocol
              </span>
              <h4 className="font-editorial text-2xl font-bold text-slate-900">
                Restock Inventory
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Inbound inventory units for SKU: <span className="font-semibold text-slate-900">{selectedSkuForRestock}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantity to Add
              </label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedSkuForRestock(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRestockItem(selectedSkuForRestock, restockQty);
                  setSelectedSkuForRestock(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
