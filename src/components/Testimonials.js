'use client';

import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi';

const testimonials = [
  {
    name: 'Alex Richardson',
    role: 'Software Engineer at Google',
    content: 'LearnVerse completely transformed my career. The courses are incredibly well-structured and the instructors are world-class. I went from a junior dev to a senior engineer in just 8 months.',
    rating: 5,
    avatar: 'A',
  },
  {
    name: 'Priya Sharma',
    role: 'Data Scientist at Meta',
    content: 'The ML courses on LearnVerse are the best I\'ve found online. The hands-on projects and real-world datasets made all the difference. Highly recommend to anyone serious about data science.',
    rating: 5,
    avatar: 'P',
  },
  {
    name: 'Marcus Chen',
    role: 'Product Designer at Stripe',
    content: 'As a designer, I was blown away by the UI/UX program. The curriculum is modern, practical, and the community is amazing. My portfolio improved dramatically after completing the course.',
    rating: 5,
    avatar: 'M',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge badge-primary mb-4 inline-block">Testimonials</span>
          <h2 className="section-title mb-4">Loved by Thousands of Learners</h2>
          <p className="section-subtitle mx-auto">
            See what our community has to say about their learning experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <HiStar key={j} className="w-5 h-5 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-6 text-[0.95rem]">"{t.content}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
