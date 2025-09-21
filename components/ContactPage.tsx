import React from 'react';

interface ContactPageProps {
  formData: {
    name: string;
    email: string;
    contact: string;
    subject: string;
    description: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ formData, onChange, onSubmit, onCancel }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-200">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900">Get in Touch</h1>
        <p className="mt-4 text-lg text-slate-600">
          Have a question or feedback? We'd love to hear from you.
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={onChange} 
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
              placeholder="Your Name"
              required 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={onChange} 
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
              placeholder="you@example.com"
              required 
            />
          </div>
        </div>
        <div>
            <label htmlFor="contact" className="block text-sm font-medium text-slate-700">Contact Number</label>
            <input 
              type="tel" 
              id="contact" 
              name="contact" 
              value={formData.contact} 
              onChange={onChange} 
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
              placeholder="(123) 456-7890"
              required 
            />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700">Subject</label>
          <input 
            type="text" 
            id="subject" 
            name="subject" 
            value={formData.subject} 
            onChange={onChange} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
            placeholder="How can we help?"
            required 
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">Message</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={onChange} 
            rows={5} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
            placeholder="Your message..."
            required
          ></textarea>
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactPage;