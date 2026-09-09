import type { ReactNode } from "react";

/**
 * Full-bleed backdrop shared by every auth screen: black ground, drifting red
 * bloom, centred dialog.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <div className="auth-backdrop" aria-hidden>
        <span className="animate-pulse-glow left-[-6rem] top-[-4rem] size-[26rem]" />
        <span className="animate-pulse-glow right-[-8rem] top-[38%] size-[30rem] [animation-delay:2s]" />
        <span className="animate-pulse-glow bottom-[-8rem] left-[34%] size-[24rem] [animation-delay:4s]" />
      </div>
      {children}
    </main>
  );
}
