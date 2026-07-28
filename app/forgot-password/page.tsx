import { redirect } from "next/navigation";

export default function ForgotPasswordPage() {
  redirect("/sign-in?message=Password reset is currently unavailable. Please create a new account or contact UniBridge support.");
}
