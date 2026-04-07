
"use client"

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, Smartphone, Info, AlertCircle, ShieldCheck, UserCircle, LogIn, Briefcase } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const STEPS = ['Personal', 'Quals', 'Payment', 'Review'];
const MPESA_MESSAGE_REGEX = /([A-Z0-9]{10})\s+Confirmed\.\s+Ksh\s*([\d,.]+)\s+paid\s+to\s+RECRUITMENT\s+SERVICES/i;

export function ApplicationForm() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJob = searchParams.get('job') || '';

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'profile', 'details');
  }, [firestore, user]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(profileRef);

  const appsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'applications'), orderBy('submissionDate', 'desc'));
  }, [firestore, user]);

  const { data: apps, isLoading: isAppsLoading } = useCollection(appsQuery);

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

  const activeApp = apps?.find(a => a.status !== 'docs_approved');

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

  const validateStep = async () => {
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
        setError("Invalid M-Pesa format. Paste the COMPLETE Safaricom message.");
        return false;
      }
      const transactionCode = match[1].toUpperCase();
      const paidAmount = match[2].replace(/,/g, '');
      
      if (parseFloat(paidAmount) < 950) {
        setError("Incorrect amount. Registration fee is Ksh 950.");
        return false;
      }

      setLoading(true);
      try {
        const q = query(collection(firestore!, 'global_applications'), where('mpesaCode950', '==', transactionCode));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setError("This M-Pesa transaction code has already been used.");
          setLoading(false);
          return false;
        }
      } catch (err) {
        setError("Security error checking transaction. Please retry.");
        setLoading(false);
        return false;
      }
      setLoading(false);
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;
    setLoading(true);

    try {
      const match = formData.mpesaMessage.match(MPESA_MESSAGE_REGEX);
      if (!match) throw new Error("Invalid M-Pesa message.");

      const transactionCode = match[1].toUpperCase();
      const applicationId = crypto.randomUUID();

      const appData = {
        id: applicationId,
        applicantId: user.uid,
        jobPostingId: formData.jobRole,
        submissionDate: new Date().toISOString(),
        status: 'payment_pending',
        mpesaCode950: transactionCode
      };

      const userAppRef = doc(firestore, 'users', user.uid, 'applications', applicationId);
      const globalAppRef = doc(firestore, 'global_applications', applicationId);

      await setDoc(profileRef!, {
        id: user.uid,
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

      toast({ title: "Submitted", description: "Verification in progress." });
      router.push('/status');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user && !isProfileLoading) {
    return (
      <Card className="border-none shadow-xl p-8 md:p-12 text-center space-y-6">
        <UserCircle className="h-16 w-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-accent uppercase italic">Member Access Required</h2>
          <p className="text-muted-foreground text-sm">Create a secure recruitment account to submit and track your application.</p>
        </div>
        <Link href="/auth?redirect=/apply" className="block">
          <Button className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase italic shadow-lg">
            <LogIn className="mr-2" /> Login or Register
          </Button>
        </Link>
      </Card>
    );
  }

  if (activeApp) {
    return (
      <Card className="border-none shadow-xl p-8 md:p-12 text-center space-y-6">
        <div className="bg-primary/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto text-primary">
          <Briefcase className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-accent uppercase italic">Application In Progress</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            You already have an active application for <b>{activeApp.jobPostingId}</b>. You must complete the current vetting process before applying for another role.
          </p>
        </div>
        <Link href="/status" className="block">
          <Button className="w-full h-14 bg-accent hover:bg-accent/90 font-bold uppercase italic shadow-lg">
            Track Active Application
          </Button>
        </Link>
      </Card>
    );
  }

  if (isProfileLoading || isAppsLoading) {
    return (
      <Card className="border-none shadow-xl p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2 overflow-x-auto pb-4 gap-4 scrollbar-hide">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1 min-w-fit">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${i <= step ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-muted'}`}>
              {i + 1}
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-tight ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
          </div>
        ))}
      </div>

      {profileData && (
        <Alert className="bg-green-50 border-green-200 py-2">
          <AlertDescription className="text-green-800 text-[9px] font-bold uppercase italic flex items-center gap-2">
            <UserCircle className="h-3 w-3" /> Profile pre-filled for {profileData.fullName}
          </AlertDescription>
        </Alert>
      )}

      {error && <Alert variant="destructive" className="border-2"><AlertDescription className="font-bold text-xs">{error}</AlertDescription></Alert>}

      <Card className="border-none shadow-xl overflow-hidden rounded-2xl md:rounded-3xl">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={e => e.preventDefault()}>
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-accent">Full Name</Label><Input value={formData.name} onChange={e => handleChange('name', e.target.value)} disabled={!!profileData} className="h-11 border-2" /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-accent">Phone</Label><Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} disabled={!!profileData} className="h-11 border-2" /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-accent">National ID</Label><Input value={formData.idNumber} onChange={e => handleChange('idNumber', e.target.value)} disabled={!!profileData} className="h-11 border-2" /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-accent">County</Label><Input value={formData.county} onChange={e => handleChange('county', e.target.value)} disabled={!!profileData} className="h-11 border-2" /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-accent">Ward</Label><Input value={formData.ward} onChange={e => handleChange('ward', e.target.value)} disabled={!!profileData} className="h-11 border-2" /></div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-accent">Target Role</Label><Input value={formData.jobRole} onChange={e => handleChange('jobRole', e.target.value)} className="h-11 border-2 font-bold uppercase italic" /></div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-accent">Education Level</Label>
                  <Select value={formData.education} onValueChange={v => handleChange('education', v)}>
                    <SelectTrigger className="h-11 border-2"><SelectValue placeholder="Select qualification" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary School</SelectItem>
                      <SelectItem value="secondary">Secondary (KCSE)</SelectItem>
                      <SelectItem value="college">College/Diploma</SelectItem>
                      <SelectItem value="university">University Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-accent">Qualifications Summary</Label><Textarea value={formData.qualifications} onChange={e => handleChange('qualifications', e.target.value)} className="min-h-[120px] border-2" /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-accent rounded-xl p-4 md:p-6 text-white space-y-2 border-b-4 border-primary">
                  <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h3 className="font-bold uppercase text-sm italic">Registration: Ksh 950</h3></div>
                  <p className="text-[10px] text-blue-100 italic">Pay to Till: 937226 (RECRUITMENT SERVICES)</p>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-black text-slate-500">Paste Full Safaricom Message</Label>
                  <Textarea 
                    value={formData.mpesaMessage} 
                    onChange={e => handleChange('mpesaMessage', e.target.value)} 
                    placeholder="Paste the message from Safaricom here..." 
                    className="min-h-[140px] font-mono text-[11px] uppercase border-2"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-accent uppercase italic border-b pb-2">Review Final Details</h3>
                <div className="grid grid-cols-1 gap-4 text-xs bg-muted/30 p-4 rounded-xl border">
                  <div><p className="text-[9px] uppercase font-black text-slate-500">Name</p><p className="font-bold uppercase">{formData.name}</p></div>
                  <div><p className="text-[9px] uppercase font-black text-slate-500">Target Role</p><p className="font-bold text-primary uppercase italic">{formData.jobRole}</p></div>
                  <div><p className="text-[9px] uppercase font-black text-slate-500">Transaction Code</p><p className="font-bold">{formData.mpesaMessage.match(MPESA_MESSAGE_REGEX)?.[1] || 'N/A'}</p></div>
                </div>
                <Alert className="bg-primary/5 border-primary/20">
                  <AlertDescription className="text-[9px] font-bold italic leading-tight uppercase text-accent">
                    Confirming submission verifies that your payment record is authentic.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              {step > 0 && <Button variant="ghost" onClick={() => setStep(prev => prev - 1)} className="font-bold uppercase text-[10px]">Back</Button>}
              <div className="ml-auto">
                {step < 3 ? (
                  <Button onClick={handleNext} disabled={loading} className="bg-primary hover:bg-primary/90 px-8 font-bold uppercase italic h-11 text-xs">
                    {loading ? <Loader2 className="animate-spin" /> : 'Continue'}
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading} className="bg-accent hover:bg-accent/90 px-8 font-bold uppercase italic h-12 text-xs shadow-xl">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Confirm & Submit
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
