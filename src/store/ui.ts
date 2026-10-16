import { create } from "zustand";

export type ToastTone = "default" | "success" | "error";

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: ToastTone;
}

interface UIState {
  toasts: Toast[];
  searchOpen: boolean;
  menuOpen: boolean;
  /** hides the mobile bottom bar (e.g. inside an open conversation) */
  hideNav: boolean;
  /** hides the site chrome for focus flows */
  push: (t: { title: string; body?: string; tone?: ToastTone }) => void;
  dismiss: (id: number) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setHideNav: (v: boolean) => void;
}

let n = 0;

export const useUI = create<UIState>((set, get) => ({
  toasts: [],
  searchOpen: false,
  menuOpen: false,
  hideNav: false,
  push: ({ title, body, tone = "default" }) => {
    const id = ++n;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, title, body, tone }] }));
    setTimeout(() => get().dismiss(id), tone === "error" ? 6000 : 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setSearchOpen: (v) => set({ searchOpen: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
  setHideNav: (v) => set({ hideNav: v }),
}));

export const toast = (title: string, body?: string, tone: ToastTone = "default") => useUI.getState().push({ title, body, tone });
