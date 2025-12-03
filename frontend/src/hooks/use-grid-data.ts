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

interface UseGridDataOptions {
    mode?: 'api' | 'guest' | 'static'
    initialData?: MandalaChartData
    chartId?: string | null
}

const GUEST_STORAGE_KEY = 'ohtani_guest_data'

const createEmptyGrid = (): MandalaChartData => {
    return {
        center: { id: 'center', content: '' },
        pillars: Array.from({ length: 8 }, (_, i) => ({
            id: `pillar-${i}`,
            content: '',
            tasks: Array.from({ length: 8 }, (_, j) => ({
                id: `pillar-${i}-task-${j}`,
                content: ''
            }))
        }))
    }
}

export function useGridData({ mode = 'api', initialData, chartId }: UseGridDataOptions = {}) {
    const [data, setData] = useState<MandalaChartData | null>(initialData || null)
    const [loading, setLoading] = useState(mode === 'api')
    const [saving, setSaving] = useState(false)

    const fetchChart = async () => {
        if (mode === 'static') {
            if (initialData) setData(initialData)
            setLoading(false)
            return
        }

        if (mode === 'guest') {
            const stored = localStorage.getItem(GUEST_STORAGE_KEY)
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    // Check expiry (7 days)
                    const now = new Date().getTime()
                    const sevenDays = 7 * 24 * 60 * 60 * 1000
                    if (parsed.timestamp && (now - parsed.timestamp < sevenDays)) {
                        setData(parsed.data)
                    } else {
                        // Expired or invalid format, clear and reset
                        localStorage.removeItem(GUEST_STORAGE_KEY)
                        setData(createEmptyGrid())
                    }
                } catch (e) {
                    console.error("Failed to parse guest data", e)
                    setData(createEmptyGrid())
                }
            } else {
                setData(createEmptyGrid())
            }
            setLoading(false)
            return
        }

        // API Mode
        if (chartId) {
            try {
                const response = await api.get(`/charts/${chartId}`)
                setData(response.data.data) // Assuming backend returns { ...chart, data: Json }
            } catch (error) {
                console.error('Failed to fetch chart:', error)
                setData(createEmptyGrid())
            } finally {
                setLoading(false)
            }
        } else {
            // Default to empty or fetch latest? For now empty if no ID.
            setData(createEmptyGrid())
            setLoading(false)
        }
    }

    // Debounced save function
    const debouncedSave = useCallback(
        debounce(async (newData: MandalaChartData) => {
            if (mode === 'static') return

            setSaving(true)
            try {
                if (mode === 'guest') {
                    const storageData = {
                        data: newData,
                        timestamp: new Date().getTime()
                    }
                    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(storageData))
                    // Simulate network delay for UX
                    await new Promise(resolve => setTimeout(resolve, 500))
                } else if (chartId) {
                    await api.put(`/charts/${chartId}`, { data: newData })
                }
            } catch (error) {
                console.error('Failed to save chart:', error)
            } finally {
                setSaving(false)
            }
        }, 1000),
        [mode, chartId]
    )

    useEffect(() => {
        fetchChart()
    }, [mode, chartId])

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
