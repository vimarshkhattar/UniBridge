"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const accountStoragePrefixes = [
  "unibridge.profile",
  "unibridge.demoProfile",
  "unibridge.discoverActions",
  "unibridge.eventActivity",
  "unibridge.connections",
  "unibridge.eventBuddy."
];

export function SettingsControls() {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  function deleteAccountData() {
    Object.keys(window.localStorage)
      .filter((key) => accountStoragePrefixes.some((prefix) => key.startsWith(prefix)))
      .forEach((key) => window.localStorage.removeItem(key));

    setDeleted(true);
    setConfirmingDelete(false);
  }

  return (
    <div className="grid gap-4">
      <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" defaultChecked /> Allow students from my university to discover me</label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" defaultChecked /> Show Stony Brook domain badge when applicable</label>
      <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">Blocked users and report history will appear here as account data is added.</div>

      {deleted && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          Account data cleared from this browser. Refresh or sign in again to start fresh.
        </div>
      )}

      {!confirmingDelete ? (
        <Button type="button" variant="danger" onClick={() => setConfirmingDelete(true)}>
          <Trash2 className="size-4" /> Delete account
        </Button>
      ) : (
        <div className="grid gap-4 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3 text-red-950">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-bold">Confirm account deletion</p>
              <p className="mt-1 text-sm text-red-900">
                This will clear locally cached profile details, saved profiles, requests, connections, event activity, and buddy groups from this browser.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="danger" onClick={deleteAccountData}>
              <Trash2 className="size-4" /> Yes, delete account data
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirmingDelete(false)}>
              <X className="size-4" /> Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
