export interface Toast {
    id: string
    title: string
    description?: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

export const useToast = () => {
    const toasts = useState<Toast[]>('toasts', () => [])

    const add = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast = { ...toast, id }
        toasts.value.push(newToast)

        if (toast.duration !== 0) {
            setTimeout(() => {
                remove(id)
            }, toast.duration || 3000)
        }
        return id
    }

    const remove = (id: string) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    return {
        toasts,
        add,
        remove
    }
}
