"use client";

import { Pencil, X } from "lucide-react";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";
import { Button } from "@/components/ui/button";

type AdminPhotographerEditModeContextValue = {
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const AdminPhotographerEditModeContext =
  createContext<AdminPhotographerEditModeContextValue | null>(null);

export function AdminPhotographerEditModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <AdminPhotographerEditModeContext.Provider
      value={{ isEditing, setIsEditing }}
    >
      {children}
    </AdminPhotographerEditModeContext.Provider>
  );
}

function useAdminPhotographerEditModeContext() {
  const context = useContext(AdminPhotographerEditModeContext);

  if (!context) {
    throw new Error(
      "useAdminPhotographerEditMode must be used within an AdminPhotographerEditModeProvider",
    );
  }

  return context;
}

export function useAdminPhotographerEditMode() {
  return useAdminPhotographerEditModeContext().isEditing;
}

export function AdminPhotographerEditModeToggle() {
  const { isEditing, setIsEditing } = useAdminPhotographerEditModeContext();

  return (
    <Button
      type="button"
      variant={isEditing ? "default" : "outline"}
      size="sm"
      onClick={() => setIsEditing((current) => !current)}
    >
      {isEditing ? (
        <>
          <X className="size-3.5" />
          Done editing
        </>
      ) : (
        <>
          <Pencil className="size-3.5" />
          Edit profile
        </>
      )}
    </Button>
  );
}
