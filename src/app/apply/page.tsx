import { ApplicationForm } from '@/components/application/ApplicationForm';

export default function ApplyPage() {
  return (
    <div className="bg-[#EFF1F7] min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Job Application Form</h1>
            <p className="text-muted-foreground">
              Please fill in your details accurately. Only applicants who provide a valid M-Pesa transaction code for the Ksh 950 registration fee will be processed.
            </p>
          </div>
          
          <ApplicationForm />
        </div>
      </div>
    </div>
  );
}