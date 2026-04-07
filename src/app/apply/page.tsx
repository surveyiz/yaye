
import { Suspense } from 'react';
import { ApplicationForm } from '@/components/application/ApplicationForm';
import { Loader2 } from 'lucide-react';

export default function ApplyPage() {
  return (
    <div className="bg-[#EFF1F7] min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary uppercase">Job Application Form</h1>
            <p className="text-muted-foreground">
              Please fill in your details accurately. Only applicants who provide a valid M-Pesa transaction code for the Ksh 950 registration fee will be processed.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground font-medium italic">Loading application form...</p>
            </div>
          }>
            <ApplicationForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
