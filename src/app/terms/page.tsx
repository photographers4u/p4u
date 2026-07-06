import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import Navbar from "@/components/navbar";
import { siteConfig } from "@/config/site";
import { getAuthSession } from "@/server/auth/session";

const effectiveDate = "April 7, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Read the terms that govern your use of ${siteConfig.name}.`,
};

export default async function TermsPage() {
  const session = await getAuthSession({ headers: await headers() });

  return (
    <>
      <Navbar session={session} />
      <MobileBottomNav session={session} />

      <main className="mx-auto max-w-2xl px-6 py-16 max-md:pb-32">
        <div className="mb-10">
          <p className="mb-2 text-sm text-slate-400">
            Effective {effectiveDate}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Terms of Service
          </h1>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-600">
          <section className="space-y-3">
            <p>
              {siteConfig.name} is a moderated platform for discovering and
              submitting items. These Terms of
              Service explain the rules that apply when you browse the site,
              create an account, submit content, or use any related features.
            </p>
            <p>
              Please also read our{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              , which explains how we collect, use, and protect information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              1. Acceptance of these terms
            </h2>
            <p>
              By accessing or using {siteConfig.name}, you agree to these Terms
              of Service and our{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              If you do not agree to these terms, do not use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              2. Eligibility and accounts
            </h2>
            <ul className="space-y-2 pl-4">
              <li>
                You must be at least 13 years old to use the service. If you
                are under the age of majority where you live, you should use
                the service only with appropriate parent or guardian permission.
              </li>
              <li>
                You must provide accurate account information and keep it
                reasonably up to date.
              </li>
              <li>
                You are responsible for activity that occurs under your account
                and for keeping your login credentials secure.
              </li>
              <li>
                You must promptly notify us if you believe your account has
                been compromised or used without authorization.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              3. What the service does
            </h2>
            <p>
              {siteConfig.name} offers a moderated product for browsing public
              items, as well as dashboard features for submitting and managing
              your own content.
            </p>
            <p>
              We may add, remove, pause, or change features at any time,
              including review workflows, submission criteria, visibility
              rules, search behavior, and account functionality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              4. Your content and permissions
            </h2>
            <p>
              You keep ownership of the text, images, links, logos,
              screenshots, and other material you submit.
            </p>
            <p>
              By submitting content through the service, you give us a
              non-exclusive, worldwide, royalty-free license to host, store,
              reproduce, format, adapt for display, moderate, publish, and
              distribute that content as needed to operate, improve, and
              promote the service.
            </p>
            <ul className="space-y-2 pl-4">
              <li>
                You represent that you own the content you submit or have all
                necessary rights and permissions to submit it.
              </li>
              <li>
                You are responsible for making sure your submissions do not
                infringe intellectual property, privacy, publicity, or other
                rights.
              </li>
              <li>
                You should not submit confidential information, private
                personal data about others, or content you are not comfortable
                making public if approved.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              5. Moderation, publication, and takedowns
            </h2>
            <p>
              We review submissions before publication and may approve, reject,
              adjust formatting, unpublish, or remove content at our
              discretion.
            </p>
            <ul className="space-y-2 pl-4">
              <li>
                We may remove content that is unlawful, deceptive, infringing,
                low-quality, unsafe, abusive, spammy, or inconsistent with the
                goals of the platform.
              </li>
              <li>
                We may suspend or terminate accounts that repeatedly violate
                these Terms or interfere with moderation, security, or the
                experience of other users.
              </li>
              <li>
                If you believe content on the service violates your rights,
                contact us at{" "}
                <Link
                  href={`mailto:${siteConfig.contact.support}`}
                  className="underline underline-offset-4"
                >
                  {siteConfig.contact.support}
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              6. Honest feedback, reviews, and public statements
            </h2>
            <p>
              Nothing in these Terms is intended to restrict lawful, honest
              reviews or good-faith opinions about our service.
            </p>
            <p>
              We may remove content or submissions that disclose confidential
              information, include harassment or abuse, are unrelated to the
              service, or are clearly false or misleading.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              7. Prohibited conduct
            </h2>
            <ul className="space-y-2 pl-4">
              <li>
                Breaking the law, violating another person&apos;s rights, or
                using the service for fraud, impersonation, harassment, or
                abuse.
              </li>
              <li>
                Uploading content you do not have permission to use, including
                copyrighted images, logos, screenshots, or text.
              </li>
              <li>
                Submitting false, misleading, manipulated, or deceptive
                listings, endorsements, or claims about your content.
              </li>
              <li>
                Attempting to scrape, harvest, or bulk extract data from the
                service using automated means without our written permission,
                except where those restrictions are not allowed by law.
              </li>
              <li>
                Interfering with the service, bypassing security measures,
                probing for vulnerabilities, or attempting unauthorized access
                to accounts, data, or infrastructure.
              </li>
              <li>Using the service to distribute malware, spam, or harmful code.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              8. Third-party links and content
            </h2>
            <p>
              Public listings may include links to third-party products, image
              hosts, and other websites. We do not
              control those third parties and are not responsible for their
              content, availability, security, or privacy practices.
            </p>
            <p>
              Your use of third-party sites is at your own risk and subject to
              their own terms and policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              9. Intellectual property in the service
            </h2>
            <p>
              Except for user content, the service and its branding, design,
              software, copy, and related materials are owned by {siteConfig.name}{" "}
              or its licensors and are protected by applicable law.
            </p>
            <p>
              These Terms do not give you the right to copy, resell,
              sublicense, or exploit our service content or branding except as
              expressly permitted by us or by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">10. Feedback</h2>
            <p>
              If you send ideas, suggestions, or product feedback, you agree
              that we may use it without restriction or compensation to you,
              and without any obligation to keep it confidential.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              11. Availability, disclaimers, and no warranties
            </h2>
            <p>
              The service is provided on an &quot;as is&quot; and &quot;as
              available&quot; basis. To the fullest extent permitted by law, we
              disclaim warranties of any kind, whether express, implied, or
              statutory, including warranties of merchantability, fitness for a
              particular purpose, title, non-infringement, and uninterrupted
              availability.
            </p>
            <p>
              We do not guarantee that the service will always be available,
              error-free, secure, accurate, or suitable for your specific
              needs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              12. Limitation of liability
            </h2>
            <p>
              To the fullest extent permitted by law, {siteConfig.name} and its
              affiliates, operators, employees, and service providers will not
              be liable for any indirect, incidental, special, consequential,
              exemplary, or punitive damages, or for any loss of profits, data,
              goodwill, use, or business opportunity arising out of or related
              to your use of the service.
            </p>
            <p>
              To the fullest extent permitted by law, our aggregate liability
              for claims arising from or related to the service will not exceed
              the greater of INR 5,000 or the amount you paid us, if any, in
              the 12 months before the claim arose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">13. Indemnity</h2>
            <p>
              You agree to defend, indemnify, and hold harmless {siteConfig.name}{" "}
              and its affiliates, operators, employees, and service providers
              from claims, losses, liabilities, damages, judgments, and
              expenses, including reasonable legal fees, arising from or
              related to your content, your misuse of the service, or your
              violation of these Terms or applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              14. Governing law
            </h2>
            <p>
              Unless applicable consumer law requires otherwise, these Terms
              are governed by the laws of India, without regard to
              conflict-of-law principles. Courts located in Pune, Maharashtra
              will have exclusive jurisdiction over disputes arising out of or
              relating to these Terms or the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              15. Changes to these terms
            </h2>
            <p>
              We may update these Terms from time to time to reflect product
              changes, legal developments, or operational needs. When we do, we
              will update the effective date at the top of this page and, where
              appropriate, provide additional notice.
            </p>
            <p>
              Your continued use of the service after updated Terms take effect
              means you accept the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              16. Contact us
            </h2>
            <p>
              Questions about these Terms can be sent to{" "}
              <Link
                href={`mailto:${siteConfig.contact.support}`}
                className="underline underline-offset-4"
              >
                {siteConfig.contact.support}
              </Link>{" "}
              or{" "}
              <Link
                href={`mailto:${siteConfig.contact.email}`}
                className="underline underline-offset-4"
              >
                {siteConfig.contact.email}
              </Link>
              .
            </p>
            <p>
              You can also review our{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4"
              >
                Privacy Policy
              </Link>{" "}
              for details about how we handle personal information.
            </p>
            <p>
              Mailing location: {siteConfig.contact.address.city},{" "}
              {siteConfig.contact.address.pin},{" "}
              {siteConfig.contact.address.country}.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
