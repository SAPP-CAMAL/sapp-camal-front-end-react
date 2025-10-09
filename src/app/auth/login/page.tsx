import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full md:w-4/6 lg:w-1/3">
        <LoginForm />
      </div>
    </div>
  )
}
