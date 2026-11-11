// src/features/selection/selection-form-page.jsx
import React from "react";

import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { SelectionCustomerPage } from "./selection-customer-page";
import { SelectionEditorPage } from "./selection-editor-page";

export function SelectionFormPage() {
  const { user } = useAuthV2();

  if (user?.userType === "OWNER") {
    return <SelectionCustomerPage />;
  }

  return <SelectionEditorPage />;
}
