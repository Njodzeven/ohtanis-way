import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calendar, Loader2 } from "lucide-react"
import { format } from "date-fns"
import api from "@/lib/api"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Chart {
    id: string
    title: string
    updatedAt: string
}

export function History() {
    const navigate = useNavigate()
    const [charts, setCharts] = useState<Chart[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const fetchCharts = async () => {
        try {
            const response = await api.get('/charts')
            setCharts(response.data)
        } catch (error) {
            console.error("Failed to fetch charts:", error)
            toast.error("Failed to load history")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCharts()
    }, [])

    const handleCreateNew = () => {
        navigate("/dashboard")
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await api.delete(`/charts/${deleteId}`)
            setCharts(charts.filter(c => c.id !== deleteId))
            toast.success("Chart deleted")
        } catch (error) {
            console.error("Failed to delete chart:", error)
            toast.error("Failed to delete chart")
        } finally {
            setDeleteId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold tracking-tight">Your Charts</h2>
                    <p className="text-muted-foreground">Manage your Mandala Charts and track your progress.</p>
                </div>
                <Button onClick={handleCreateNew} className="gap-2">
                    <Plus className="w-4 h-4" /> New Chart
                </Button>
            </div>

            {charts.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">No charts found. Start your journey!</p>
                    <Button onClick={handleCreateNew}>Create First Chart</Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {charts.map((chart) => (
                        <Card key={chart.id} className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard?id=${chart.id}`)}>
                            <CardHeader>
                                <CardTitle className="font-serif truncate">{chart.title || "Untitled Chart"}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(chart.updatedAt), "PPP")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-square rounded-md bg-muted/50 border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
                                    Click to Open
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDeleteId(chart.id)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your chart.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
