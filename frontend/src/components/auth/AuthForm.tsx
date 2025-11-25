import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"

interface AuthFormProps {
    onSuccess: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/register"
            const response = await api.post(endpoint, { email, password })

            if (response.data.access_token) {
                localStorage.setItem("token", response.data.access_token)
                onSuccess()
            } else if (isLogin === false) {
                // If register success but no token (depends on backend implementation), try login
                const loginRes = await api.post("/auth/login", { email, password })
                if (loginRes.data.access_token) {
                    localStorage.setItem("token", loginRes.data.access_token)
                    onSuccess()
                }
            }
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="font-serif text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
                <CardDescription>
                    {isLogin ? "Enter your credentials to access your chart." : "Sign up to start your journey."}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m.ohtani@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            className="bg-background/50"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-6">
                    <Button type="submit" className="w-full font-serif" disabled={loading}>
                        {loading ? "Loading..." : (isLogin ? "Login" : "Register")}
                    </Button>
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-muted-foreground"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
