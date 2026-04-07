
import { Mail, Phone, MapPin, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-accent text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <span className="font-headline text-xl font-bold tracking-tighter leading-none">JOBS</span>
                <span className="text-[10px] tracking-[0.3em] font-bold text-primary">IN CANADA</span>
              </div>
            </div>
            <p className="text-sm text-blue-100 leading-relaxed">
              Accredited by National Employment Authority. We facilitate legal pathways for Kenyans to live and work in Canada under international labour laws.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-primary mb-4 uppercase">Quick Links</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><Link href="/jobs" className="hover:text-primary">Job Listings</Link></li>
              <li><Link href="/procedure" className="hover:text-primary">Process Steps</Link></li>
              <li><Link href="/admin" className="hover:text-primary flex items-center gap-1"><Lock className="h-3 w-3" /> Admin Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-primary mb-4 uppercase">Direct Contact</h3>
            <ul className="space-y-3 text-sm text-blue-100">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+254 783 334 670</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>apply@canadapathwayjobs.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Accredited NEA Offices, Kenya</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-blue-200 uppercase tracking-widest font-bold">
          <p>© 2025 Jobs In Canada Pathway. Official Recruitment Portal.</p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
