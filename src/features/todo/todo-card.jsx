// src/features/todo/todo-card.jsx
import { CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";

import { KanbanItem, KanbanItemHandle } from "@/components/reui/kanban";
import { Badge } from "@/components/reui/badge";
import { PRIORITY_META } from "./priority-meta";

export function TodoCard({ todo, canEdit, canDelete, onEdit, onDelete }) {
  const priority = PRIORITY_META[todo.PRIORITY] ?? PRIORITY_META[3];

  return (
    <KanbanItem
      value={todo.TODO_ID}
      className="bg-card border border-border rounded-lg transition-all duration-200 hover:-translate-y-0.5 "
    >
      <div className="group p-4">
        {/* Handle + title + hover actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 min-w-0 flex-1">
            <KanbanItemHandle
              className="mt-0.5 shrink-0 p-1 -ml-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
              aria-label="Drag to reorder"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </KanbanItemHandle>

            <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-1 break-words">
              {todo.TITLE}
            </h4>
          </div>

          <div className="flex items-center gap-0.5 -mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <button
                onClick={() => onEdit(todo.TODO_ID)}
                title="Edit Todo"
                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all"
              >
                <Pencil size={15} />
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => onDelete(todo)}
                title="Delete Todo"
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {todo.DESCRIPTION && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2" title={todo.DESCRIPTION}>
            {todo.DESCRIPTION}
          </p>
        )}

        {/* Priority badge + due date */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <Badge variant={priority.badgeVariant} radius="full" className={priority.badgeClassName}>
            {priority.label}
          </Badge>

          {todo.DUE_DATE && (
            <time className="text-caption text-muted-foreground" dateTime={todo.DUE_DATE}>
              {todo.DUE_DATE}
            </time>
          )}
        </div>
      </div>
    </KanbanItem>
  );
}