"use client"

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, Sparkles, Smartphone, CreditCard } from 'lucide-react';
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
    mpesaCode: '',
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
          <h2 className="text-3xl font-bold font-headline text-primary">Application Submitted!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you {formData.name}. Your application for {formData.jobRole || 'Canada Jobs'} has been received. Our team will verify your payment of Ksh 950 (M-Pesa Code: {formData.mpesaCode}) and contact you via {formData.phone} for the next steps.
          </p>
          <div className="pt-4">
            <Button onClick={() => window.location.href = '/'} className="bg-primary">Return Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
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
                  <Label htmlFor="phone">Phone Number (254...)</Label>
                  <Input id="phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="e.g., 254704118070" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="example@mail.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input id="idNumber" value={formData.idNumber} onChange={e => handleChange('idNumber', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
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
                      AI Guidance
                    </Button>
                  </div>
                  <Textarea 
                    id="qualifications" 
                    value={formData.qualifications} 
                    onChange={e => handleChange('qualifications', e.target.value)} 
                    placeholder="Briefly describe your work history and why you are qualified..." 
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
                        <p className="font-medium">Recommended Roles based on your skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {aiSuggestions.recommendedJobs.map(job => (
                            <Button key={job} variant="secondary" size="sm" onClick={() => handleChange('jobRole', job)} className="h-7 text-[10px]">
                              {job}
                            </Button>
                          ))}
                        </div>
                        <p className="font-medium pt-2">Tailored Application Statement:</p>
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
                          Add AI Statement to Qualifications
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 py-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <CreditCard className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">Payment Step (Ksh 950)</h3>
                    <p className="text-sm text-muted-foreground">Registration fee is mandatory and fully refundable if not selected.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <Smartphone className="h-5 w-5" />
                      M-Pesa Payment Procedure
                    </div>
                    <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                      <li>Go to <strong>M-Pesa Menu</strong></li>
                      <li>Select <strong>Lipa na M-PESA</strong></li>
                      <li>Select <strong>Buy Goods and Services</strong></li>
                      <li>Enter Till No: <strong className="text-primary text-lg">937226</strong></li>
                      <li>Enter Amount: <strong>Ksh 950</strong></li>
                      <li>Enter PIN and Complete</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mpesaCode">Enter M-Pesa Transaction Code</Label>
                    <Input 
                      id="mpesaCode" 
                      value={formData.mpesaCode} 
                      onChange={e => handleChange('mpesaCode', e.target.value.toUpperCase())} 
                      placeholder="e.g. QXA12BC34" 
                      className="text-lg font-mono tracking-widest h-12"
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="font-headline text-xl font-bold text-primary border-b pb-2">Review Your Application</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ID Number</p>
                      <p className="font-medium">{formData.idNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{formData.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground">Target Role</p>
                      <p className="font-medium">{formData.jobRole}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{formData.county}, {formData.ward}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">M-Pesa Code</p>
                      <p className="font-medium text-accent font-mono">{formData.mpesaCode}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 p-4 bg-muted rounded-lg text-xs text-muted-foreground italic">
                  By clicking "Submit Application", you agree to our privacy policy and confirm that the information provided is true and accurate.
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
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Submit Application'}
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