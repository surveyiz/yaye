import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, GraduationCap, Users, HeartPulse, Home, Shield, Globe } from 'lucide-react';

const benefits = [
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: "High Earning Potential",
    description: "Earn more than $69,500 Canadian (Ksh 5,370,000) annually. Enjoy a steady annual salary rise of 1.4% each year based on performance."
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-primary" />,
    title: "Scholarship Opportunities",
    description: "Access fully funded scholarships for you and your dependents to pursue further education in Canada's world-renowned institutions."
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Family Migration",
    description: "Successful candidates can immigrate with their immediate family members, including spouse and children under 22."
  },
  {
    icon: <HeartPulse className="h-8 w-8 text-primary" />,
    title: "Public Health Insurance",
    description: "Canada's universal healthcare system covers most medical issues for you, your spouse, and your children."
  },
  {
    icon: <Home className="h-8 w-8 text-primary" />,
    title: "Affordable Cost of Living",
    description: "Housing, food, and essentials are competitively priced compared to other developed nations. Low crime rates ensure a safe environment."
  },
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: "Inclusive Diversity",
    description: "Join a multicultural workforce where diversity is celebrated. Canadian businesses prioritize inclusive cultures representing the global population."
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "World-Class Standard",
    description: "Ranked 6th on the Human Development Index, Canada offers one of the best quality of life standards globally."
  }
];

export default function BenefitsPage() {
  return (
    <div className="bg-[#EFF1F7] py-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="outline" className="border-primary text-primary px-4 py-1">Life in Canada</Badge>
          <h1 className="font-headline text-4xl font-bold text-primary">Unmatched Benefits for Kenyans</h1>
          <p className="text-muted-foreground text-lg">
            Beyond the competitive salary, moving to Canada provides a comprehensive security net for your entire family's future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <Card key={idx} className="border-none shadow-md hover:shadow-xl transition-shadow bg-white">
              <CardHeader>
                <div className="mb-4">{benefit.icon}</div>
                <CardTitle className="font-headline text-xl text-primary">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 bg-white rounded-3xl p-10 shadow-lg border-t-4 border-accent">
          <h2 className="font-headline text-2xl font-bold text-primary mb-6">Our Commitment to You</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <p className="text-sm">Free Kenya Passport Application Support</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <p className="text-sm">Fully Funded Canada Visa Application</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <p className="text-sm">Comprehensive Training in Kenya before departure</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <p className="text-sm">Complimentary Air Ticket to Canada</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <p className="text-sm">Free Initial Accommodation & Food upon arrival</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <p className="text-sm">Guaranteed safe and humane working conditions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}