'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa';

const footerLinks = {
  Platform: [
    { label: 'Browse Courses', href: '/courses' },
    { label: 'Featured Courses', href: '/courses?sort=popular' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Become Instructor', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const socialLinks = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center shadow-md">
                <HiOutlineAcademicCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Learn<span className="gradient-text">Verse</span>
              </span>
            </Link>
            <p className="text-gray-500 text-[0.92rem] leading-relaxed mb-6 max-w-sm">
              Empowering learners worldwide with premium courses from industry experts. Start your learning journey today.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#6C5CE7] hover:border-[#6C5CE7] hover:shadow-sm transition-all"
                >
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={`col-${title}`}>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={`link-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-[0.9rem] text-gray-500 hover:text-[#6C5CE7] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} LearnVerse. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
