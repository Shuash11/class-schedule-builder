import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Alert from '../../../components/ui/Alert.jsx'
import Button from '../../../components/ui/Button.jsx'
import Input from '../../../components/ui/Input.jsx'
import AuthShell from '../components/AuthShell.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { signUp } from '../services/auth.js'

const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required.').pipe(z.email('Enter a valid email address.')),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const [authError, setAuthError] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values) => {
    setAuthError(null)
    setInfoMessage(null)
    try {
      const { emailConfirmed } = await signUp(values)
      if (!emailConfirmed) {
        // Email confirmation is enabled on the project — tell the user.
        setInfoMessage(
          `We sent a confirmation link to ${values.email}. Check your inbox, then sign in.`,
        )
      }
      // With a session, the auth state change redirects to /dashboard.
    } catch (error) {
      setAuthError(error.message)
    }
  }

  return (
    <AuthShell
      subtitle="Create your account to start planning."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          helper="Use at least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        {authError && (
          <Alert variant="error" role="alert">
            {authError}
          </Alert>
        )}
        {infoMessage && (
          <Alert variant="info" role="status">
            {infoMessage}
          </Alert>
        )}
        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthShell>
  )
}
