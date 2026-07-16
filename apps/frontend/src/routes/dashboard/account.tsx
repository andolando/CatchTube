import { useState, useRef } from "react"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { useSession, updateUser, changeEmail, deleteUser } from "@/lib/auth-client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export const Route = createFileRoute("/dashboard/account")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isLoading && !context.auth.isAuthenticated) {
      throw redirect({ to: "/auth" })
    }
  },
  component: AccountPage,
})

function AccountPage() {
  const { data: sessionData, refetch } = useSession()
  const user = sessionData?.user
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasNameChanged = name !== (user?.name ?? "")
  const hasEmailChanged = email !== (user?.email ?? "")

  const updateNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const { error } = await updateUser({ name: newName })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast.success("Name updated successfully")
      refetch()
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const changeEmailMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await changeEmail({ newEmail })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast.success("Verification email sent. Check your inbox.")
      refetch()
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const { error } = await deleteUser({ callbackURL: `${window.location.origin}/auth` })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast.success("Account deleted successfully")
      navigate({ to: "/auth" })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const updateAvatarMutation = useMutation({
    mutationFn: async (image: string) => {
      const { error } = await updateUser({ image })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully")
      setAvatarPreview(null)
      refetch()
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = () => {
    if (avatarPreview) {
      updateAvatarMutation.mutate(avatarPreview)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <Separator />

      {/* Avatar Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your avatar</CardTitle>
          <CardDescription>
            Upload a profile image for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="size-20">
              <AvatarImage
                src={avatarPreview ?? user.image ?? undefined}
                alt={user.name ?? undefined}
              />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="max-w-60"
                onChange={handleFileSelect}
              />
              <Button
                size="sm"
                onClick={handleSaveAvatar}
                disabled={!avatarPreview || updateAvatarMutation.isPending}
              >
                {updateAvatarMutation.isPending ? "Saving..." : "Save avatar"}
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Square images work best.
          </p>
        </CardContent>
      </Card>

      {/* Display Name Card */}
      <Card>
        <CardHeader>
          <CardTitle>Display name</CardTitle>
          <CardDescription>
            This name appears on your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={() => updateNameMutation.mutate(name)}
            disabled={!hasNameChanged || updateNameMutation.isPending}
          >
            {updateNameMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Email Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>
            Change the email address used for login and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={() => changeEmailMutation.mutate(email)}
            disabled={!hasEmailChanged || changeEmailMutation.isPending}
          >
            {changeEmailMutation.isPending ? "Sending..." : "Change email"}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently delete your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                  <br />
                  Your account and all associated data will be permanently
                  deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteAccountMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault()
                    deleteAccountMutation.mutate()
                  }}
                >
                  {deleteAccountMutation.isPending ? "Deleting..." : "Delete account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
