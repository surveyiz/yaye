import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Plane, FileText, Phone, Award, ShieldCheck, Smartphone, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  { 
    step: 1, 
    title: "Browse & Select Role", 
    description: "Visit our job listings to find a category that matches your skills. We have over 80+ sectors recruiting." 
  },
  { 
    step: 2, 
    title: "Fill Application Form", 
    description: "Complete the online form with your accurate legal details as they appear on your National ID or Passport." 
  },
  { 
    step: 3, 
    title: "Registration Payment", 
    description: "Pay the mandatory Ksh 950 processing fee to Till Number 937226 (RECRUITMENT SERVICES). This covers document vetting." 
  },
  { 
    step: 4, 
    title: "Verify M-Pesa Message", 
    description: "Copy and paste the ENTIRE confirmation message from Safaricom into the application form for instant verification." 
  },
  { 
    step: 5, 
    title: "Agent Screening", 
    description: "Our recruitment officers will call you within 24 hours to verify your background and communication skills." 
  },
  { 
    step: 6, 
    title: "Official Interview", 
    description: "Attend a virtual or physical interview with the Canadian employer representatives." 
  },
  { 
    step: 7, 
    title: "Contract Issuance", 
    description: "Successful candidates receive a signed Job Offer Letter detailing the $69,500 CAD minimum annual salary." 
  },
  { 
    step: 8, 
    title: "Visa & Travel", 
    description: "We handle and pay for your Visa and Air Ticket. You will then attend a departure briefing in Nairobi." 
  },
  { 
    step: 9, 
    title: "Canadian Onboarding", 
    description: "Arrival in Canada, settling into provided housing, and starting your new career." 
  }
];

export default function ProcedurePage() {
  return (
    <div className="bg-[#EFF1F7] py-12 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-primary hover:bg-primary text-white px-4 py-1">Official Procedure</Badge>
            <h1 className="font-headline text-3xl md:text-5xl font-bold text-accent uppercase">How to Join the Canada Pathway</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Follow these steps carefully to ensure your application is processed successfully for the 2025 recruitment intake.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {steps.map((item) => (
                <Card key={item.step} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                  <div className="flex">
                    <div className="w-16 flex-shrink-0 bg-accent flex items-center justify-center text-white font-bold text-xl">
                      {item.step}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-headline text-xl font-bold text-accent mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Card className="bg-white border-t-4 border-primary shadow-lg sticky top-8">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3 text-primary font-bold">
                    <ShieldCheck className="h-6 w-6" />
                    <h3 className="font-headline text-xl">Payment Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-accent/20">
                      <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Lipa na M-Pesa Till</p>
                          <p className="text-3xl font-black text-accent">937226</p>
                        </div>
                        <Smartphone className="h-10 w-10 text-primary opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Merchant Name</p>
                        <p className="font-bold text-accent">RECRUITMENT SERVICES</p>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm border-b pb-2">
                      <span className="text-muted-foreground">Registration Fee:</span>
                      <span className="font-bold text-accent">Ksh 950</span>
                    </div>

                    <div className="flex gap-3 bg-blue-50 p-3 rounded-lg text-xs text-blue-800 leading-tight">
                      <Info className="h-4 w-4 shrink-0" />
                      <p>Ensure you paste the <strong>FULL</strong> confirmation message. Verification fails if code is missing.</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link href="/jobs">
                      <Button className="w-full bg-primary hover:bg-primary/90 h-14 text-lg font-bold uppercase italic shadow-lg">
                        Browse Jobs & Apply
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-accent rounded-2xl text-white space-y-4">
                <h4 className="font-bold uppercase text-sm text-primary">Need Help?</h4>
                <p className="text-xs text-blue-100">Our support agents are available 24/7 to assist with your M-Pesa verification.</p>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Phone className="h-4 w-4" />
                  <span>+254 783 334 670</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
