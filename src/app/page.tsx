import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Plane, Briefcase, GraduationCap, Globe } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-canada');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-12 lg:py-24 overflow-hidden bg-accent text-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <Globe className="h-10 w-10 text-primary animate-pulse" />
                <div className="flex flex-col">
                  <span className="font-headline text-2xl font-bold tracking-tighter leading-none">JOBS</span>
                  <span className="text-[10px] tracking-[0.3em] font-bold text-primary">IN CANADA</span>
                </div>
              </div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                <span className="mr-2">📢</span>
                2025 Kenyan Intake is Live
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-bold leading-tight uppercase">
                Work in Canada <br/> <span className="text-primary">Fully Sponsored</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-xl">
                The Canadian Labour market is facing severe shortages. Over 196,000 openings for skilled and unskilled workers. Explore categories and find your fit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/jobs" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white px-8 h-14 text-lg font-bold uppercase italic shadow-lg">
                    Browse Available Jobs <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/procedure" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full h-14 text-lg font-bold uppercase">
                    View Recruitment Process
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-4 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Free Air Ticket
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Free Accommodation
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
              {heroImage?.imageUrl ? (
                <Image 
                  src={heroImage.imageUrl} 
                  alt={heroImage.description || 'Canada Landscape'}
                  fill
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -z-0"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-accent font-headline">38,000+</h2>
              <p className="text-muted-foreground uppercase tracking-wider text-xs font-bold">Construction Roles</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-accent font-headline">45,900+</h2>
              <p className="text-muted-foreground uppercase tracking-wider text-xs font-bold">Hospitality Jobs</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-accent font-headline">50,000+</h2>
              <p className="text-muted-foreground uppercase tracking-wider text-xs font-bold">General Workers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Benefits */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-accent uppercase">Why Choose Canada?</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Briefcase, title: "High Earnings", desc: "Start from $69,500 CAD (Ksh 5.3M+) annually." },
              { icon: Plane, title: "Fully Sponsored", desc: "Free Air Ticket, Visa, and Accommodation." },
              { icon: GraduationCap, title: "Family Migration", desc: "Move with spouse and children under 22." },
              { icon: CheckCircle2, title: "Scholarships", desc: "Fully funded further education for you." }
            ].map((item, idx) => (
              <Card key={idx} className="border-none shadow-md hover:translate-y-[-4px] transition-transform">
                <CardHeader>
                  <item.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="font-headline text-lg font-bold uppercase">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-accent rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl border-b-8 border-primary">
            <div className="relative z-10 space-y-6">
              <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase">Ready to fly?</h2>
              <p className="text-xl text-blue-100">
                Deadline: 7th April 2026. Interviews are ongoing.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/jobs">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 h-14 font-bold uppercase">
                    Find Your Job Category
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
