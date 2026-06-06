"use client";

import { useState, useEffect, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import { X, Tag, Palette } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types";
import styles from "./CategoryFormModal.module.css";

// ── Curated icon set ───────────────────────────────────────────────────────
const ICON_OPTIONS = [
  "Home", "ShoppingCart", "Zap", "Car", "Heart", "Utensils", "CreditCard",
  "Briefcase", "Plane", "Dumbbell", "GraduationCap", "Music", "Gift", "Tv",
  "Wifi", "Coffee", "Baby", "Dog", "Wrench", "Landmark", "Shirt", "Pill",
  "TreePine", "Star", "FolderOpen", "Bus", "Bike",
];

// ── Preset color palette (from globals.css design tokens + extras) ─────────
const PRESET_COLORS = [
  "#7C5CFC", "#22C55E", "#F59E0B", "#EF4444",
  "#EC4899", "#3B82F6", "#14B8A6", "#8B5CF6",
  "#6B7280", "#F97316", "#10B981", "#0EA5E9",
];

const MAX_NAME_LENGTH = 50;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CategoryWithCount) => void;
  editingCategory?: CategoryWithCount | null;
}

function IconOption({ name }: { name: string }) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>;
  const Icon = icons[name];
  if (!Icon) return <LucideIcons.Tag size={18} />;
  return <Icon size={18} />;
}

export default function CategoryFormModal({ isOpen, onClose, onSave, editingCategory }: Props) {
  const [name, setName] = useState("");
  const [colorCode, setColorCode] = useState(PRESET_COLORS[0]);
  const [iconRef, setIconRef] = useState(ICON_OPTIONS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setColorCode(editingCategory.colorCode);
      setIconRef(editingCategory.iconRef);
    } else {
      setName("");
      setColorCode(PRESET_COLORS[0]);
      setIconRef(ICON_OPTIONS[0]);
    }
    setError("");
    setLoading(false);
  }, [editingCategory, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("O nome da categoria é obrigatório.");
      return;
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      setError(`O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`);
      return;
    }

    setLoading(true);
    try {
      const isEdit = Boolean(editingCategory);
      const url = isEdit
        ? `/api/categories/${editingCategory!.id}`
        : "/api/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), colorCode, iconRef }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao salvar categoria.");
      }

      onSave(data as CategoryWithCount);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [name, colorCode, iconRef, editingCategory, onSave, onClose]);

  if (!isOpen) return null;

  const isEdit = Boolean(editingCategory);
  const charLeft = MAX_NAME_LENGTH - name.length;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className={styles.header}>
          <h2 id="category-modal-title" className={styles.title}>
            {isEdit ? "Editar Categoria" : "Nova Categoria"}
          </h2>
          <button
            id="modal-close-btn"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && (
            <p className={styles.errorMsg} role="alert" id="category-form-error">
              {error}
            </p>
          )}

          {/* Name field */}
          <div className={styles.field}>
            <label htmlFor="category-name-input" className={styles.label}>
              <Tag size={14} aria-hidden="true" />
              Nome da Categoria
            </label>
            <div className={styles.inputWrap}>
              <input
                id="category-name-input"
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Transporte, Saúde…"
                maxLength={MAX_NAME_LENGTH}
                required
                aria-describedby="name-char-count"
              />
              <span
                id="name-char-count"
                className={`${styles.charCount} ${charLeft <= 10 ? styles.charCountWarn : ""}`}
                aria-live="polite"
              >
                {charLeft}
              </span>
            </div>
          </div>

          {/* Color picker */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Palette size={14} aria-hidden="true" />
              Cor
            </label>
            <div className={styles.colorSection} id="category-color-picker">
              {/* Preset swatches */}
              <div className={styles.colorGrid} role="radiogroup" aria-label="Paleta de cores">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorSwatch} ${colorCode === color ? styles.colorSwatchActive : ""}`}
                    style={{ background: color }}
                    onClick={() => setColorCode(color)}
                    aria-label={`Cor ${color}`}
                    aria-pressed={colorCode === color}
                    id={`color-swatch-${color.replace("#", "")}`}
                  />
                ))}
              </div>
              {/* Custom color input */}
              <div className={styles.customColorRow}>
                <input
                  id="category-color-custom"
                  type="color"
                  className={styles.colorInput}
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  aria-label="Cor personalizada"
                />
                <span className={styles.colorHex}>{colorCode}</span>
              </div>
            </div>
          </div>

          {/* Icon picker */}
          <div className={styles.field}>
            <label className={styles.label}>
              Ícone
            </label>
            <div
              className={styles.iconGrid}
              id="category-icon-picker"
              role="radiogroup"
              aria-label="Seletor de ícone"
            >
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`${styles.iconOption} ${iconRef === icon ? styles.iconOptionActive : ""}`}
                  style={iconRef === icon ? { borderColor: colorCode, color: colorCode, background: `${colorCode}1a` } : {}}
                  onClick={() => setIconRef(icon)}
                  aria-label={icon}
                  aria-pressed={iconRef === icon}
                  title={icon}
                  id={`icon-option-${icon.toLowerCase()}`}
                >
                  <IconOption name={icon} />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Prévia</span>
            <div className={styles.previewCard}>
              <div className={styles.previewAccent} style={{ background: colorCode }} />
              <div className={styles.previewIcon} style={{ color: colorCode }}>
                <IconOption name={iconRef} />
              </div>
              <span className={styles.previewName}>{name || "Nome da categoria"}</span>
              <span
                className={styles.previewSwatch}
                style={{ background: colorCode, boxShadow: `0 0 8px ${colorCode}66` }}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className={styles.actions}>
            <button
              type="button"
              id="modal-cancel-btn"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="modal-save-btn"
              className={styles.saveBtn}
              disabled={loading}
              style={loading ? {} : { background: `linear-gradient(135deg, ${colorCode}, ${colorCode}cc)` }}
            >
              {loading ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar categoria"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
