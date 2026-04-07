"use client"

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, Sparkles, Smartphone, CreditCard, Info } from 'lucide-react';
import { aiAssistedJobApplication } from '@/ai/flows/ai-assisted-job-application';

const STEPS = ['Personal Details', 'Qualifications', 'Payment', 'Review'];

export function ApplicationForm() {
  const searchParams = useSearchParams();
  const initialJob = searchParams.get('job') || '';

  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiSuggestions, setAiSuggestions] = React.useState<{recommendedJobs: string[], tailoredStatement: string} | null>(null);

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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const getAiHelp = async () => {
    if (!formData.qualifications) return;
    setAiLoading(true);
    try {
      const result = await aiAssistedJobApplication({
        applicantQualifications: formData.qualifications,
        desiredJobRole: formData.jobRole
      });
      setAiSuggestions(result);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(STEPS.length); // Success state
    }, 2000);
  };

  if (step === STEPS.length) {
    return (
      <Card className="border-none shadow-xl">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-headline text-primary">Application Received</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you {formData.name}. Your application for {formData.jobRole || 'Canada Jobs'} is currently being reviewed. 
          </p>
          <div className="bg-muted p-4 rounded-lg text-sm text-left">
            <p className="font-bold mb-2">Next Steps:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Our agents will verify your M-Pesa message.</li>
              <li>You will receive a confirmation SMS within 2 hours.</li>
              <li>A scheduled interview call will follow via {formData.phone}.</li>
            </ol>
          </div>
          <div className="pt-4">
            <Button onClick={() => window.location.href = '/'} className="bg-primary">Return Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8 px-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= step ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-muted'}`}>
              {i + 1}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
          </div>
        ))}
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8">
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Legal Name</Label>
                  <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="As shown on ID" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (M-Pesa Number)</Label>
                  <Input id="phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="e.g., 2547XXXXXXXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="example@mail.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">National ID / Passport Number</Label>
                  <Input id="idNumber" value={formData.idNumber} onChange={e => handleChange('idNumber', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County of Residence</Label>
                  <Input id="county" value={formData.county} onChange={e => handleChange('county', e.target.value)} placeholder="e.g., Nairobi" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Input id="ward" value={formData.ward} onChange={e => handleChange('ward', e.target.value)} placeholder="e.g., Kileleshwa" required />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Target Job Role</Label>
                  <Input id="jobRole" value={formData.jobRole} onChange={e => handleChange('jobRole', e.target.value)} placeholder="e.g., Warehouse Worker" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education Level</Label>
                  <Select value={formData.education} onValueChange={val => handleChange('education', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="qualifications">Experience & Skills</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={getAiHelp} 
                      disabled={!formData.qualifications || aiLoading}
                      className="text-primary gap-2"
                    >
                      {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      AI Counselor
                    </Button>
                  </div>
                  <Textarea 
                    id="qualifications" 
                    value={formData.qualifications} 
                    onChange={e => handleChange('qualifications', e.target.value)} 
                    placeholder="Describe your work history and any relevant skills..." 
                    className="min-h-[150px]"
                    required
                  />
                  {aiSuggestions && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Sparkles className="h-4 w-4" />
                        AI Counselor Suggestions
                      </div>
                      <div className="text-sm space-y-2">
                        <p className="font-medium">Recommended Roles:</p>
                        <div className="flex flex-wrap gap-2">
                          {aiSuggestions.recommendedJobs.map(job => (
                            <Button key={job} variant="secondary" size="sm" onClick={() => handleChange('jobRole', job)} className="h-7 text-[10px]">
                              {job}
                            </Button>
                          ))}
                        </div>
                        <p className="font-medium pt-2">Tailored Statement:</p>
                        <p className="italic text-muted-foreground bg-white p-3 rounded border text-xs">
                          {aiSuggestions.tailoredStatement}
                        </p>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => handleChange('qualifications', formData.qualifications + '\n\n' + aiSuggestions.tailoredStatement)}
                        >
                          Use this Statement
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 py-2">
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Info className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">Registration Fee (Ksh 950)</h3>
                    <p className="text-sm text-muted-foreground">
                      This fee covers application processing, document vetting, and initial assessment. It is 100% refundable if you are not selected for an interview.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border-2 border-accent rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-accent">
                      <Smartphone className="h-5 w-5" />
                      M-Pesa Payment Procedure
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Till Number:</p>
                        <p className="text-2xl font-bold text-primary">937226</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Till Name:</p>
                        <p className="text-lg font-bold">RECRUITMENT SERVICES</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Amount:</p>
                        <p className="text-lg font-bold">Ksh 950</p>
                      </div>
                    </div>
                    <Separator />
                    <ol className="text-xs space-y-2 list-decimal list-inside text-muted-foreground">
                      <li>Go to <strong>M-Pesa</strong> &gt; <strong>Lipa na M-PESA</strong></li>
                      <li>Select <strong>Buy Goods and Services</strong></li>
                      <li>Enter Till No: <strong>937226</strong></li>
                      <li>Enter Amount: <strong>950</strong></li>
                      <li>Complete the transaction with your PIN</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="mpesaMessage" className="text-primary font-bold">Paste Complete M-Pesa Message</Label>
                    <Textarea 
                      id="mpesaMessage" 
                      value={formData.mpesaMessage} 
                      onChange={e => handleChange('mpesaMessage', e.target.value)} 
                      placeholder="Paste the entire confirmation message here (e.g., QXA12BC34 Confirmed. Ksh950.00 paid to RECRUITMENT SERVICES...)" 
                      className="min-h-[120px] font-mono text-sm"
                      required 
                    />
                    <p className="text-[10px] text-muted-foreground">
                      * Ensure the message includes the transaction code, amount, and date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="font-headline text-xl font-bold text-primary border-b pb-2">Final Review</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase font-bold">Full Name</p>
                      <p className="font-medium text-lg">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase font-bold">Contact</p>
                      <p className="font-medium">{formData.phone}</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase font-bold">Applied For</p>
                      <p className="font-medium text-lg text-accent">{formData.jobRole}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase font-bold">M-Pesa Verification</p>
                      <div className="bg-muted p-2 rounded mt-1 overflow-hidden">
                        <p className="font-mono text-[10px] break-words">{formData.mpesaMessage || 'Message not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 p-4 bg-primary/5 rounded-lg text-xs text-muted-foreground italic border border-primary/10">
                  By submitting, you authorize Canada Pathway Jobs to process your data for recruitment purposes. Incomplete applications or unverified payments will not be processed.
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-12 pt-6 border-t">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                  Back
                </Button>
              )}
              <div className="ml-auto">
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext} className="bg-primary px-8">
                    Continue to {STEPS[step + 1]}
                  </Button>
                ) : (
                  <Button type="submit" className="bg-accent hover:bg-accent/90 px-12 h-12 text-lg font-bold" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Confirm & Submit'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

const Separator = () => <div className="h-px bg-muted w-full my-2" />;
