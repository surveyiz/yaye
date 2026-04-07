
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF1F7]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-[#EFF1F7] min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-accent uppercase italic">Global Vacancies</h1>
            <p className="text-muted-foreground font-medium">Explore over 80+ job categories currently recruiting Kenyans for the 2025 intake.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search job roles..." 
              className="pl-10 h-12 border-2 rounded-xl focus:border-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {activeApp && (
          <div className="mb-12 bg-white border-2 border-primary/20 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-accent uppercase italic text-sm">Active Enrolment Detected</p>
                <p className="text-xs text-muted-foreground font-medium">You are currently being vetted for <b>{activeApp.jobPostingId}</b>. Complete the current process before applying for new roles.</p>
              </div>
            </div>
            <Link href="/status">
              <Button className="bg-accent hover:bg-accent/90 text-white font-bold uppercase italic h-12 px-8 shadow-md">
                View My Status <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const jobApp = apps?.find(a => a.jobPostingId === job);
            const isCompleted = jobApp?.status === 'docs_approved';
            const isCurrentActive = jobApp && !isCompleted;
            const isDisabled = !!activeApp && !isCurrentActive;

            return (
              <Card key={job} className={`group hover:shadow-2xl transition-all border-none shadow-md overflow-hidden rounded-3xl bg-white ${isCurrentActive ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-accent group-hover:bg-primary group-hover:text-white transition-colors">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    {isCurrentActive ? (
                      <Badge className="bg-primary text-white uppercase text-[8px] font-bold px-2 py-0.5 animate-pulse">In Progress</Badge>
                    ) : isCompleted ? (
                      <Badge className="bg-green-600 text-white uppercase text-[8px] font-bold px-2 py-0.5">Approved</Badge>
                    ) : (
                      <Badge variant="secondary" className="uppercase text-[8px] font-bold px-2 py-0.5">Open</Badge>
                    )}
                  </div>
                  <CardTitle className="font-headline text-lg leading-tight uppercase italic text-accent line-clamp-2 min-h-[3rem]">{job}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Annual Salary: From $69,500 CAD</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                    Fully sponsored pathway including airfare, visa, and accommodation for successful Kenyan applicants.
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  {isCurrentActive ? (
                    <Link href="/status" className="w-full">
                      <Button className="w-full h-12 font-black uppercase italic bg-primary text-white shadow-lg">
                        View Status
                      </Button>
                    </Link>
                  ) : isCompleted ? (
                    <Button disabled className="w-full h-12 font-black uppercase italic bg-green-50 text-green-600 border-2 border-green-200 opacity-70">
                      Success Notice
                    </Button>
                  ) : (
                    <Link href={`/apply?job=${encodeURIComponent(job)}`} className="w-full">
                      <Button 
                        disabled={isDisabled}
                        className={`w-full h-12 font-black uppercase italic transition-all ${isDisabled ? 'bg-muted text-muted-foreground' : 'bg-accent hover:bg-primary text-white shadow-md'}`}
                      >
                        {isDisabled ? 'Restricted' : 'Apply Now'}
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 bg-accent rounded-[2.5rem] p-8 md:p-12 text-white border-b-8 border-primary shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary text-white border-none font-bold italic">NEA ACCREDITED</Badge>
              <h3 className="font-headline text-3xl md:text-4xl font-black uppercase italic leading-tight">General Support <br/>Enrolment</h3>
              <p className="text-blue-100 font-medium text-lg leading-relaxed">
                If your specific profession is not listed, apply as a <b>"General Worker"</b>. Our AI-assisted placement counselor will match your qualifications to the best department in Canada.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <Link href="/apply?job=General%20Worker" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  disabled={!!activeApp}
                  className={`w-full sm:w-auto bg-primary hover:bg-white hover:text-accent transition-all text-white px-12 h-16 text-xl font-black uppercase italic shadow-2xl ${activeApp ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Start General Application
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
