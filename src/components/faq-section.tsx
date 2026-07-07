"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "What is Photographers4u?",
    answer:
      "Photographers4u is a dedicated discovery platform designed to bridge the gap between talented photographers and potential clients. It allows photographers to create a professional profile, showcase their portfolio, and gain visibility within their specific niche and location.",
  },
  {
    id: "2",
    question: "How does the platform help photographers?",
    answer:
      "The platform acts as a lead generation engine. By listing your services, you become searchable via location, budget, and category filters. This ensures that the leads you receive are curated and aligned with your specific style and pricing.",
  },
  {
    id: "3",
    question: "What if I face issues while registering my profile?",
    answer: `We are here to help! If you encounter any technical glitches or have questions during registration, you can contact our support team at ${siteConfig.contact.support} or call us directly at ${siteConfig.contact.phone}.`,
  },
  {
    id: "4",
    question: "What if I don't have a portfolio to showcase yet?",
    answer:
      "While a portfolio is highly recommended to attract clients, you can still register and start building your profile. We encourage you to upload your best work as you grow, as curated profiles with clear examples of work tend to receive the most leads.",
  },
  {
    id: "5",
    question:
      "My profile is showing as 'Pending' - how long does verification take?",
    answer:
      "To maintain a high standard of quality on our platform, we conduct a thorough manual verification of every profile. This process typically takes 2-3 business days. You will receive an update once your profile is live.",
  },
  {
    id: "6",
    question: "How will potential clients find me?",
    answer:
      "Clients use our advanced search filters to find photographers based on their specific needs, such as geographic location, event category (e.g., Wedding, Fashion, Corporate), and budget range.",
  },
  {
    id: "7",
    question: "Does Photographers4u take a commission from my leads?",
    answer:
      "No. We believe in supporting the creative community, so we do not take any commission from the leads you generate through our platform. All earnings from your projects belong entirely to you.",
  },
  {
    id: "8",
    question: "Is Photographers4u responsible for my payments?",
    answer:
      "No. Photographers4u acts solely as an information provider. All financial negotiations, contracts, and payments are handled directly between you and the client. We do not facilitate or interfere with your payment terms.",
  },
  {
    id: "9",
    question: "Are there any fees for registering on Photographers4u.com?",
    answer:
      "Currently, registration is completely free! There are no hidden charges or subscription fees for photographers or customers to use our platform.",
  },
];

const FAQSection = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <section className="px-6 py-20 font-sans text-[#222222] antialiased sm:bg-white max-md:px-4 max-md:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12">
          <h2 className="mb-4 text-[32px] leading-tight font-semibold tracking-tight">
            Resources and support
          </h2>
        </div>

        <div className="divide-y divide-zinc-200">
          {faqs.map((faq) => (
            <div key={faq.id} className="py-6">
              <button
                type="button"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="group flex w-full items-center justify-between text-left"
              >
                <span className="text-[18px] font-normal text-[#222222] transition-all decoration-zinc-300 underline-offset-4 group-hover:underline">
                  {faq.question}
                </span>
                <div className="text-zinc-400">
                  {openId === faq.id ? (
                    <Minus size={20} strokeWidth={1.5} />
                  ) : (
                    <Plus size={20} strokeWidth={1.5} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pb-2 text-[16px] leading-relaxed font-light text-[#717171]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-zinc-200 pt-12">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h4 className="mb-1 text-lg font-semibold text-[#222222]">
                Can't find what you're looking for?
              </h4>
              <p className="text-[15px] text-zinc-500">
                Our support team is here for you 24/7.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/contact")}
              className="inline-flex items-center justify-center rounded-lg border border-black px-6 py-3 text-sm font-semibold transition-colors hover:bg-zinc-50 active:scale-95"
            >
              Contact us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
