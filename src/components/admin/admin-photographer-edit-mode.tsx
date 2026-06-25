"use client";

import { Pencil, X } from "lucide-react";
import { createContext, type ReactNode, useContext, useState } from "react";
import { Button } from "@/components/ui/button";

const AdminPhotographerEditModeContext = createContext(false);

export function AdminPhotographerEditModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <AdminPhotographerEditModeContext.Provider value={isEditing}>
      <div className="flex flex-wrap items-center gap-3">
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
      </div>

      {children}
    </AdminPhotographerEditModeContext.Provider>
  );
}

export function useAdminPhotographerEditMode() {
  return useContext(AdminPhotographerEditModeContext);
}
