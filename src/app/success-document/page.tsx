'use client';

import React from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, ShieldCheck, Award, FileText, CheckCircle2, Printer, Receipt, Landmark } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function SuccessDocumentPage() {
  const { firestore, user } = useFirebase();

  const appsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'applications'), orderBy('submissionDate', 'desc'));
  }, [firestore, user]);

  const { data: apps, isLoading } = useCollection(appsQuery);
  const app = apps?.[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!app || app.status !== 'docs_approved') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-12 space-y-4">
          <ShieldCheck className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold uppercase text-accent">Access Denied</h2>
          <p className="text-muted-foreground text-sm">Your application hasn't reached the final approval stage yet. Please complete all vetting steps.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-200 min-h-screen py-8 md:py-12 px-4 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h2 className="font-black text-accent uppercase italic text-sm md:text-lg">Official Document Portal</h2>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform"
          >
            <Printer className="h-4 w-4" /> Download PDF / Print
          </button>
        </div>

        <Card className="border-none shadow-2xl bg-white relative overflow-hidden print:shadow-none print:border-none">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg]">
            <Globe className="w-[600px] h-[600px] text-accent" />
          </div>

          <CardContent className="p-8 md:p-16 relative z-10 border-t-[16px] border-primary">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 border-b-2 border-slate-100 pb-12">
              <div className="flex items-center gap-4">
                <Globe className="h-20 w-20 text-primary" />
                <div className="flex flex-col">
                  <span className="font-headline text-4xl font-black tracking-tighter leading-none text-accent">CANADA PATHWAY</span>
                  <span className="text-[11px] tracking-[0.5em] font-bold text-primary uppercase mt-1">Official Recruitment 2025</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <Badge className="bg-green-600 text-white px-4 py-1.5 text-xs font-black mb-3">VERIFIED & RATIFIED</Badge>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Document No.</p>
                <p className="text-sm font-bold text-accent">CP-KNY-{app.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Issued: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-10">
              <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-5xl font-black text-accent uppercase italic underline decoration-primary decoration-4 underline-offset-8">Certificate of Selection</h1>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                  This serves as official confirmation that the applicant identified below has successfully passed the statutory background checks, academic vetting, and financial clearances required for the 2025 Canadian Global Recruitment Intake.
                </p>
              </div>

              {/* Applicant & Job Data */}
              <div className="grid md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Assigned Position</p>
                    <p className="text-2xl font-black text-primary uppercase italic">{app.jobPostingId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Base Annual Salary</p>
                    <p className="text-xl font-bold text-accent">$69,500 CAD <span className="text-xs font-normal text-muted-foreground italic">(Guaranteed)</span></p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Academic Clearance</p>
                    <div className="flex items-center gap-2 text-green-700 font-black text-sm">
                      <ShieldCheck className="h-5 w-5" />
                      DOCUMENTS VALIDATED (MOE)
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Intake Cycle</p>
                    <p className="text-xl font-bold text-accent italic">July 2025 Enrollment</p>
                  </div>
                </div>
              </div>

              {/* Payment Receipts Section */}
              <div className="space-y-4">
                <h3 className="font-black text-accent uppercase text-sm flex items-center gap-2 border-b pb-2">
                  <Landmark className="h-5 w-5 text-primary" />
                  Consolidated Financial Receipts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-dashed border-slate-200 p-5 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400 mb-1">Registration Fee (Ksh 950)</p>
                      <p className="text-sm font-bold text-accent">REF: <span className="text-primary font-mono">{app.mpesaCode950}</span></p>
                    </div>
                    <Receipt className="h-8 w-8 text-slate-200" />
                  </div>
                  <div className="bg-white border-2 border-dashed border-slate-200 p-5 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400 mb-1">eCitizen Vetting (Ksh 1,027)</p>
                      <p className="text-sm font-bold text-accent">REF: <span className="text-primary font-mono">{app.mpesaCode1027}</span></p>
                    </div>
                    <Receipt className="h-8 w-8 text-slate-200" />
                  </div>
                </div>
              </div>

              {/* Statutory Notice */}
              <div className="space-y-4 p-6 border-l-8 border-accent bg-accent/5 rounded-r-3xl">
                <h3 className="font-black text-accent uppercase flex items-center gap-2 text-sm">
                  <Award className="h-5 w-5 text-primary" />
                  Executive Directives
                </h3>
                <ol className="text-[11px] text-slate-700 space-y-3 list-decimal list-inside leading-relaxed font-medium">
                  <li>This certificate grants the bearer priority status for Visa processing and Air-Ticket allocation.</li>
                  <li>Official Contract & Offer Letter will be dispatched to your registered address within 14 working days.</li>
                  <li>Applicants are required to maintain an active passport; sponsorship covers all travel logistics.</li>
                  <li>The validity of this document is subject to the authenticity of provided academic records.</li>
                </ol>
              </div>

              {/* Signatures */}
              <div className="flex flex-col md:flex-row justify-between items-end pt-8 gap-8">
                <div className="space-y-2">
                  <div className="w-56 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center italic text-slate-300 font-mono text-xs">
                    Digitally Signed via <br/> CP-RECRUIT-SECURE
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Director General</p>
                    <p className="text-sm font-bold text-accent">Canada Pathway Recruitment Board</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-3">
                  <CheckCircle2 className="h-20 w-20 text-green-600" />
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] mb-1">Authenticated</p>
                    <p className="text-[9px] font-bold text-accent italic">NEA/CPJ/2025/VERIFIED</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="bg-accent text-white py-4 text-center text-[10px] font-black uppercase tracking-[0.4em]">
            Official Canada Pathway Recruitment Registry • {new Date().getFullYear()} Global Intake
          </div>
        </Card>

        <div className="mt-8 text-center text-slate-400 text-[10px] uppercase font-bold tracking-widest print:hidden">
          Save this PDF for presentation during your embassy interview.
        </div>
      </div>
    </div>
  );
}
