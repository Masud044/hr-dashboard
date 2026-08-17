// src/features/todo/todo-board.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useHasPermission } from "@/hooks/use-permission";
import axios from "axios";
import { AlertTriangle, PlusIcon, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanOverlay,
} from "@/components/reui/kanban";
import { Badge } from "@/components/reui/badge";
import { TodoCard } from "./todo-card";
import { PRIORITY_META } from "./priority-meta";
import { DeleteTodoDialog } from "./delete-todo-dialog";
import { SectionContainer } from "@/components/SectionContainer";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const COLUMNS = [
  { status: "TODO", label: "To Do", dotClassName: "bg-chart-5" },
  { status: "DONE", label: "Done", dotClassName: "bg-chart-1" },
  { status: "REVIEWED", label: "Reviewed", dotClassName: "bg-primary" },
];

const COLUMN_ORDER = ["TODO", "DONE", "REVIEWED"];

const REORDER_DEBOUNCE_MS = 250;

function groupByStatus(todos) {
  const grouped = { TODO: [], DONE: [], REVIEWED: [] };
  for (const t of todos) {
    (grouped[t.STATUS] ||= []).push(t);
  }
  for (const key of COLUMN_ORDER) {
    grouped[key].sort((a, b) => (a.SORT_ORDER ?? 0) - (b.SORT_ORDER ?? 0));
  }
  return grouped;
}

function flattenColumns(columns) {
  const flat = [];
  for (const key of Object.keys(columns)) {
    for (const item of columns[key] || []) flat.push(item);
  }
  return flat;
}

function diffColumns(prev, next) {
  const payload = [];
  for (const status of COLUMN_ORDER) {
    const nextItems = next[status] || [];
    const prevItems = prev[status] || [];
    nextItems.forEach((item, i) => {
      const prevIndex = prevItems.findIndex((p) => p.TODO_ID === item.TODO_ID);
      if (prevIndex !== i) {
        payload.push({ TODO_ID: item.TODO_ID, STATUS: status, SORT_ORDER: i });
      }
    });
  }
  return payload;
}

function TodoColumn({
  column,
  items,
  canCreate,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onCreate,
}) {
  return (
    <KanbanColumn
      value={column.status}
      className="rounded-lg border border-border bg-muted/20"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <span className={`h-2 w-2 rounded-full ${column.dotClassName}`} />
        <h3 className="text-sm font-semibold text-foreground">
          {column.label}
        </h3>
        <Badge
          variant="secondary"
          radius="full"
          className="ml-auto bg-card text-muted-foreground"
        >
          {items.length}
        </Badge>
      </div>

      <KanbanColumnContent value={column.status} className="flex-1 p-3">
        {items.map((todo) => (
          <TodoCard
            key={todo.TODO_ID}
            todo={todo}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
            <p className="text-caption text-muted-foreground">
              No todos here yet
            </p>
            {column.status === "TODO" && canCreate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-primary"
                onClick={onCreate}
              >
                <PlusIcon size={14} />
                Add your first todo
              </Button>
            )}
          </div>
        )}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

export function TodoBoard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canCreate = useHasPermission("TODO_CREATE");
  const canEdit = useHasPermission("TODO_EDIT");
  const canDelete = useHasPermission("TODO_DELETE");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const prevValueRef = useRef(null);
  const pendingPayloadRef = useRef(null);
  const flushTimeoutRef = useRef(null);

  const {
    data: todos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/todo`);
      return res.data?.data || [];
    },
  });

  const [columnsValue, setColumnsValue] = useState({
    TODO: [],
    DONE: [],
    REVIEWED: [],
  });

  // Local state is the Kanban's source of truth; resync it from the server
  // only when fresh `todos` data actually arrives from react-query (fetch,
  // refetch, or mutation rollback), never on every render.
  useEffect(() => {
    setColumnsValue(groupByStatus(todos));
  }, [todos]);

  const getItemValue = useCallback((item) => item.TODO_ID, []);

  useEffect(() => {
    prevValueRef.current = columnsValue;
  }, [columnsValue]);

  useEffect(
    () => () => {
      if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
    },
    [],
  );

  const reorderMutation = useMutation({
    mutationFn: async ({ payload }) =>
      axios.patch(`${url}/api/todo/reorder`, { items: payload }),
    onMutate: async () => {
      await queryClient.cancelQueries(["todos"]);
      const previous = queryClient.getQueryData(["todos"]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(["todos"], context.previous);
      toast.error("Failed to reorder todos. Please try again.");
    },
    onSettled: () => queryClient.invalidateQueries(["todos"]),
  });

  const flushReorder = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
    if (pendingPayloadRef.current?.length) {
      reorderMutation.mutate({ payload: pendingPayloadRef.current });
      pendingPayloadRef.current = null;
    }
  }, [reorderMutation]);

  const handleValueChange = useCallback(
    (next) => {
      // Update the Kanban's visual state synchronously and immediately —
      // no async round-trip through the query cache before the value lands.
      setColumnsValue(next);

      const prev = prevValueRef.current;
      const payload = diffColumns(prev, next);
      prevValueRef.current = next;

      if (payload.length === 0) return;

      queryClient.setQueryData(["todos"], flattenColumns(next));

      pendingPayloadRef.current = payload;
      if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = setTimeout(flushReorder, REORDER_DEBOUNCE_MS);
    },
    [queryClient, flushReorder],
  );

  const handleDragEnd = useCallback(() => {
    // Deferred so the final same-column reorder (fired synchronously by the
    // Kanban after onDragEnd) is included in the flushed payload.
    setTimeout(flushReorder, 0);
  }, [flushReorder]);

  const handleEdit = (todoId) => {
    navigate(`/dashboard/todo/${todoId}/edit`);
  };

  const handleCreate = () => {
    navigate("/dashboard/todo/create");
  };

  const handleDeleteClick = (todo) => {
    setDeleteTarget(todo);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <SectionContainer variant="dashboard">
        <div className="border rounded-md p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-semibold">Todo Board</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track and move tasks across To Do, Done, and Reviewed.
              </p>
            </div>

            {canCreate && (
              <Button onClick={handleCreate} className="h-10 rounded-md gap-2">
                <PlusIcon size={16} />
                Add Todo
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {COLUMNS.map((col) => (
                <div
                  key={col.status}
                  className="rounded-lg border border-border bg-muted/20"
                >
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="p-3 space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-card border border-border rounded-lg p-4 space-y-2"
                      >
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                Failed to load todos
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                {error?.response?.data?.message ||
                  error?.message ||
                  "Something went wrong while fetching todos."}
              </p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => refetch()}
              >
                <RefreshCw size={16} />
                Retry
              </Button>
            </div>
          ) : (
            <Kanban
              value={columnsValue}
              onValueChange={handleValueChange}
              getItemValue={getItemValue}
              onDragEnd={handleDragEnd}
            >
              <KanbanBoard className="sm:grid-cols-1 md:grid-cols-3">
                {COLUMNS.map((col) => (
                  <TodoColumn
                    key={col.status}
                    column={col}
                    items={columnsValue[col.status]}
                    canCreate={canCreate}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onCreate={handleCreate}
                  />
                ))}
              </KanbanBoard>

              <KanbanOverlay>
                {({ value }) => {
                  const active = todos.find((t) => t.TODO_ID === value);
                  if (!active) return null;
                  const priority =
                    PRIORITY_META[active.PRIORITY] ?? PRIORITY_META[3];
                  return (
                    <div className="w-72 bg-card border border-border rounded-lg shadow-lg p-4">
                      <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
                        {active.TITLE}
                      </h4>
                      {active.DESCRIPTION && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {active.DESCRIPTION}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Badge
                          variant={priority.badgeVariant}
                          radius="full"
                          className={priority.badgeClassName}
                        >
                          {priority.label}
                        </Badge>
                        {active.DUE_DATE && (
                          <time
                            className="text-caption text-muted-foreground"
                            dateTime={active.DUE_DATE}
                          >
                            {active.DUE_DATE}
                          </time>
                        )}
                      </div>
                    </div>
                  );
                }}
              </KanbanOverlay>
            </Kanban>
          )}
        </div>
      </SectionContainer>

      <DeleteTodoDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        todo={deleteTarget}
      />
    </>
  );
}
