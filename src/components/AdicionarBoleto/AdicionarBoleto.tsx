"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Calendar, DollarSign, Tag, CreditCard } from "lucide-react";
import styles from "./AdicionarBoleto.module.css";

interface Category {
  id: string;
  name: string;
  colorCode: string;
  iconRef: string;
}

interface Slip {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  isCreditCardPayment: boolean;
  categoryId: string;
  documentPath: string | null;
  category: Category;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slip: Slip) => void;
  editingSlip?: Slip | null;
}

export default function AdicionarBoleto({ isOpen, onClose, onSave, editingSlip }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [categoryId, setCategoryId] = useState("");
  const [isCreditCardPayment, setIsCreditCardPayment] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Load categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingSlip) {
      setTitle(editingSlip.title);
      setAmount(editingSlip.amount.toString());
      setDueDate(editingSlip.dueDate.slice(0, 10));
      setStatus(editingSlip.status);
      setCategoryId(editingSlip.categoryId);
      setIsCreditCardPayment(editingSlip.isCreditCardPayment);
    } else {
      resetForm();
    }
  }, [editingSlip, isOpen]);

  // Auto-focus the title field whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    // Small delay lets the modal finish rendering before focusing
    const id = setTimeout(() => titleInputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [isOpen]);

  function resetForm() {
    setTitle("");
    setAmount("");
    setDueDate("");
    setStatus("PENDENTE");
    setCategoryId(categories[0]?.id ?? "");
    setIsCreditCardPayment(false);
    setFile(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!title.trim()) { setError("Título é obrigatório."); return; }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError("Valor deve ser positivo."); return; }
    if (!dueDate) { setError("Data de vencimento é obrigatória."); return; }
    if (!categoryId) { setError("Selecione uma categoria."); return; }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("amount", parsedAmount.toString());
    formData.append("dueDate", dueDate);
    formData.append("status", status);
    formData.append("isCreditCardPayment", isCreditCardPayment.toString());
    formData.append("categoryId", categoryId);
    if (file) formData.append("document", file);

    setLoading(true);
    try {
      const url = editingSlip ? `/api/slips/${editingSlip.id}` : "/api/slips";
      const method = editingSlip ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar boleto.");
      }

      const saved: Slip = await res.json();
      onSave(saved);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id="form-title" className={styles.title}>
            {editingSlip ? "Editar Boleto" : "Adicionar Boleto"}
          </h2>
          <button
            id="close-modal-btn"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <p className={styles.errorMsg} role="alert">{error}</p>}

          {/* Title */}
          <div className={styles.field}>
            <label htmlFor="slip-title" className={styles.label}>
              <Tag size={14} /> Título
            </label>
            <input
              id="slip-title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Conta de Luz"
              className={styles.input}
              required
            />
          </div>

          {/* Amount */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="slip-amount" className={styles.label}>
                <DollarSign size={14} /> Valor (R$)
              </label>
              <input
                id="slip-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className={styles.input}
                required
              />
            </div>

            {/* Due Date */}
            <div className={styles.field}>
              <label htmlFor="slip-due-date" className={styles.label}>
                <Calendar size={14} /> Vencimento
              </label>
              <input
                id="slip-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="slip-category" className={styles.label}>
                <Tag size={14} /> Categoria
              </label>
              <select
                id="slip-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={styles.input}
                required
              >
                <option value="">Selecionar…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className={styles.field}>
              <label htmlFor="slip-status" className={styles.label}>
                Status
              </label>
              <select
                id="slip-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.input}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
              </select>
            </div>
          </div>

          {/* Credit card toggle */}
          <label className={styles.toggleRow} htmlFor="slip-credit-card">
            <div className={styles.toggleInfo}>
              <CreditCard size={16} />
              <span>Pagamento via cartão de crédito</span>
            </div>
            <div
              id="slip-credit-card"
              role="switch"
              aria-checked={isCreditCardPayment}
              className={`${styles.toggle} ${isCreditCardPayment ? styles.toggleOn : ""}`}
              onClick={() => setIsCreditCardPayment((v) => !v)}
              tabIndex={0}
              onKeyDown={(e) => e.key === " " && setIsCreditCardPayment((v) => !v)}
            >
              <span className={styles.toggleThumb} />
            </div>
          </label>

          {/* File upload */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Upload size={14} /> Documento (PDF/Imagem)
            </label>
            <div
              className={styles.fileDropZone}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files[0];
                if (dropped) setFile(dropped);
              }}
            >
              {file ? (
                <span className={styles.fileName}>📎 {file.name}</span>
              ) : (
                <span className={styles.fileHint}>
                  Arraste ou clique para anexar
                </span>
              )}
            </div>
            <input
              id="slip-document"
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className={styles.hiddenInput}
            />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              id="cancel-slip-btn"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="save-slip-btn"
              className={styles.saveBtn}
              disabled={loading}
            >
              {loading ? "Salvando…" : editingSlip ? "Atualizar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
