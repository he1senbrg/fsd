import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Footer() {
  return (
    <footer className="bg-[var(--dark-brown)] text-[var(--cream)] pt-16 pb-8 border-t border-[var(--sand)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-3xl text-[var(--terracotta)]">
                temple_hindu
              </span>
              <span className="text-2xl font-bold tracking-tight font-display">KalaSetu</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering traditional artists and craftspeople through technology, funding, and
              community.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 font-display text-[var(--sand)]">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/discover" className="hover:text-[var(--terracotta)] transition-colors">
                  Browse Artists
                </Link>
              </li>
              <li>
                <Link
                  href="/opportunities"
                  className="hover:text-[var(--terracotta)] transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="hover:text-[var(--terracotta)] transition-colors"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/crowdfunding"
                  className="hover:text-[var(--terracotta)] transition-colors"
                >
                  Start Crowdfunding
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 font-display text-[var(--sand)]">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/events/create"
                  className="hover:text-[var(--terracotta)] transition-colors"
                >
                  For Organizers
                </Link>
              </li>
              <li>
                <Link
                  href="/crowdfunding"
                  className="hover:text-[var(--terracotta)] transition-colors"
                >
                  For Sponsors
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[var(--terracotta)] transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[var(--terracotta)] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 font-display text-[var(--sand)]">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe for updates on new events and featured artists.
            </p>
            <div className="flex">
              <input
                className="bg-[var(--deep-teal)] border-none text-white px-4 py-2 rounded-l-lg w-full focus:ring-1 focus:ring-[var(--terracotta)] placeholder-gray-500 text-sm"
                placeholder="Your email"
                type="email"
              />
              <Button className="bg-[var(--terracotta)] px-4 py-2 rounded-r-lg hover:bg-[#d06a4e] transition-colors">
                <span className="material-symbols-outlined text-white text-sm">send</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2026 KalaSetu. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
