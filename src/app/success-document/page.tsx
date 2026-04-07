
'use client';

import React from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, ShieldCheck, Award, FileText, CheckCircle2, Download, Printer } from 'lucide-react';
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!app || app.status !== 'docs_approved') {
    return <div className="p-12 text-center uppercase font-bold">Access Denied: Application Not Finalized</div>;
  }

  return (
    <div className="bg-slate-200 min-h-screen py-12 px-4 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            <Printer className="h-4 w-4" /> Print PDF
          </button>
        </div>

        <Card className="border-none shadow-2xl bg-white relative overflow-hidden print:shadow-none">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg]">
            <Globe className="w-[500px] h-[500px] text-accent" />
          </div>

          <CardContent className="p-12 relative z-10 border-t-[12px] border-primary">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div className="flex items-center gap-3">
                <Globe className="h-16 w-16 text-primary" />
                <div className="flex flex-col">
                  <span className="font-headline text-3xl font-black tracking-tighter leading-none text-accent">CANADA PATHWAY</span>
                  <span className="text-[10px] tracking-[0.5em] font-bold text-primary">OFFICIAL RECRUITMENT 2025</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="border-green-600 text-green-600 px-4 py-1 text-xs font-bold mb-2">VERIFIED & APPROVED</Badge>
                <p className="text-xs text-muted-foreground uppercase font-bold">Ref: CP-KNY-{app.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="text-center space-y-2 border-b-2 border-slate-100 pb-8">
                <h1 className="text-4xl font-black text-accent uppercase italic underline decoration-primary">Certificate of Selection</h1>
                <p className="text-slate-500 font-medium">This is to certify that the following applicant has met all statutory requirements for the 2025 Canadian Labour Market recruitment drive.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Assigned Job Position</p>
                    <p className="text-xl font-bold text-primary uppercase italic">{app.jobPostingId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Base Annual Salary</p>
                    <p className="text-lg font-bold text-accent">$69,500 CAD (Contracted)</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Status of Vetting</p>
                    <div className="flex items-center gap-2 text-green-700 font-bold">
                      <ShieldCheck className="h-5 w-5" />
                      DOCUMENTS VALIDATED
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Expected Intake</p>
                    <p className="text-lg font-bold text-accent italic">July 2025 Cycle</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 border-l-4 border-accent bg-accent/5 rounded-r-2xl">
                <h3 className="font-bold text-accent uppercase flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Statutory Directives
                </h3>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>The candidate is advised to remain reachable on their registered phone number for the next 14 days.</li>
                  <li>Official Job Offer Letter will be dispatched via courier services to your provided county/ward location.</li>
                  <li>This certificate grants the bearer priority in Visa Sponsorship and Air-Ticket allocation.</li>
                  <li>Any alteration of this document renders the recruitment contract void.</li>
                </ol>
              </div>

              <div className="flex justify-between items-end pt-12">
                <div className="space-y-1">
                  <div className="w-48 h-12 bg-slate-100 rounded-lg flex items-center justify-center italic text-slate-300 font-mono text-xs">
                    Digital Signature Verified
                  </div>
                  <p className="text-[10px] uppercase font-black text-slate-400">Chief Recruitment Officer</p>
                  <p className="text-xs font-bold text-accent">Canada Pathway Jobs Authority</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Seal of Authenticity</p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="bg-primary text-white p-4 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
            This document is generated automatically by the official Canada Pathway portal.
          </div>
        </Card>
      </div>
    </div>
  );
}
