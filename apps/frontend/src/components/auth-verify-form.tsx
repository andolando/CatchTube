"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp"
import { useState } from "react"

import { signIn } from "@/lib/auth-client"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"

type AuthVerifyFormProps = React.ComponentProps<"div"> & {
  email: string
}

export function AuthVerifyForm({
  className,
  email,
  ...props
}: AuthVerifyFormProps) {
  const [otp, setOtp] = useState("")
  const navigate = useNavigate()

  const { mutateAsync: loginWithOTP, isPending } = useMutation({
    mutationFn: async ({
      otpInput,
      emailInput,
    }: {
      otpInput: string
      emailInput: string
    }) => {
      const { data, error } = await signIn.emailOtp({
        email: emailInput,
        otp: otpInput,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      toast.success("Connexion réussie")
      navigate({ to: "/dashboard" })
    },
    onError: (error) => {
      toast.error(error.message ?? "Le code OTP est invalide")
    },
  })

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault()

    const otpInput = otp.trim()
    if (!otpInput) {
      toast.error("Veuillez saisir le code reçu")
      return
    }

    await loginWithOTP({ otpInput, emailInput: email.trim() })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleVerifyOtp}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Vérification OTP</h1>
            <FieldDescription>
              Entrez le code de vérification envoyé à
              <br />
              <strong>{email}</strong>
            </FieldDescription>
          </div>

          <Field className="items-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button className="mt-5 w-full" type="submit" disabled={isPending}>
              {isPending ? "Vérification..." : "Vérifier le code"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
