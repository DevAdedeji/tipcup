import { Twitter, Instagram, Youtube, Linkedin, Globe, Link as LinkIcon, Facebook, Github } from 'lucide-vue-next'

export const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase()
    if (p.includes('twitter')) return Twitter
    if (p.includes('instagram')) return Instagram
    if (p.includes('youtube')) return Youtube
    if (p.includes('linkedin')) return Linkedin
    if (p.includes('website')) return Globe
    if (p.includes('facebook')) return Facebook
    if (p.includes('github')) return Github
    return LinkIcon
}
