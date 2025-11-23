import { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'
import api from '@/lib/api'

export interface Task {
    id: string
    content: string
}

export interface Pillar {
    id: string
    content: string
    tasks: Task[]
}

export interface MandalaChartData {
    center: { id: string; content: string }
    pillars: Pillar[]
}

export function useGridData() {
    const [data, setData] = useState<MandalaChartData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetchChart = async () => {
        try {
            const response = await api.get('/goals')
            setData(response.data)
        } catch (error) {
            console.error('Failed to fetch chart:', error)
        } finally {
            setLoading(false)
        }
    }

    // Debounced save function
    const debouncedSave = useCallback(
        debounce(async (newData: MandalaChartData) => {
            setSaving(true)
            try {
                await api.put('/goals', newData)
            } catch (error) {
                console.error('Failed to save chart:', error)
            } finally {
                setSaving(false)
            }
        }, 1000),
        []
    )

    useEffect(() => {
        fetchChart()
    }, [])

    const updateCell = (id: string, content: string) => {
        if (!data) return

        const newData = JSON.parse(JSON.stringify(data)) as MandalaChartData

        // Check center
        if (newData.center.id === id) {
            newData.center.content = content
        } else {
            // Check pillars and tasks
            for (const pillar of newData.pillars) {
                if (pillar.id === id) {
                    pillar.content = content
                    break
                }
                const task = pillar.tasks.find((t) => t.id === id)
                if (task) {
                    task.content = content
                    break
                }
            }
        }

        setData(newData)
        debouncedSave(newData)
    }

    const updateData = (newData: MandalaChartData) => {
        setData(newData)
        debouncedSave(newData)
    }

    return { data, loading, saving, updateCell, setData: updateData }
}
