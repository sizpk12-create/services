/**
 * You Want Services - Contact View
 * Phase 1 Architecture
 */

import React, { useState } from 'react';
import { Input, Button, Alert } from '../../components/common/UIComponents';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useDemoMode } from '../../context/DemoContext';

export const ContactView: React.FC = () => {
  const { assertNotProduction } = useDemoMode();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assertNotProduction('Submit Contact Inquiry');
    setSubmitted(true);
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            Contact You Want Services
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Have questions about posting a request, onboarding as a contractor, or platform partnerships? Our support team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Direct Support Channels</h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Customer Support Phone</p>
                    <p className="text-slate-600">1-800-YOU-WANT (1-800-968-9268)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Mon - Fri, 8am - 7pm CST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">General & Contractor Inquiries</p>
                    <p className="text-slate-600">support@youwantservices.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">National Headquarters</p>
                    <p className="text-slate-600">Chicago & Springfield, Illinois</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Message Received</h3>
                  <p className="text-sm text-slate-600 mt-1 mb-6">
                    Thank you for reaching out. In Demo Mode, your message has been safely logged in the sandbox environment.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Note
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Send Us a Message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Jane Smith"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                    />
                  </div>

                  <Input
                    label="Subject"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Question about service categories or contractor onboarding"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Provide details about your request or inquiry..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
