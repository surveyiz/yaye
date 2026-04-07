import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Plane, Briefcase, GraduationCap } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-canada');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-primary text-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                <span className="mr-2">📢</span>
                Massive Recruitment in Kenya - 2025 Intake
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-bold leading-tight">
                Your Career in Canada Starts Here
              </h1>
              <p className="text-xl text-blue-100 max-w-xl">
                The Canadian Labour market is facing severe shortages. Join over 196,000 economic newcomers this year. Fully sponsored pathways for skilled and unskilled Kenyans.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/apply">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-14 text-lg">
                    Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 text-lg">
                    View 80+ Job Roles
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Free Air Ticket
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Free Accommodation
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Visa Sponsorship
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              {heroImage?.imageUrl && (
                <Image 
                  src={heroImage.imageUrl} 
                  alt={heroImage.description || 'Canada Landscape'}
                  fill
                  className="object-cover"
                  data-ai-hint="canada landscape"
                />
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-3xl -z-0"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-primary font-headline">38,000+</h2>
              <p className="text-muted-foreground">Construction Openings</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-primary font-headline">45,900+</h2>
              <p className="text-muted-foreground">Hospitality Jobs</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-primary font-headline">50,000+</h2>
              <p className="text-muted-foreground">Retail Vacancies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Benefits */}
      <section className="py-24 bg-[#EFF1F7]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Why Choose Canada?</h2>
            <p className="text-muted-foreground">
              Canada offers more than just a job; it offers a new life for you and your family with world-class benefits.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <Briefcase className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-headline text-lg">High Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Annual salary starting from $69,500 CAD (Ksh 5.3M+) with yearly increases.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader>
                <Plane className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-headline text-lg">Fully Sponsored</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Free Air Ticket, Visa Application, and Accommodation provided by us.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-headline text-lg">Family Migration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Move to Canada with your spouse and children. Public healthcare for all.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-headline text-lg">Scholarships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Access to fully funded scholarships for further studies in Canada.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-6">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to take the first step?</h2>
              <p className="text-xl text-blue-100">
                Application Deadline: 7th April 2026. Interviews start immediately after.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/apply">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10">
                    Apply Online Today
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          </div>
        </div>
      </section>
    </div>
  );
}