import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Plane, FileText, Phone, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  { step: 1, title: "Complete Application", description: "Fill in the online application form with your details." },
  { step: 2, title: "Registration Fee", description: "Pay Ksh 950 registration fee to Till No: 937226 (Automatic refund if not qualified)." },
  { step: 3, title: "First Interview", description: "Initial screening call to verify details and language proficiency." },
  { step: 4, title: "Final Assessment", description: "Attend an assessment center for final interviews." },
  { step: 5, title: "Receive Job Offer", description: "Official offer letter detailing salary, benefits, and terms." },
  { step: 6, title: "Passport Application", description: "We pay for and facilitate your Kenya Passport application." },
  { step: 7, title: "Visa Application", description: "We process your Canada Work Permit/Visa." },
  { step: 8, title: "Air Ticket Issuance", description: "Receive your complimentary flight details to Canada." },
  { step: 9, title: "Fly to Canada", description: "Depart for your new career destination." },
  { step: 10, title: "Accommodation", description: "We provide your initial housing and settling services." },
  { step: 11, title: "Onboarding", description: "Start your professional journey in Canada." }
];

export default function ProcedurePage() {
  return (
    <div className="bg-white py-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8 sticky top-24">
            <div className="space-y-4">
              <Badge className="bg-accent">Process Guide</Badge>
              <h1 className="font-headline text-4xl font-bold text-primary">Simple Step-by-Step Path to Canada</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We've streamlined the immigration process to make it as smooth as possible for Kenyan citizens. From your first click to your first day in Canada, we handle the heavy lifting.
              </p>
            </div>
            
            <Card className="bg-[#EFF1F7] border-none shadow-inner">
              <CardContent className="p-8 space-y-4">
                <h3 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
                  <Award className="h-6 w-6" />
                  Important Dates
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Application Deadline:</span>
                    <span className="font-bold">7th April 2026, 23:59</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Job Offers Issued:</span>
                    <span className="font-bold">8th April 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration Fee:</span>
                    <span className="font-bold text-accent">Ksh 950 (Refundable)</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/apply">
                    <Button className="w-full bg-primary h-12">Start Step 1 Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative pl-8">
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-blue-100 rounded-full"></div>
            <div className="space-y-12">
              {steps.map((item) => (
                <div key={item.step} className="relative">
                  <div className="absolute -left-8 top-0 h-8 w-8 rounded-full bg-primary border-4 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-headline text-xl font-bold text-primary">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
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