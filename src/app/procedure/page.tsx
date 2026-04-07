import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Plane, FileText, Phone, Award, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  { step: 1, title: "Complete Application", description: "Fill in the online form with your legal details and qualifications." },
  { step: 2, title: "Registration & Vetting", description: "Pay Ksh 950 processing fee to Till: 937226 (RECRUITMENT SERVICES). This covers document verification." },
  { step: 3, title: "Payment Verification", description: "Paste your full M-Pesa confirmation message in the application form for instant tracking." },
  { step: 4, title: "Initial Screening", description: "Our agents will call you to verify your background and language skills." },
  { step: 5, title: "Assessment Center", description: "Final face-to-face or video interview with Canadian employers." },
  { step: 6, title: "Job Offer", description: "Receive an official contract detailing your salary (Min $69,500 CAD) and benefits." },
  { step: 7, title: "Travel Documents", description: "We facilitate and pay for your Kenya Passport and Canada Visa applications." },
  { step: 8, title: "Flight to Canada", description: "Complimentary air ticket and departure briefing in Nairobi." },
  { step: 9, title: "Onboarding", description: "Settling into your provided accommodation and starting your career." }
];

export default function ProcedurePage() {
  return (
    <div className="bg-white py-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8 sticky top-24">
            <div className="space-y-4">
              <Badge className="bg-accent">Official Process</Badge>
              <h1 className="font-headline text-4xl font-bold text-primary">Your Journey to Canada</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                The Canada Pathway Program is a secure, legal, and facilitated route for Kenyan professionals and laborers to fill the labor gap in Canada.
              </p>
            </div>
            
            <Card className="bg-[#EFF1F7] border-none shadow-inner">
              <CardContent className="p-8 space-y-4">
                <h3 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6" />
                  Verification Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Payment Till</p>
                    <p className="text-xl font-black text-accent">937226</p>
                    <p className="text-xs font-medium">RECRUITMENT SERVICES</p>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Required Fee:</span>
                    <span className="font-bold">Ksh 950</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-bold text-green-600">Refundable if not selected</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/apply">
                    <Button className="w-full bg-primary h-12 text-lg font-bold">Start Application</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative pl-8 border-l-2 border-primary/10 ml-4">
            <div className="space-y-12">
              {steps.map((item) => (
                <div key={item.step} className="relative">
                  <div className="absolute -left-[45px] top-0 h-10 w-10 rounded-full bg-primary border-4 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-headline text-xl font-bold text-accent">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
