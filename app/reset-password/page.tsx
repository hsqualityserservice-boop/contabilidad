import { AuthForm } from '@/components/auth-form'

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; error?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, error } = await searchParams
  return <AuthForm mode="reset-password" token={error ? undefined : token} />
}
