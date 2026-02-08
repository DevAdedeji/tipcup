<script setup lang="ts">
import { usePageMeta } from '~/composables/usePageMeta'

usePageMeta({
  title: 'Home',
  description: 'Accept support. Start a membership. Setup a shop. It’s easier than you think.',
})
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="TipCup Logo" class="w-8 h-8 object-contain" />
          <span class="font-bold text-xl tracking-tight">TipCup</span>
        </div>
        <div class="flex items-center gap-4">
          <Button variant="outline" class="hidden sm:inline-flex">Log in</Button>
          <Button>Start my page</Button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="relative py-20 lg:pt-[120px] px-6">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        <!-- Text Content -->
        <div class="space-y-8 animate-fade-in-up">
          <Badge variant="secondary" class="animate-pulse-slow">
            <span class="mr-2">🎉</span> Now available in beta
          </Badge>

          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            Accept support.<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
              Fuel your passion.
            </span>
          </h1>

          <p class="text-xl text-text-secondary max-w-lg leading-relaxed">
            The simplest way for creators to receive support, sell extras, and build a membership.
          </p>

          <div class="flex flex-wrap items-center gap-4 pt-4">
            <div class="relative group">
              <div class="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <Button size="lg" class="relative w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-primary/20">
                Start my page
              </Button>
            </div>
            <Button size="lg" variant="outline" class="w-full sm:w-auto h-14 px-8 text-lg border-2 hover:bg-surface">
              View demo
            </Button>
          </div>

          <div class="flex items-center gap-4 text-sm text-text-secondary pt-4">
            <div class="flex -space-x-2">
              <Avatar src="https://i.pravatar.cc/100?img=1" size="sm" class="border-2 border-background" />
              <Avatar src="https://i.pravatar.cc/100?img=2" size="sm" class="border-2 border-background" />
              <Avatar src="https://i.pravatar.cc/100?img=3" size="sm" class="border-2 border-background" />
            </div>
            <p>Join 10,000+ creators</p>
          </div>
        </div>

        <!-- Hero Visual / Mockup -->
        <div class="relative hidden lg:block perspective-1000">
          <div class="relative z-10 bg-surface border border-white/10 rounded-2xl shadow-2xl p-6 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out-expo">
             <!-- Mock Profile Header -->
             <div class="flex items-center gap-4 mb-6">
                <Avatar src="https://i.pravatar.cc/150?img=32" size="lg" class="ring-4 ring-background shadow-lg" />
                <div>
                   <h3 class="font-bold text-lg">Sarah's Art</h3>
                   <p class="text-text-secondary text-sm">Thinking about pixels & paint 🎨</p>
                </div>
             </div>

             <!-- Mock Support Tiers -->
             <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="bg-primary/10 border-2 border-primary rounded-xl p-3 text-center transform scale-105 shadow-lg">
                   <div class="text-xl">☕</div>
                   <div class="font-bold text-primary">$5</div>
                </div>
                <div class="bg-surface-hover border border-border rounded-xl p-3 text-center opacity-70">
                   <div class="text-xl">🍕</div>
                   <div class="font-bold">$10</div>
                </div>
                <div class="bg-surface-hover border border-border rounded-xl p-3 text-center opacity-70">
                   <div class="text-xl">🎉</div>
                   <div class="font-bold">$20</div>
                </div>
             </div>

             <div class="bg-background rounded-xl p-4 border border-border mb-4">
                <div class="h-2 w-1/3 bg-text-secondary/20 rounded mb-2"></div>
                <div class="h-2 w-2/3 bg-text-secondary/10 rounded"></div>
             </div>
             <div class="bg-background rounded-xl p-4 border border-border">
                <div class="h-2 w-1/4 bg-text-secondary/20 rounded mb-2"></div>
                <div class="h-2 w-1/2 bg-text-secondary/10 rounded"></div>
             </div>

             <!-- Floating Elements -->
             <div class="absolute -top-6 -right-6 bg-white text-black font-bold py-2 px-4 rounded-full shadow-xl animate-float delay-100">
                +$5.00
             </div>
             <div class="absolute -bottom-4 -left-4 bg-white text-black font-bold py-2 px-4 rounded-full shadow-xl animate-float delay-300">
                New messsage! 💌
             </div>
          </div>

          <!-- Background Decoration -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent blur-3xl rounded-full -z-10 animate-pulse-slow"></div>
        </div>

      </div>
    </header>

    <!-- Features Section 1: Support Tiers -->
    <section class="py-24 bg-surface border-y border-white/5 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid lg:grid-cols-2 gap-16 items-center">
                <!-- Content -->
                <div class="order-2 lg:order-1 space-y-6">
                    <Badge variant="warning" class="bg-accent/10 text-accent border-accent/20">
                        Flexible Support
                    </Badge>
                    <h2 class="text-4xl lg:text-5xl font-bold">
                        Give your fans <br/> more ways to support.
                    </h2>
                    <p class="text-lg text-text-secondary leading-relaxed">
                        Don't limit yourself to just one button. Create custom support tiers like $5, $10, or $50. Let your biggest fans show their appreciation in a big way.
                    </p>
                    <ul class="space-y-4 pt-4">
                        <li class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <Check class="w-5 h-5" />
                            </div>
                            <span class="text-lg">Accept one-time donations</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <Check class="w-5 h-5" />
                            </div>
                            <span class="text-lg">Sell digital extras</span>
                        </li>
                         <li class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                <Check class="w-5 h-5" />
                            </div>
                            <span class="text-lg">Offer monthly memberships</span>
                        </li>
                    </ul>
                </div>

                <!-- Interactive Demo Visual -->
                <div class="order-1 lg:order-2 relative">
                    <div class="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent blur-3xl -z-10 rounded-full"></div>

                    <div class="bg-background border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                        <div class="text-center space-y-2 pb-6">
                             <h3 class="text-2xl font-bold">Buy me a coffee ☕</h3>
                        </div>

                        <!-- Tiers Selection -->
                        <div class="grid grid-cols-3 gap-4">
                            <button class="group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-primary bg-primary/5 transition-all text-primary shadow-[0_0_20px_rgba(255,107,53,0.15)]">
                                <div class="absolute -top-3 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">Most Popular</div>
                                <span class="text-2xl mb-1">☕</span>
                                <span class="font-bold text-lg">$5</span>
                            </button>
                            <button class="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-surface hover:border-text-secondary/30 transition-all hover:-translate-y-1">
                                <span class="text-2xl mb-1">🍕</span>
                                <span class="font-bold text-lg">$10</span>
                            </button>
                            <button class="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-surface hover:border-text-secondary/30 transition-all hover:-translate-y-1">
                                <span class="text-2xl mb-1">🎉</span>
                                <span class="font-bold text-lg">$25</span>
                            </button>
                        </div>

                        <!-- Input -->
                        <div class="space-y-4">
                            <Input placeholder="Say something nice... (optional)" class="bg-surface" />
                            <Button size="lg" class="w-full text-lg h-12">
                                Support $5
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- Features Section 2: Social Links (Link in Bio) -->
    <section class="py-24 relative">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid lg:grid-cols-2 gap-16 items-center">
                <!-- Visual -->
                 <div class="relative">
                    <div class="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-accent/20 to-transparent blur-2xl -z-10 rounded-full"></div>
                    <!-- Mock Link in Bio Card -->
                    <div class="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                        <!-- Cover Image -->
                        <div class="h-32 bg-gradient-to-r from-primary to-accent relative">
                           <div class="absolute inset-0 bg-black/10"></div>
                        </div>

                        <div class="px-6 pb-8 text-center -mt-12">
                            <Avatar src="https://i.pravatar.cc/150?img=60" size="lg" class="w-24 h-24 border-4 border-surface shadow-md mx-auto mb-4" />
                            <h3 class="font-bold text-xl">Alex The Creator</h3>
                            <p class="text-text-secondary text-sm mb-6">Digital artist & content creator.</p>

                            <div class="space-y-3">
                                <a href="#" class="block bg-background hover:bg-surface-hover border border-border rounded-xl py-3 px-4 font-medium transition-colors flex items-center justify-between group">
                                    <span class="flex items-center gap-3">
                                       <span class="text-primary group-hover:scale-110 transition-transform">📺</span>
                                       Latest YouTube Video
                                    </span>
                                    <ChevronRight class="w-4 h-4 text-text-secondary" />
                                </a>
                                <a href="#" class="block bg-background hover:bg-surface-hover border border-border rounded-xl py-3 px-4 font-medium transition-colors flex items-center justify-between group">
                                    <span class="flex items-center gap-3">
                                       <span class="text-blue-400 group-hover:scale-110 transition-transform">🐦</span>
                                       Follow on Twitter
                                    </span>
                                    <ChevronRight class="w-4 h-4 text-text-secondary" />
                                </a>
                                 <a href="#" class="block bg-background hover:bg-surface-hover border border-border rounded-xl py-3 px-4 font-medium transition-colors flex items-center justify-between group">
                                    <span class="flex items-center gap-3">
                                       <span class="text-pink-500 group-hover:scale-110 transition-transform">📸</span>
                                       Instagram Portfolio
                                    </span>
                                    <ChevronRight class="w-4 h-4 text-text-secondary" />
                                </a>
                            </div>

                            <div class="flex justify-center gap-4 mt-6">
                                <Button size="icon" variant="ghost" class="rounded-full hover:bg-primary/10 hover:text-primary">
                                    <span class="sr-only">Twitter</span>
                                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                                </Button>
                                <Button size="icon" variant="ghost" class="rounded-full hover:bg-primary/10 hover:text-primary">
                                    <span class="sr-only">GitHub</span>
                                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                                </Button>
                            </div>
                        </div>
                    </div>
                 </div>

                <!-- Content -->
                <div class="space-y-6">
                    <Badge variant="secondary" class="bg-primary/10 text-primary border-primary/20">
                        Link in Bio
                    </Badge>
                    <h2 class="text-4xl lg:text-5xl font-bold">
                        One link to rule them all.
                    </h2>
                    <p class="text-lg text-text-secondary leading-relaxed">
                        Claim your personal `tipcup.app/yourname` link. Showcase all your content, social profiles, and support options in one beautiful place.
                    </p>
                    <div class="pt-4">
                        <Button size="lg" variant="secondary" class="gap-2">
                            Claim your link <ChevronRight class="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-surface border-t border-white/5 pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid md:grid-cols-4 gap-12 mb-12">
                <div class="col-span-1 md:col-span-2 space-y-4">
                    <div class="flex items-center gap-2">
                        <img src="/logo.png" alt="TipCup Logo" class="w-6 h-6 object-contain grayscale opacity-70" />
                        <span class="font-bold text-lg tracking-tight opacity-70">TipCup</span>
                    </div>
                    <p class="text-text-secondary max-w-xs">
                        Empowering creators to do what they love, backed by the people who love their work.
                    </p>
                </div>

                <div class="space-y-4">
                    <h4 class="font-bold text-sm uppercase tracking-wider opacity-50">Product</h4>
                    <ul class="space-y-2 text-text-secondary">
                        <li><a href="#" class="hover:text-primary transition-colors">Features</a></li>
                        <li><a href="#" class="hover:text-primary transition-colors">Pricing</a></li>
                        <li><a href="#" class="hover:text-primary transition-colors">Support</a></li>
                    </ul>
                </div>

                <div class="space-y-4">
                    <h4 class="font-bold text-sm uppercase tracking-wider opacity-50">Legal</h4>
                    <ul class="space-y-2 text-text-secondary">
                        <li><a href="#" class="hover:text-primary transition-colors">Privacy</a></li>
                        <li><a href="#" class="hover:text-primary transition-colors">Terms</a></li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-white/5 pt-8 text-center text-text-secondary text-sm">
                &copy; {{ new Date().getFullYear() }} TipCup. All rights reserved.
            </div>
        </div>
    </footer>


  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

.delay-100 { animation-delay: 1s; }
.delay-300 { animation-delay: 3s; }

.perspective-1000 {
  perspective: 1000px;
}
.ease-out-expo {
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
</style>