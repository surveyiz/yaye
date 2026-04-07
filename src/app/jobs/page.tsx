
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

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
  const { user, firestore, isUserLoading } = useFirebase();
  const [searchTerm, setSearchTerm] = React.useState('');

  const appsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'applications'), orderBy('submissionDate', 'desc'));
  }, [firestore, user]);

  const { data: apps, isLoading: isAppsLoading } = useCollection(appsQuery);

  const activeApp = apps?.find(a => a.status !== 'docs_approved');
  const filteredJobs = jobs.filter(j => j.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isUserLoading) {
    return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Available Opportunities</h1>
          <p className="text-muted-foreground">Explore over 80+ job categories currently recruiting Kenyans.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search job roles..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {activeApp && (
        <div className="mb-12 bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-bold text-amber-900 uppercase italic">Application Pending</p>
              <p className="text-xs text-amber-800">You have an active application for <b>{activeApp.jobPostingId}</b>. Complete it to apply for new roles.</p>
            </div>
          </div>
          <Link href="/status">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase italic">Check Status</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job} className="hover:shadow-lg transition-shadow border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-accent" />
                <Badge variant="secondary" className="font-normal">Recruiting</Badge>
              </div>
              <CardTitle className="font-headline text-xl leading-tight uppercase italic">{job}</CardTitle>
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
                <Button 
                  variant={activeApp ? "ghost" : "outline"} 
                  disabled={!!activeApp}
                  className={`w-full font-bold uppercase italic h-12 transition-all ${activeApp ? 'opacity-30' : 'hover:bg-primary hover:text-white'}`}
                >
                  {activeApp ? 'Restricted' : 'Apply for this Role'}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-accent rounded-2xl p-8 text-white border-b-8 border-primary shadow-2xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-headline text-2xl font-bold mb-4 uppercase italic">Can't find your specific role?</h3>
            <p className="text-blue-100 text-sm">
              Apply as a "General Worker" and our AI-assisted counselor will help match you with the best department based on your skills and qualifications.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Link href="/apply">
              <Button 
                size="lg" 
                disabled={!!activeApp}
                className={`bg-primary hover:bg-primary/90 text-white px-10 h-14 font-bold uppercase italic shadow-lg ${activeApp ? 'opacity-50' : ''}`}
              >
                Start General Application
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
