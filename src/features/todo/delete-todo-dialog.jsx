// src/features/todo/delete-todo-dialog.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function DeleteTodoDialog({ isOpen, onClose, todo }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${url}/api/todo/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["todos"]);
      toast.success("Todo deleted successfully!");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete todo."),
  });

  const handleDeleteConfirm = () => {
    if (todo?.TODO_ID) deleteMutation.mutate(todo.TODO_ID);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Delete Todo?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {todo?.TITLE ? (
              <>
                <span className="font-medium text-foreground">"{todo.TITLE}"</span>{" "}
                will be permanently deleted. This action cannot be undone.
              </>
            ) : (
              "This will permanently delete the todo. This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} className="border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDeleteConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
