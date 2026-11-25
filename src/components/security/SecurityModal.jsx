import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import { useCardContext } from '../../context/CardContext';
import {
  ShieldCheck,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function SecurityModal({ isOpen, onClose }) {
  const {
    exportDataJSON,
    importDataJSON,
    resetToSampleData,
    clearAllData,
  } = useCardContext();

  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cardvault_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = importDataJSON(content);
      setImportStatus(res);
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Security & Privacy Policy"
      subtitle="Section 7 Architecture & Compliance Verification"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Architecture Notice */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-indigo-200/90 leading-relaxed">
            <h4 className="font-bold text-white text-sm mb-1">
              Personal Card Organizer — Zero-Knowledge Guarantee
            </h4>
            CardVault is strictly a personal organizer for card perks, offers, and reward values. It is completely disconnected from banks and payment gateways.
          </div>
        </div>

        {/* Security Principles Checklist */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Security & Privacy Safeguards (Section 7)
          </span>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong>Last 4 Digits Only:</strong> Full 16-digit card numbers are never accepted or stored.
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong>Zero Sensitive Credentials:</strong> CVV, PIN, OTP, and banking passwords are never requested.
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong>No Bank/Payment API Connections:</strong> No live banking connections or financial transactions.
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong>Strict Input Validation:</strong> All numerical inputs, lengths, and formats are validated client-side.
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong>Local Storage Isolation:</strong> All data is stored on your device and never uploaded to public servers.
              </span>
            </div>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Data Backup & Privacy Controls
          </span>

          {importStatus && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Encrypted JSON Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore from Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Reset all cards, offers, and rewards to sample demo data?')) {
                  resetToSampleData();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Sample Data</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to completely erase all stored card and offer data?')) {
                  clearAllData();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Vault Storage</span>
            </button>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
