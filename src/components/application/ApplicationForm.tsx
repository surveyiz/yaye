
"use client"

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, Smartphone, Info, AlertCircle, ShieldCheck, UserCircle, LogIn } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const STEPS = ['Personal Details', 'Qualifications', 'Payment', 'Review'];
const MPESA_MESSAGE_REGEX = /([A-Z0-9]{10})\s+Confirmed\.\s+Ksh\s*([\d,.]+)\s+paid\s+to\s+RECRUITMENT\s+SERVICES/i;

export function ApplicationForm() {
  const { auth, firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJob = searchParams.get('job') || '';

  // Fetch existing profile to avoid re-entering details
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'profile', 'details');
  }, [firestore, user]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(profileRef);

  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    county: '',
    ward: '',
    jobRole: initialJob,
    education: '',
    qualifications: '',
    mpesaMessage: '',
  });

  // Sync profile data to form if it exists
  React.useEffect(() => {
    if (profileData) {
      setFormData(prev => ({
        ...prev,
        name: profileData.fullName || '',
        phone: profileData.phoneNumber || '',
        email: profileData.email || '',
        idNumber: profileData.nationalIdNumber || '',
        county: profileData.county || '',
        ward: profileData.ward || '',
        education: profileData.highestEducationQualification || prev.education,
      }));
      if (step === 0) setStep(1);
    }
  }, [profileData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateStep = () => {
    if (step === 0) {
      if (!formData.name || !formData.phone || !formData.idNumber || !formData.county || !formData.ward) {
        setError("All personal fields are mandatory.");
        return false;
      }
    } else if (step === 1) {
      if (!formData.jobRole || !formData.education || !formData.qualifications) {
        setError("Target role and qualifications must be provided.");
        return false;
      }
    } else if (step === 2) {
      const match = formData.mpesaMessage.match(MPESA_MESSAGE_REGEX);
      if (!match) {
        setError("Invalid M-Pesa format. Please paste the COMPLETE Safaricom confirmation message showing payment to RECRUITMENT SERVICES.");
        return false;
      }
      const paidAmount = match[2].replace(/,/g, '');
      if (parseFloat(paidAmount) < 950) {
        setError("The transaction amount is incorrect. The registration fee is Ksh 950.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) {
      router.push('/auth?redirect=/apply');
      return;
    }
    setLoading(true);

    try {
      const match = formData.mpesaMessage.match(MPESA_MESSAGE_REGEX);
      if (!match) throw new Error("Invalid M-Pesa message format.");

      const transactionCode = match[1].toUpperCase();
      const applicantId = user.uid;
      const applicationId = crypto.randomUUID();

      const appData = {
        id: applicationId,
        applicantId: applicantId,
        jobPostingId: formData.jobRole,
        submissionDate: new Date().toISOString(),
        status: 'payment_pending',
        mpesaCode950: transactionCode
      };

      const profileRef = doc(firestore, 'users', applicantId, 'profile', 'details');
      const userAppRef = doc(firestore, 'users', applicantId, 'applications', applicationId);
      const globalAppRef = doc(firestore, 'global_applications', applicationId);

      await setDoc(profileRef, {
        id: applicantId,
        fullName: formData.name,
        phoneNumber: formData.phone,
        email: user.email || formData.email,
        nationalIdNumber: formData.idNumber,
        county: formData.county,
        ward: formData.ward,
        highestEducationQualification: formData.education,
        registrationDate: profileData?.registrationDate || new Date().toISOString()
      }, { merge: true });

      await setDoc(userAppRef, appData);
      await setDoc(globalAppRef, appData);

      toast({
        title: "Application Submitted",
        description: `Your application for ${formData.jobRole} is being verified.`,
      });

      router.push('/status');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Error", description: err.message });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user && !isProfileLoading) {
    return (
      <Card className="border-none shadow-xl p-12 text-center space-y-6">
        <UserCircle className="h-16 w-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-accent uppercase italic">Member Access Required</h2>
          <p className="text-muted-foreground">To submit an application and track your status, please create a secure recruitment account or sign in.</p>
        </div>
        <Link href="/auth?redirect=/apply" className="block">
          <Button className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase italic text-lg shadow-lg">
            <LogIn className="mr-2" /> Login or Register to Apply
          </Button>
        </Link>
      </Card>
    );
  }

  if (isProfileLoading) {
    return (
      <Card className="border-none shadow-xl p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground italic font-medium">Synchronizing your profile...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= step ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-muted'}`}>
              {i + 1}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
          </div>
        ))}
      </div>

      {profileData && (
        <Alert className="bg-green-50 border-green-200">
          <UserCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-[10px] font-bold uppercase italic">
            Portfolio detected for {profileData.fullName}. Personal details locked for consistency.
          </AlertDescription>
        </Alert>
      )}

      {error && <Alert variant="destructive" className="border-2"><AlertCircle className="h-4 w-4" /><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}

      <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
        <CardContent className="p-8">
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-accent">Full Name (Legal ID)</Label><Input value={formData.name} onChange={e => handleChange('name', e.target.value)} disabled={!!profileData} className="h-12 border-2" /></div>
              <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-accent">Phone Number</Label><Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} disabled={!!profileData} placeholder="0712..." className="h-12 border-2" /></div>
              <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-accent">National ID Number</Label><Input value={formData.idNumber} onChange={e => handleChange('idNumber', e.target.value)} disabled={!!profileData} className="h-12 border-2" /></div>
              <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-accent">Email Address</Label><Input value={user?.email || formData.email} disabled className="h-12 border-2 bg-muted/30" /></div>
              <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-accent">County</Label><Input value={formData.county} onChange={e => handleChange('county', e.target.value)} disabled={!!profileData} className="h-12 border-2" /></div>
              <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-accent">Ward / Location</Label><Input value={formData.ward} onChange={e => handleChange('ward', e.target.value)} disabled={!!profileData} className="h-12 border-2" /></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-accent">Target Job Position</Label><Input value={formData.jobRole} onChange={e => handleChange('jobRole', e.target.value)} className="h-12 border-2 font-bold uppercase italic" /></div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-accent">Highest Education Level</Label>
                <Select value={formData.education} onValueChange={v => handleChange('education', v)}>
                  <SelectTrigger className="h-12 border-2"><SelectValue placeholder="Select qualification" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary School</SelectItem>
                    <SelectItem value="secondary">Secondary School (KCSE)</SelectItem>
                    <SelectItem value="college">College / Diploma</SelectItem>
                    <SelectItem value="university">University Degree</SelectItem>
                    <SelectItem value="postgrad">Post Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-accent">Academic & Professional Summary</Label>
                <Textarea value={formData.qualifications} onChange={e => handleChange('qualifications', e.target.value)} placeholder="Summarize your skills and work experience..." className="min-h-[140px] border-2" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-accent rounded-2xl p-6 text-white space-y-4 shadow-lg border-b-4 border-primary">
                <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-primary" /><h3 className="font-bold uppercase tracking-tight italic">Registration Fee: Ksh 950</h3></div>
                <p className="text-[11px] text-blue-100 leading-relaxed italic">This fee covers the background check and initial dossier verification. Processing is handled by <strong>RECRUITMENT SERVICES</strong>.</p>
              </div>
              <div className="bg-white border-2 border-primary rounded-2xl p-6 space-y-4 shadow-inner">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1"><p className="text-[10px] uppercase font-bold text-muted-foreground">Till Number</p><p className="text-4xl font-black text-accent">937226</p></div>
                  <div className="space-y-1"><p className="text-[10px] uppercase font-bold text-muted-foreground">Merchant</p><p className="text-[10px] font-bold text-primary uppercase border-l-2 pl-2 border-primary/20">RECRUITMENT SERVICES</p></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-slate-500">Paste Full Safaricom Message</Label>
                  <Textarea 
                    value={formData.mpesaMessage} 
                    onChange={e => handleChange('mpesaMessage', e.target.value)} 
                    placeholder="Paste the COMPLETE confirmation message from Safaricom here..." 
                    className="min-h-[140px] font-mono text-xs uppercase border-2 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-headline text-xl font-bold text-accent border-b-2 border-primary/20 pb-2 uppercase italic">Review Final Submission</h3>
              <div className="grid grid-cols-2 gap-8 text-sm bg-muted/30 p-6 rounded-2xl border">
                <div><p className="text-muted-foreground text-[10px] uppercase font-black mb-1">Applicant Name</p><p className="font-bold text-accent uppercase">{formData.name}</p></div>
                <div><p className="text-muted-foreground text-[10px] uppercase font-black mb-1">Assigned Role</p><p className="font-bold text-primary uppercase italic">{formData.jobRole}</p></div>
                <div><p className="text-muted-foreground text-[10px] uppercase font-black mb-1">Vetting Code</p><p className="font-bold text-accent">{formData.mpesaMessage.match(MPESA_MESSAGE_REGEX)?.[1] || 'N/A'}</p></div>
                <div><p className="text-muted-foreground text-[10px] uppercase font-black mb-1">County/Ward</p><p className="font-bold text-accent uppercase">{formData.county} / {formData.ward}</p></div>
              </div>
              <Alert className="bg-primary/5 border-primary/20 border-l-4">
                <div className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-[10px] font-bold italic leading-tight uppercase text-accent">
                    By confirming, I attest that my M-Pesa transaction is authentic. False declarations result in automatic system blacklisting.
                  </p>
                </div>
              </Alert>
            </div>
          )}

          <div className="flex justify-between items-center mt-12 pt-6 border-t-2">
            {step > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => setStep(prev => prev - 1)}
                className="font-bold uppercase text-xs"
              >
                Previous
              </Button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 px-10 font-bold uppercase italic h-12 shadow-md">Next Step</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="bg-accent hover:bg-accent/90 px-12 font-bold uppercase italic h-14 shadow-2xl">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />}
                  {loading ? 'Processing...' : 'Ratify Application'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
