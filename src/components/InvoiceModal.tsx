import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Building,
  Phone,
  Calendar,
  CalendarPlus,
  Check,
  FileDown,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Bill, BusinessConfig } from '../types';
import { loadSavedBusinessConfig } from '../data/businessPresets';
import { exportSingleBillDueDate } from '../utils/calendarExport';
import {
  downloadInvoicePdf,
  shareInvoicePdf,
  openInvoicePdfPreview
} from '../utils/pdfInvoiceGenerator';

interface InvoiceModalProps {
  bill: Bill | null;
  onClose: () => void;
  onToggleStatus?: (billId: string) => void;
  config?: BusinessConfig;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ bill, onClose, onToggleStatus, config }) => {
  const [isIcsDownloaded, setIsIcsDownloaded] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);

  const activeConfig = config || loadSavedBusinessConfig();

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsPdfGenerating(true);
    try {
      const filename = downloadInvoicePdf(bill, activeConfig);
      setPdfStatusMessage(`Downloaded ${filename}`);
      setTimeout(() => setPdfStatusMessage(null), 3500);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Could not generate PDF. Please try again or use the print option.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleSharePdf = async () => {
    setIsPdfGenerating(true);
    try {
      const result = await shareInvoicePdf(bill, activeConfig);
      if (result.shared && result.method === 'native') {
        setPdfStatusMessage('PDF shared successfully!');
      } else if (result.shared && result.method === 'download') {
        setPdfStatusMessage('PDF downloaded — ready to attach & send!');
      }
      setTimeout(() => setPdfStatusMessage(null), 3500);
    } catch (error) {
      console.error('Failed to share PDF:', error);
      handleDownloadPdf();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePreviewPdf = () => {
    try {
      openInvoicePdfPreview(bill, activeConfig);
    } catch (error) {
      console.error('Failed to preview PDF:', error);
      handleDownloadPdf();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${bill.customerName},\n\nHere is your invoice ${bill.billNumber} from ${activeConfig.businessName} for ${bill.currency}${bill.total.toLocaleString()}.\nStatus: ${bill.status.toUpperCase()}\n\nThank you for your business!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleExportIcs = () => {
    exportSingleBillDueDate(bill);
    setIsIcsDownloaded(true);
    setTimeout(() => setIsIcsDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
              bill.type === 'gst'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}>
              {bill.type === 'gst' ? 'Tax Invoice (GST)' : 'Estimate Memo (Raw)'}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase border ${
              bill.status === 'paid'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
              {bill.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick PDF Download in Header */}
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              title="Download professional PDF invoice"
              className="px-2.5 py-1.5 text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
            >
              {isPdfGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <FileDown className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Calendar Export */}
            <button
              onClick={handleExportIcs}
              title="Export Payment Due Date as .ics for Apple / Google / Outlook Calendar"
              className="px-2.5 py-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              {isIcsDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">Exported</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">.ics</span>
                </>
              )}
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              title="Print Invoice"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              title="Share summary on WhatsApp"
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {pdfStatusMessage && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium">{pdfStatusMessage}</span>
            </div>
            <button
              onClick={() => setPdfStatusMessage(null)}
              className="text-blue-500 hover:text-blue-800 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Invoice Printable Sheet */}
        <div className="p-6 sm:p-8 space-y-6 print:p-0">
          {/* Company & Bill Metadata */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-7 h-7 text-white flex items-center justify-center font-bold text-xs rounded-md shadow-xs"
                  style={{ backgroundColor: activeConfig.brandColor || '#2563eb' }}
                >
                  {activeConfig.brandShort || 'RF'}
                </div>
                <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight">
                  {activeConfig.businessName}
                </h3>
              </div>
              <p className="text-xs text-slate-500">{activeConfig.tagline}</p>
              {activeConfig.taxNumber && (
                <p className="text-xs text-slate-500">{activeConfig.taxLabel || 'Tax ID'}: {activeConfig.taxNumber}</p>
              )}
              <p className="text-xs text-slate-500">{activeConfig.email} {activeConfig.phone ? `• ${activeConfig.phone}` : ''}</p>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">Invoice ID</span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900">{bill.billNumber}</h2>
              <div className="text-xs text-slate-500 mt-1 space-y-1">
                <p><span className="text-slate-400">Date:</span> {bill.date}</p>
                {bill.dueDate && (
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <p><span className="text-slate-400">Due:</span> <span className="font-medium text-slate-700">{bill.dueDate}</span></p>
                    <button
                      onClick={handleExportIcs}
                      title="Add payment due date to your calendar (.ics)"
                      className="inline-flex items-center gap-1 text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
                    >
                      <CalendarPlus className="w-3 h-3" />
                      <span>.ics Cal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To</p>
            <h4 className="font-bold text-base text-slate-900">{bill.customerName}</h4>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-1.5">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> {bill.phoneNumber}
              </span>
              {activeConfig.cityStateZip && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" /> {activeConfig.cityStateZip}
                </span>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 pr-4">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 pl-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {bill.currency}{item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pl-4 text-right font-bold text-slate-900">
                      {bill.currency}{(item.quantity * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{bill.currency}{bill.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            {bill.type === 'gst' && (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%)</span>
                  <span>{bill.currency}{(bill.taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9%)</span>
                  <span>{bill.currency}{(bill.taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {bill.type === 'raw' && (
              <div className="flex justify-between text-slate-400 italic">
                <span>Non-GST (0%)</span>
                <span>{bill.currency}0.00</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span className="font-editorial text-2xl font-bold">Total Due</span>
              <span className="font-editorial text-3xl font-bold text-blue-600">
                {bill.currency}{bill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payment Instructions & Bank Details */}
          {(activeConfig.bankName || activeConfig.upiOrPaypal || activeConfig.footerNote) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Payment Instructions</p>
                {activeConfig.bankName && (
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-500">Bank:</span> {activeConfig.bankName}
                  </p>
                )}
                {activeConfig.accountNumber && (
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-500">A/C:</span> {activeConfig.accountNumber}
                  </p>
                )}
                {activeConfig.routingOrIfsc && (
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-500">Code / Routing:</span> {activeConfig.routingOrIfsc}
                  </p>
                )}
                {activeConfig.upiOrPaypal && (
                  <p className="text-slate-700 font-mono-tag text-[11px]">
                    <span className="font-medium text-slate-500 font-sans">Payment ID:</span> {activeConfig.upiOrPaypal}
                  </p>
                )}
                {activeConfig.paymentNote && (
                  <p className="text-slate-500 text-[11px] mt-1">
                    {activeConfig.paymentNote}
                  </p>
                )}
              </div>
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Notes & Terms</p>
                <p className="text-slate-600 italic leading-relaxed text-[11px]">
                  {activeConfig.footerNote || 'Payment due according to invoice terms. Thank you for your business!'}
                </p>
                {activeConfig.termsAndConditions && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {activeConfig.termsAndConditions}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Channels */}
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-500">Dispatch Channels:</span>
            {bill.delivery.whatsapp && <span className="text-emerald-700 font-medium">✓ WhatsApp</span>}
            {bill.delivery.sms && <span className="text-blue-700 font-medium">✓ SMS</span>}
            {bill.delivery.email && <span className="text-indigo-700 font-medium">✓ Email</span>}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(bill.id)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                bill.status === 'paid'
                  ? 'border-amber-200 text-amber-700 hover:bg-amber-100/50 bg-white'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {bill.status === 'paid' ? 'Mark Unpaid' : '✓ Mark Paid'}
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Native / Direct PDF Share */}
            <button
              onClick={handleSharePdf}
              disabled={isPdfGenerating}
              title="Share PDF invoice directly to WhatsApp, Mail, AirDrop, etc."
              className="px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share PDF</span>
            </button>

            {/* PDF Preview in Tab */}
            <button
              onClick={handlePreviewPdf}
              title="Open PDF preview in new window"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Export Due Date .ics */}
            <button
              onClick={handleExportIcs}
              className="px-3 py-2 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isIcsDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>.ics Exported</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due Date (.ics)</span>
                </>
              )}
            </button>

            {/* Primary Download PDF Action */}
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              {isPdfGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

