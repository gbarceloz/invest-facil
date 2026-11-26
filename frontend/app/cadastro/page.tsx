import { redirect } from "next/navigation";

/**
 * O cadastro tradicional foi substituído pelo onboarding conversacional.
 * Mantemos a rota antiga como redirecionamento para não quebrar links.
 */
export default function RegisterPage() {
  redirect("/comecar");
}
