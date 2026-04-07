import { Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-headline text-lg font-bold text-primary mb-4">Canada Pathway Jobs</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are accredited by Ministry of Labour, National Employment Authority and operate within both National and International Labour Laws. Helping Kenyans build a future in Canada.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-primary">Job Listings</Link></li>
              <li><Link href="/benefits" className="hover:text-primary">Benefits of Canada</Link></li>
              <li><Link href="/procedure" className="hover:text-primary">Application Steps</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-primary mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+254783334670 / +254775292703</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>hr.manager@canadajobexpressentry.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>National Employment Authority Accredited Offices</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2025 Canada Pathway Jobs. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}