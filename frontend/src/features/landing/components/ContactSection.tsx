import React, { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ContactImage from '../../../assets/images/Contact Image.jpg';
import { createContactMessage } from '../../../api/Contact/ContactMessages';

const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      return;
    }

    setStatus('sending');

    try {
      await createContactMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      setName('');
      setEmail('');
      setMessage('');
      setStatus('success');
    } catch (error) {
      console.error('Failed to send contact message:', error);
      setStatus('error');
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#f8fafc] px-6 py-20 font-sans sm:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            {/* Image */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="h-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
                <img
                  src={ContactImage}
                  alt="Professionals working together"
                  className="h-full min-h-[360px] w-full object-cover sm:min-h-[440px]"
                />
              </div>
            </div>

            {/* Contact Content */}
            <div className="flex items-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              <div className="w-full max-w-xl">
                <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                  Get in touch
                </span>

                <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#06142e] sm:text-4xl">
                  Have a question, an idea, or need a hand?{' '}
                  <span className="text-blue-600">Tell us what’s on your mind.</span>
                </h2>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-sm font-semibold text-[#06142e]"
                    >
                      Your name
                    </label>

                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={event => setName(event.target.value)}
                      placeholder="Enter your name"
                      disabled={status === 'sending'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#06142e] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-2 block text-sm font-semibold text-[#06142e]"
                    >
                      Email address
                    </label>

                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="Enter your email"
                      disabled={status === 'sending'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#06142e] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-2 block text-sm font-semibold text-[#06142e]"
                    >
                      Message
                    </label>

                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={message}
                      onChange={event => setMessage(event.target.value)}
                      placeholder="Write your message..."
                      disabled={status === 'sending'}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#06142e] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {/* Status */}
                  {status === 'success' && (
                    <p className="text-sm font-medium text-green-600">
                      Your message has been sent successfully.
                    </p>
                  )}

                  {status === 'error' && (
                    <p className="text-sm font-medium text-red-600">
                      Please fill in all fields and try again.
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#06142e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b2148] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}

                    {status !== 'sending' && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>

                <p className="mt-5 text-xs font-medium text-slate-400">
                  We’ll get back to you as soon as possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
