import React from "react";

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* ================= HERO ================= */}
      <section className="relative h-[500px] w-full overflow-hidden">

        {/* Background Image */}
        <img
          src="https://images01.nicepagecdn.com/c461c07a441a5d220e8feb1a/2cc1a632c8c5511c86638369/jhhhhhh.jpg"
          alt="Business meeting"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        

        {/* Hero Content */}
        <div className="relative z-10 flex h-[400px] items-center justify-center px-6 text-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[4px] text-blue-600">
              Get In Touch
            </p>

            <h1 className="text-5xl font-bold text-blue-600 md:text-7xl">
              Contact Us
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/90 md:text-lg">
              Have a question or want to work with us?
              We would love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className="bg-[#f5f5f5] px-6 py-20">

        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="flex flex-col justify-center">

            <p className="mb-3 text-sm font-semibold uppercase tracking-[3px] text-gray-500">
              Contact
            </p>

            <h2 className="text-4xl font-bold leading-tight text-blue-600 md:text-5xl">
              Let's work
              <br />
              together.
            </h2>

            <p className="mt-6 max-w-md leading-7 text-gray-600">
              We are always happy to hear from you. Whether you have a
              question, a project idea, or need more information, feel free
              to send us a message.
            </p>

            {/* Contact Information */}
            <div className="mt-10 space-y-6">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Email
                </p>

                <a
                  href="mailto:contact@projectflow.com"
                  className="mt-1 block text-lg text-gray-900 hover:underline"
                >
                  contact@projectflow.com
                </a>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Phone
                </p>

                <p className="mt-1 text-lg text-gray-900">
                  +237 600 000 000
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Location
                </p>

                <p className="mt-1 text-lg text-gray-900">
                  Douala, Cameroon
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="bg-white p-8 shadow-sm md:p-10">

            <h3 className="mb-8 text-2xl font-bold text-blue-600">
              Send us a message
            </h3>

            <form className="space-y-6">

              {/* First + Last Name */}
              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    First Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your first name"
                    className="w-full border-b border-gray-400 bg-transparent px-0 py-3 text-gray-900 outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full border-b border-gray-400 bg-transparent px-0 py-3 text-gray-900 outline-none transition focus:border-black"
                  />
                </div>

              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border-b border-gray-400 bg-transparent px-0 py-3 text-gray-900 outline-none transition focus:border-black"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full border-b border-gray-400 bg-transparent px-0 py-3 text-gray-900 outline-none transition focus:border-black"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Message
                </label>

                <textarea
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full resize-none border-b border-gray-400 bg-transparent px-0 py-3 text-gray-900 outline-none transition focus:border-black"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-4 bg-blue-600 px-10 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-gray-800"
              >
                Send Message
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black px-6 py-8 text-center text-sm text-white">
        © 2026 ProjectFlow. All rights reserved.
      </footer>

    </div>
  );
};

export default ContactPage;
