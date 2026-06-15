"use client";

import React, { useState, useEffect } from "react";
import Capivara3D from "@/components/Capivara3D/Capivara3D";
import styles from "./AuthProvider.module.css";

// ── Global Fetch Interceptor ────────────────────────────────────────────────
// Dynamically intercepts all client-side fetches to append the active x-user-id header.
function setupFetchInterceptor(userId: string) {
  if (typeof window === "undefined") return;

  // Prevent duplicate interceptors
  if ((window as any).__fetchInterceptorActive) return;
  (window as any).__fetchInterceptorActive = true;

  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    init = init || {};
    init.headers = init.headers || {};

    if (init.headers instanceof Headers) {
      init.headers.set("x-user-id", userId);
    } else if (Array.isArray(init.headers)) {
      init.headers.push(["x-user-id", userId]);
    } else {
      (init.headers as Record<string, string>)["x-user-id"] = userId;
    }

    return originalFetch(input, init);
  };
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form input state
  const [inputVal, setInputVal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("cami_username");
    const storedUserId = localStorage.getItem("cami_user_id");

    if (storedUsername && storedUserId) {
      setUsername(storedUsername);
      setUserId(storedUserId);
      setupFetchInterceptor(storedUserId);
    }
    setLoading(false);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = inputVal.trim();

    if (!cleanName) {
      setErrorMsg("Por favor, insira seu nome de usuário.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanName }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro na autenticação");
      }

      const userData = await res.json();
      
      // Store credentials locally
      localStorage.setItem("cami_username", userData.username);
      localStorage.setItem("cami_user_id", userData.id);

      setUsername(userData.username);
      setUserId(userData.id);
      setupFetchInterceptor(userData.id);

      // Force-reload the page to clear any previous cached client state and bind the fetch interceptor
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || "Não foi possível conectar ao servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("cami_username");
    localStorage.removeItem("cami_user_id");
    // Reload to clear auth state
    window.location.reload();
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Carregando painel...</p>
      </div>
    );
  }

  // If no user session is active, render the welcome identification gate
  if (!username || !userId) {
    return (
      <main className={styles.authContainer} id="auth-gate-root">
        <div className={styles.authCard}>
          <header className={styles.authHeader}>
            <div className={styles.logo3d}>
              <Capivara3D sizeMultiplier={0.7} />
            </div>
            <h1 className={styles.title}>Capivara Poupadora</h1>
            <p className={styles.subtitle}>
              Seu painel financeiro pessoal, moderno e gamificado com capivaras!
            </p>
          </header>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="login-username-input" className={styles.label}>
                Como quer ser chamado?
              </label>
              <input
                type="text"
                id="login-username-input"
                className={styles.input}
                placeholder="Ex: Cami, Marques..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={submitting}
                maxLength={30}
                autoFocus
                required
              />
            </div>

            {errorMsg && (
              <div className={styles.errorContainer} role="alert">
                <span className={styles.errorIcon}>⚠</span>
                <p className={styles.errorText}>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              id="login-submit-button"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? (
                <span className={styles.btnLoading}>Entrando...</span>
              ) : (
                "Entrar no App"
              )}
            </button>
          </form>

          <footer className={styles.authFooter}>
            <p>Seus dados serão salvos de forma segura e persistente.</p>
          </footer>
        </div>
      </main>
    );
  }

  // Inject a small hidden session indicator/logout bar at the top or bottom of layout (discreet layout integration)
  return (
    <>
      <div className={styles.sessionBar}>
        <span className={styles.sessionUser}>
          Conectado como <strong>{username}</strong>
        </span>
        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          title="Sair desta conta"
        >
          Sair
        </button>
      </div>
      {children}
    </>
  );
}
