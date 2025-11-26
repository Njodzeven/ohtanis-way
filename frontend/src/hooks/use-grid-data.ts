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

export function useGridData({ mode = 'api', initialData }: UseGridDataOptions = {}) {
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
                setData(JSON.parse(stored))
            } else {
                setData(createEmptyGrid())
            }
            setLoading(false)
            return
        }

        // API Mode
        try {
            const response = await api.get('/goals')
            setData(response.data)
        } catch (error) {
            console.error('Failed to fetch chart:', error)
            // Fallback to empty grid if API fails
            setData(createEmptyGrid())
        } finally {
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
                    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(newData))
                    // Simulate network delay for UX
                    await new Promise(resolve => setTimeout(resolve, 500))
                } else {
                    await api.put('/goals', newData)
                }
            } catch (error) {
                console.error('Failed to save chart:', error)
            } finally {
                setSaving(false)
            }
        }, 1000),
        [mode]
    )

    useEffect(() => {
        fetchChart()
    }, [mode])

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
