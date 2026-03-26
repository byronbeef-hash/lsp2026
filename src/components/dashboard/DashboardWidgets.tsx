"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { GlassCard, GlassButton } from "@/components/glass";
import {
  GripVertical,
  Eye,
  EyeOff,
  X,
  Plus,
  RotateCcw,
  Settings2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

export interface WidgetDefinition {
  id: string;
  title: string;
  icon: React.ElementType;
  defaultVisible: boolean;
  defaultOrder: number;
}

interface DashboardWidgetsProps {
  widgets: WidgetDefinition[];
  children: Record<string, ReactNode>;
}

// ─── Constants ──────────────────────────────────────────────

const STORAGE_KEY_ORDER = "dashboard-widget-order";
const STORAGE_KEY_HIDDEN = "dashboard-hidden-widgets";

// ─── Component ──────────────────────────────────────────────

export function DashboardWidgets({ widgets, children }: DashboardWidgetsProps) {
  const [editMode, setEditMode] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [hiddenWidgets, setHiddenWidgets] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dragCounter = useRef<Record<string, number>>({});

  // ── Load from localStorage ──────────────────────────────
  useEffect(() => {
    const defaultOrder = widgets
      .sort((a, b) => a.defaultOrder - b.defaultOrder)
      .map((w) => w.id);

    try {
      const savedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
      const savedHidden = localStorage.getItem(STORAGE_KEY_HIDDEN);

      if (savedOrder) {
        const parsed: string[] = JSON.parse(savedOrder);
        // Ensure all widget IDs are present (handle new widgets added after save)
        const validIds = new Set(widgets.map((w) => w.id));
        const filteredOrder = parsed.filter((id) => validIds.has(id));
        const missingIds = defaultOrder.filter(
          (id) => !filteredOrder.includes(id)
        );
        setWidgetOrder([...filteredOrder, ...missingIds]);
      } else {
        setWidgetOrder(defaultOrder);
      }

      if (savedHidden) {
        const parsed: string[] = JSON.parse(savedHidden);
        setHiddenWidgets(new Set(parsed));
      } else {
        const defaultHidden = widgets
          .filter((w) => !w.defaultVisible)
          .map((w) => w.id);
        setHiddenWidgets(new Set(defaultHidden));
      }
    } catch {
      setWidgetOrder(defaultOrder);
    }

    setIsInitialized(true);
  }, [widgets]);

  // ── Persist to localStorage ─────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(widgetOrder));
  }, [widgetOrder, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(
      STORAGE_KEY_HIDDEN,
      JSON.stringify(Array.from(hiddenWidgets))
    );
  }, [hiddenWidgets, isInitialized]);

  // ── Drag and Drop Handlers ──────────────────────────────
  const handleDragStart = useCallback(
    (e: React.DragEvent, widgetId: string) => {
      setDraggedId(widgetId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", widgetId);

      // Make ghost semi-transparent
      if (e.currentTarget instanceof HTMLElement) {
        requestAnimationFrame(() => {
          if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = "0.4";
          }
        });
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      setDraggedId(null);
      setDragOverId(null);
      dragCounter.current = {};
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = "1";
      }
    },
    []
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent, widgetId: string) => {
      e.preventDefault();
      dragCounter.current[widgetId] = (dragCounter.current[widgetId] || 0) + 1;
      if (widgetId !== draggedId) {
        setDragOverId(widgetId);
      }
    },
    [draggedId]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent, widgetId: string) => {
      e.preventDefault();
      dragCounter.current[widgetId] = (dragCounter.current[widgetId] || 0) - 1;
      if (dragCounter.current[widgetId] <= 0) {
        dragCounter.current[widgetId] = 0;
        if (dragOverId === widgetId) {
          setDragOverId(null);
        }
      }
    },
    [dragOverId]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData("text/plain");
      if (!sourceId || sourceId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        dragCounter.current = {};
        return;
      }

      setWidgetOrder((prev) => {
        const newOrder = [...prev];
        const sourceIndex = newOrder.indexOf(sourceId);
        const targetIndex = newOrder.indexOf(targetId);
        if (sourceIndex === -1 || targetIndex === -1) return prev;

        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceId);
        return newOrder;
      });

      setDraggedId(null);
      setDragOverId(null);
      dragCounter.current = {};
    },
    []
  );

  // ── Widget visibility ───────────────────────────────────
  const toggleVisibility = useCallback((widgetId: string) => {
    setHiddenWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  }, []);

  const hideWidget = useCallback((widgetId: string) => {
    setHiddenWidgets((prev) => {
      const next = new Set(prev);
      next.add(widgetId);
      return next;
    });
  }, []);

  const showWidget = useCallback((widgetId: string) => {
    setHiddenWidgets((prev) => {
      const next = new Set(prev);
      next.delete(widgetId);
      return next;
    });
  }, []);

  // Listen for toggle event from TopNav
  useEffect(() => {
    const handler = () => {
      setEditMode((prev) => {
        if (prev) setTrayOpen(false);
        return !prev;
      });
    };
    window.addEventListener("toggle-dashboard-edit", handler);
    return () => window.removeEventListener("toggle-dashboard-edit", handler);
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultOrder = widgets
      .sort((a, b) => a.defaultOrder - b.defaultOrder)
      .map((w) => w.id);
    const defaultHidden = widgets
      .filter((w) => !w.defaultVisible)
      .map((w) => w.id);
    setWidgetOrder(defaultOrder);
    setHiddenWidgets(new Set(defaultHidden));
  }, [widgets]);

  // ── Widget lookup ───────────────────────────────────────
  const widgetMap = new Map(widgets.map((w) => [w.id, w]));
  const hiddenWidgetList = widgetOrder.filter((id) => hiddenWidgets.has(id));
  const visibleWidgetOrder = widgetOrder.filter(
    (id) => !hiddenWidgets.has(id)
  );

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="relative">
      {/* Edit mode listens for custom event from TopNav */}
      <input type="hidden" id="dashboard-edit-mode" data-active={editMode ? "true" : "false"} />

      {/* ── Edit Mode Bar ────────────────────────────────── */}
      {editMode && (
        <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl animate-fade-in-up" style={{ background: "rgba(0,0,40,0.9)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-white/50" />
            <span className="text-sm font-semibold text-white/80">Editing Dashboard — drag to reorder, hide or remove widgets</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditMode(false); setTrayOpen(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-semibold border border-emerald-500/30 transition-all duration-200 cursor-pointer z-50 relative"
          >
            ✓ Save & Exit
          </button>
        </div>
      )}

      {/* ── Widget List ──────────────────────────────────── */}
      <div className="space-y-6">
        {visibleWidgetOrder.map((widgetId) => {
          const widget = widgetMap.get(widgetId);
          if (!widget || !children[widgetId]) return null;

          const isDragging = draggedId === widgetId;
          const isDragOver = dragOverId === widgetId && draggedId !== widgetId;

          return (
            <div
              key={widgetId}
              draggable={editMode}
              onDragStart={editMode ? (e) => handleDragStart(e, widgetId) : undefined}
              onDragEnd={editMode ? handleDragEnd : undefined}
              onDragEnter={editMode ? (e) => handleDragEnter(e, widgetId) : undefined}
              onDragLeave={editMode ? (e) => handleDragLeave(e, widgetId) : undefined}
              onDragOver={editMode ? handleDragOver : undefined}
              onDrop={editMode ? (e) => handleDrop(e, widgetId) : undefined}
              className={`
                transition-all duration-200 rounded-2xl
                ${editMode ? "relative" : ""}
                ${isDragging ? "opacity-40 scale-[0.98]" : ""}
                ${
                  isDragOver
                    ? "ring-2 ring-blue-400/60 ring-offset-2 ring-offset-[#000030]"
                    : ""
                }
                ${editMode && !isDragging ? "border-2 border-dashed border-white/20 p-1" : ""}
              `}
            >
              {/* Edit mode header bar */}
              {editMode && (
                <div className="flex items-center justify-between px-3 py-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-white/10 transition-colors"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5 text-white/50" />
                    </div>
                    <widget.icon className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-medium text-white/60">
                      {widget.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleVisibility(widgetId)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Toggle visibility"
                    >
                      <Eye className="w-4 h-4 text-white/50" />
                    </button>
                    <button
                      onClick={() => hideWidget(widgetId)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Remove from dashboard"
                    >
                      <X className="w-4 h-4 text-white/50 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* Widget content */}
              {children[widgetId]}
            </div>
          );
        })}
      </div>

      {/* ── Widget Tray (Edit Mode) ──────────────────────── */}
      {editMode && (
        <div className="fixed top-0 right-0 z-50 h-full flex items-start pt-20">
          {/* Toggle tray button */}
          <button
            onClick={() => setTrayOpen((prev) => !prev)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-l-xl text-xs font-semibold
              glass-sm border border-r-0 border-white/20 text-white/70 hover:text-white
              transition-all duration-200
              ${trayOpen ? "translate-x-0" : "translate-x-0"}
            `}
          >
            <Plus className="w-3.5 h-3.5" />
            Widgets
            {hiddenWidgetList.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-blue-500/40 text-[10px] flex items-center justify-center text-white font-bold">
                {hiddenWidgetList.length}
              </span>
            )}
          </button>

          {/* Tray panel */}
          <div
            className={`
              h-[calc(100vh-5rem)] w-72 glass border-l border-white/15
              transition-all duration-300 ease-in-out overflow-y-auto
              ${trayOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
            `}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Hidden Widgets
                </h3>
                <button
                  onClick={() => setTrayOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>

              {hiddenWidgetList.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-8">
                  All widgets are visible
                </p>
              ) : (
                <div className="space-y-2">
                  {hiddenWidgetList.map((widgetId) => {
                    const widget = widgetMap.get(widgetId);
                    if (!widget) return null;
                    return (
                      <div
                        key={widgetId}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.06] border border-white/[0.08]"
                      >
                        <div className="flex items-center gap-2.5">
                          <widget.icon className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/70">
                            {widget.title}
                          </span>
                        </div>
                        <button
                          onClick={() => showWidget(widgetId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reset button */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={resetToDefault}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all duration-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
