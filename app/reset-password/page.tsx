import { redirect } from "next/navigation";

export default function ResetPasswordPage() {
  redirect("/sign-in?message=Password reset is currently unavailable. Please create a new account or contact UniBridge support.");
}
