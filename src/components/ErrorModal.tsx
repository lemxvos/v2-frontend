import React from "react";

export default function ErrorModal({ open, onClose, title, message }: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title || "Erro no servidor"}</h3>
            <p className="text-sm text-[#666] mt-2">{message || "Ocorreu um erro interno. Tente novamente mais tarde."}</p>
          </div>
          <div>
            <button onClick={onClose} className="text-sm text-[#888] hover:text-white">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
