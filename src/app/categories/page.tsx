"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import CategoryList from "@/components/CategoryList/CategoryList";
import CategoryFormModal from "@/components/CategoryFormModal/CategoryFormModal";
import type { CategoryWithCount } from "@/lib/types";
import styles from "./page.module.css";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);

  // ── Load categories ────────────────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Falha ao carregar categorias.");
      const data: CategoryWithCount[] = await res.json();
      setCategories(data);
    } catch {
      setError("Não foi possível carregar as categorias. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ── Open modal for create ──────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    setEditingCategory(null);
    setModalOpen(true);
  }, []);

  // ── Open modal for edit (T021/T022) ───────────────────────────────────────
  const handleEdit = useCallback((category: CategoryWithCount) => {
    setEditingCategory(category);
    setModalOpen(true);
  }, []);

  // ── Handle save (create or update) ────────────────────────────────────────
  const handleSave = useCallback((saved: CategoryWithCount) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        // Update existing
        const next = [...prev];
        next[idx] = saved;
        return next.sort((a, b) => a.name.localeCompare(b.name));
      }
      // Insert new, keep sorted
      return [...prev, saved].sort((a, b) => a.name.localeCompare(b.name));
    });
    setModalOpen(false);
    setEditingCategory(null);
  }, []);

  // ── Handle delete (T025) ───────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.status === 403) {
        const data = await res.json();
        setError(data.error ?? "Categorias padrão não podem ser excluídas.");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Falha ao excluir categoria.");
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Falha ao excluir categoria. Tente novamente.");
    }
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setEditingCategory(null);
  }, []);

  return (
    <>
      <main className={styles.page} id="categories-main">
        {/* ── Page header ───────────────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Gerenciar Categorias</h1>
            <p className={styles.pageSubtitle}>
              {categories.length > 0
                ? `${categories.length} ${categories.length === 1 ? "categoria" : "categorias"}`
                : "Organize suas despesas por tipo de gasto"}
            </p>
          </div>
          <button
            id="add-category-btn"
            className={styles.addBtn}
            onClick={handleAdd}
            aria-label="Adicionar nova categoria"
          >
            <Plus size={18} />
            Adicionar Categoria
          </button>
        </header>

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {error && (
          <div className={styles.errorBanner} role="alert" id="categories-error-banner">
            <p>{error}</p>
            <button
              className={styles.errorDismiss}
              onClick={() => setError("")}
              aria-label="Fechar aviso"
              id="dismiss-error-btn"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Content ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className={styles.skeletonGrid} aria-busy="true" aria-label="Carregando categorias">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <CategoryList
            categories={categories}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <CategoryFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        onSave={handleSave}
        editingCategory={editingCategory}
      />
    </>
  );
}
