"use client";

import { useState, useMemo } from "react";
import { FolderOpen, Plus, Search, X } from "lucide-react";
import CategoryCard from "@/components/CategoryCard/CategoryCard";
import type { CategoryWithCount } from "@/lib/types";
import styles from "./CategoryList.module.css";

interface Props {
  categories: CategoryWithCount[];
  onAdd: () => void;
  onEdit: (category: CategoryWithCount) => void;
  onDelete: (id: string) => void;
}

const SEARCH_THRESHOLD = 10;

export default function CategoryList({ categories, onAdd, onEdit, onDelete }: Props) {
  const [query, setQuery] = useState("");

  const showSearch = categories.length > SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [categories, query]);

  // ── Empty: no categories at all ──────────────────────────────────────────
  if (categories.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon} aria-hidden="true">
          <FolderOpen size={48} />
        </div>
        <h2 className={styles.emptyTitle}>Nenhuma categoria ainda</h2>
        <p className={styles.emptyHint}>
          Crie categorias para organizar suas despesas por tipo de gasto.
        </p>
        <button
          id="add-category-empty-btn"
          className={styles.addBtn}
          onClick={onAdd}
          aria-label="Criar primeira categoria"
        >
          <Plus size={16} />
          Criar sua primeira categoria
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Search bar — only shown when list exceeds threshold */}
      {showSearch && (
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} aria-hidden="true" />
            <input
              id="category-search-input"
              type="search"
              className={styles.searchInput}
              placeholder="Buscar categoria…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar categorias pelo nome"
            />
            {query && (
              <button
                className={styles.clearSearch}
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                id="clear-search-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state for search results */}
      {filtered.length === 0 ? (
        <div className={styles.searchEmpty}>
          <p className={styles.searchEmptyText}>
            Nenhuma categoria corresponde a &quot;<strong>{query}</strong>&quot;.
          </p>
          <button
            className={styles.clearSearchLink}
            onClick={() => setQuery("")}
            id="clear-search-link-btn"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <ul className={styles.grid} role="list" aria-label="Lista de categorias">
          {filtered.map((category) => (
            <li key={category.id} className={styles.gridItem}>
              <CategoryCard
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
