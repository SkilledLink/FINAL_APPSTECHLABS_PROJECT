import React, { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
      className="relative overflow-hidden bg-[#f8fafc] px-6 py-20 font-sans sm:py-24 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid lg:grid-cols-2">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="h-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/050/822/031/small/customer-support-concept-young-afro-female-manager-wearing-headset-using-laptop-at-workplace-and-looking-at-camera-free-space-photo.jpg"
                  alt="A welder at work in Cameroon"
                  className="h-full min-h-[360px] w-full object-cover sm:min-h-[440px]"
                />
              </div>
            </div>

            <div className="flex items-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              <div className="w-full max-w-xl">
                <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  Get in touch
                </span>

                <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#06142e] sm:text-4xl dark:text-white">
                  Have a question, an idea, or need a hand?{' '}
                  <span className="text-blue-600 dark:text-blue-400">Tell us what’s on your mind.</span>
                </h2>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-sm font-semibold text-[#06142e] dark:text-white"
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#06142e] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-2 block text-sm font-semibold text-[#06142e] dark:text-white"
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#06142e] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-2 block text-sm font-semibold text-[#06142e] dark:text-white"
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
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#06142e] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
                    />
                  </div>

                  {status === 'success' && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Your message has been sent successfully.
                    </p>
                  )}

                  {status === 'error' && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Please fill in all fields and try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#06142e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b2148] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}

                    {status !== 'sending' && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>

                <p className="mt-5 text-xs font-medium text-slate-400 dark:text-slate-500">
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