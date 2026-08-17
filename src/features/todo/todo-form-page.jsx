// src/features/todo/todo-form-page.jsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "DONE", label: "Done" },
  { value: "REVIEWED", label: "Reviewed" },
];

const PRIORITY_OPTIONS = [
  { value: "1", label: "1 - High" },
  { value: "2", label: "2 - Medium" },
  { value: "3", label: "3 - Low" },
];

const todoSchema = z.object({
  TITLE: z.string().min(1, "Title is required"),
  DESCRIPTION: z.string().optional().or(z.literal("")),
  STATUS: z.enum(["TODO", "DONE", "REVIEWED"]),
  PRIORITY: z.coerce.number().min(1).max(3),
  DUE_DATE: z.string().optional().or(z.literal("")),
  REMARKS: z.string().optional().or(z.literal("")),
});

const defaultValues = {
  TITLE: "",
  DESCRIPTION: "",
  STATUS: "TODO",
  PRIORITY: 2,
  DUE_DATE: "",
  REMARKS: "",
};

export function TodoFormPage() {
  const { user } = useAuthV2();
  const navigate = useNavigate();
  const { todoId } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!todoId;

  const form = useForm({
    resolver: zodResolver(todoSchema),
    defaultValues,
  });

  const { data: todoData, isLoading } = useQuery({
    queryKey: ["todo-detail", todoId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/todo`, { params: { todo_id: todoId } });
      return res.data?.data?.[0] || null;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (todoData) {
      form.reset({
        TITLE: todoData.TITLE ?? "",
        DESCRIPTION: todoData.DESCRIPTION ?? "",
        STATUS: todoData.STATUS ?? "TODO",
        PRIORITY: todoData.PRIORITY ?? 2,
        DUE_DATE: todoData.DUE_DATE ? String(todoData.DUE_DATE).slice(0, 10) : "",
        REMARKS: todoData.REMARKS ?? "",
      });
    } else if (!isEdit) {
      form.reset(defaultValues);
    }
  }, [todoData, isEdit, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = { ...formData };
      if (isEdit) {
        payload.TODO_ID = todoId;
        payload.UPDATED_BY = user?.id;
        return axios.put(`${url}/api/todo`, payload);
      }
      payload.CREATED_BY = user?.id;
      return axios.post(`${url}/api/todo`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["todos"]);
      toast.success(`Todo ${isEdit ? "updated" : "created"} successfully!`);
      handleClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} todo.`);
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleClose = () => {
    form.reset(defaultValues);
    navigate(-1);
  };

  return (
    <div className="mx-auto w-full max-w-[500px] py-8 px-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          {isEdit ? "Edit Todo" : "Add New Todo"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit ? "Update the todo's details below." : "Fill in the details to add a new todo."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="TITLE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter todo title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="DESCRIPTION"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} className="resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="STATUS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select modal={false} onValueChange={field.onChange} value={field.value} key={`status-select-${field.value || "empty"}`}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="PRIORITY"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select modal={false} onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)} key={`priority-select-${field.value ?? "empty"}`}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="DUE_DATE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="REMARKS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional remarks" {...field} className="resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : isEdit ? "Update Todo" : "Save Todo"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
