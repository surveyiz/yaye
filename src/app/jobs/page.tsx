import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const jobs = [
  'Accounting Clerks/Accountants', 'Administrative Assistants', 'Air Hostesses/Flight Stewards/Stewardesses',
  'Architects', 'Bakery Workers', 'Bankers', 'Bartenders', 'Bookkeepers', 'Cabin Crews/Flight Attendants',
  'Caregivers', 'Carpenters (Construction Laborers)', 'Cashiers', 'Chefs', 'Concierges', 'Construction Laborers',
  'Customer Service Representatives', 'Data Entry Clerks', 'Dental Hygienists', 'Doctors', 'Drivers',
  'Electricians', 'Environmental Scientists', 'Errand Runners', 'Event Coordinators', 'Executive Secretaries',
  'Farmworkers', 'Financial Advisors', 'Financial Analysts', 'Fish Plant Workers', 'Food and Beverage Servers',
  'Front Desk Agents', 'Gardeners', 'Graphic Designers', 'Health Educators', 'Hospitality Managers', 'Hostesses',
  'Hotel Front Desk Clerks', 'Hotel Managers', 'Hotel Valets', 'Housekeepers', 'Housekeeping/Cleaning Staff',
  'Human Resource Assistants', 'Human Resource Managers', 'Human Resource Officers', 'Industrial Butchers and Meat Cutters',
  'Insurance Agents', 'IT Project Managers', 'Janitors/Caretakers', 'Kitchen Helpers', 'Laundry Workers',
  'Light Duty Cleaners', 'Logistics Coordinators', 'Machine Operators (Mechanical)', 'Marketing Assistants/Specialists',
  'Marketing Managers', 'Medical Assistants', 'Medical Billers', 'Medical Transcriptionists',
  'Motor Mechanics/Automotive Service Technicians', 'Nannies', 'Office Clerks and Secretaries', 'Office Managers',
  'Parent’s helpers', 'Parking Attendants', 'Pet Sitters', 'Pharmacy Technicians', 'Plumber', 'Poultry Production Workers',
  'Processing Equipment Cleaners', 'Real Estate Agents', 'Receptionists', 'Registered Nurses', 'Restaurant Managers',
  'Room Attendants', 'Sales Representatives', 'Security Guards', 'Specialized Cleaners', 'Store Keepers', 'Teachers',
  'Telemarketing/Tele sales Representatives', 'Tourism Managers', 'Transportation Managers', 'Travel Agents',
  'Truck Drivers', 'Warehouse Workers', 'Web Designers/Software Developers', 'Welder', 'Yard Workers/Gardeners'
];

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Available Opportunities</h1>
          <p className="text-muted-foreground">Explore over 80+ job categories currently recruiting Kenyans.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search job roles..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card key={job} className="hover:shadow-lg transition-shadow border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-accent" />
                <Badge variant="secondary" className="font-normal">Recruiting</Badge>
              </div>
              <CardTitle className="font-headline text-xl leading-tight">{job}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Annual Salary: From $69,500 CAD</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Requires proficiency in English and disciplined work ethic. Training provided in Kenya.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/apply?job=${encodeURIComponent(job)}`} className="w-full">
                <Button variant="outline" className="w-full hover:bg-primary hover:text-white transition-colors">
                  Apply for this Role
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-primary rounded-2xl p-8 text-white">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-headline text-2xl font-bold mb-4">Can't find your specific role?</h3>
            <p className="text-blue-100">
              Apply as a "General Worker" and our AI-assisted counselor will help match you with the best department based on your skills and qualifications.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Link href="/apply">
              <Button size="lg" className="bg-accent hover:bg-accent/90">Start General Application</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}