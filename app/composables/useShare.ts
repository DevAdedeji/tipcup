export const useShare = () => {
    const toast = useToast()

    const shareUrl = async (url: string = window.location.href) => {
        try {
            await navigator.clipboard.writeText(url)
            toast.add({ title: 'Copied!', description: 'Link copied to clipboard.', type: 'success' })
        } catch (e) {
            toast.add({ title: 'Error', description: 'Could not copy link.', type: 'error' })
        }
    }

    return {
        shareUrl
    }
}
