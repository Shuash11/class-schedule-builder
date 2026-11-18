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
import { signInWithPassword } from '../services/auth.js'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').pipe(z.email('Enter a valid email address.')),
  password: z.string().min(1, 'Password is required.'),
})

export default function LoginPage() {
  const [authError, setAuthError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    setAuthError(null)
    try {
      await signInWithPassword(values)
      // Session state change redirects to /dashboard.
    } catch (error) {
      setAuthError(error.message)
    }
  }

  return (
    <AuthShell
      subtitle="Sign in to build your weekly schedule."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create one
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
          autoComplete="off"
          error={errors.password?.message}
          {...register('password')}
        />
        {authError && (
          <Alert variant="error" role="alert">
            {authError}
          </Alert>
        )}
        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  )
}
