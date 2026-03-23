"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassInput,
  GlassSelect,
  GlassButton,
  GlassBadge,
} from "@/components/glass";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit,
  Calendar,
  X,
  Save,
  ListTodo,
} from "lucide-react";
import type { TodoItem } from "@/types";
import { useTodoStore } from "@/stores/modules";

type StatusFilter = "all" | "active" | "completed";
type PriorityFilter = "all" | "high" | "medium" | "low";

const priorityBadgeVariant = (
  priority: TodoItem["priority"]
): "danger" | "warning" | "success" => {
  switch (priority) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "success";
  }
};

export default function TodoPage() {
  const { todos, addTodo, updateTodo, deleteTodo, toggleComplete } = useTodoStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [newTodo, setNewTodo] = useState({
    title: "",
    priority: "medium" as TodoItem["priority"],
    due_date: "",
  });

  const filtered = todos.filter((todo) => {
    if (statusFilter === "active" && todo.completed) return false;
    if (statusFilter === "completed" && !todo.completed) return false;
    if (priorityFilter !== "all" && todo.priority !== priorityFilter)
      return false;
    return true;
  });

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) return;
    await addTodo({
      title: newTodo.title,
      description: null,
      priority: newTodo.priority,
      completed: false,
      due_date: newTodo.due_date || null,
    });
    setNewTodo({ title: "", priority: "medium", due_date: "" });
    setShowAddForm(false);
  };

  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = (id: number) => {
    if (editTitle.trim()) {
      updateTodo(id, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleDeleteTodo = (id: number) => {
    deleteTodo(id);
    setDeleteConfirmId(null);
  };

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  const priorityFilters: { value: PriorityFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-white/50 mt-1">Farm task management</p>
        </div>
        <GlassButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Task
        </GlassButton>
      </div>

      {/* Add Task Inline Form */}
      {showAddForm && (
        <GlassCard className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              New Task
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassInput
              label="Title *"
              name="todo_title"
              placeholder="What needs to be done?"
              value={newTodo.title}
              onChange={(e) =>
                setNewTodo((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTodo();
                }
              }}
            />
            <GlassSelect
              label="Priority"
              name="todo_priority"
              value={newTodo.priority}
              onChange={(e) =>
                setNewTodo((prev) => ({
                  ...prev,
                  priority: e.target.value as TodoItem["priority"],
                }))
              }
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
            <GlassInput
              label="Due Date"
              name="todo_due_date"
              type="date"
              value={newTodo.due_date}
              onChange={(e) =>
                setNewTodo((prev) => ({ ...prev, due_date: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end">
            <GlassButton
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleAddTodo}
            >
              Add Task
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Filters */}
      <div
        className="space-y-3 animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === f.value
                  ? "bg-white/20 text-white border border-white/20"
                  : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1" />
          {priorityFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setPriorityFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                priorityFilter === f.value
                  ? "bg-white/20 text-white border border-white/20"
                  : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-2">
        {filtered.map((todo, index) => (
          <GlassCard
            key={todo.id}
            className="animate-fade-in-up"
            style={
              {
                animationDelay: `${100 + index * 40}ms`,
              } as React.CSSProperties
            }
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(todo.id)}
                className="mt-0.5 flex-shrink-0 text-white/40 hover:text-emerald-400 transition-colors"
              >
                {todo.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editingId === todo.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="glass-input text-sm flex-1"
                      autoFocus
                    />
                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => saveEdit(todo.id)}
                    >
                      Save
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </GlassButton>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-medium text-sm ${
                          todo.completed
                            ? "line-through text-white/40"
                            : "text-white"
                        }`}
                      >
                        {todo.title}
                      </h3>
                      <GlassBadge variant={priorityBadgeVariant(todo.priority)}>
                        {todo.priority}
                      </GlassBadge>
                    </div>
                    {todo.description && (
                      <p
                        className={`text-xs mt-1 ${
                          todo.completed ? "text-white/30" : "text-white/50"
                        }`}
                      >
                        {todo.description}
                      </p>
                    )}
                    {todo.due_date && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3 h-3 text-white/40" />
                        <span
                          className={`text-xs ${
                            !todo.completed &&
                            new Date(todo.due_date) < new Date()
                              ? "text-red-400"
                              : "text-white/40"
                          }`}
                        >
                          {todo.due_date}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              {editingId !== todo.id && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEditing(todo)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {deleteConfirmId === todo.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-lg bg-white/10 text-white/50 text-xs hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(todo.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="text-center py-12 animate-fade-in-up">
          <ListTodo className="w-10 h-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/50 text-sm">No tasks found</p>
          <p className="text-white/30 text-xs mt-1">
            {statusFilter !== "all" || priorityFilter !== "all"
              ? "Try changing your filters"
              : "Add a new task to get started"}
          </p>
        </GlassCard>
      )}
    </div>
  );
}
