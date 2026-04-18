import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { siteConfig } from "@/config/site";
import { getAuthSession } from "@/server/auth/session";

const effectiveDate = "April 7, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Learn how ${siteConfig.name} collects, uses, stores, and shares personal information.`,
};

export default async function PrivacyPolicyPage() {
  const session = await getAuthSession({ headers: await headers() });

  return (
    <>
      <Navbar session={session} />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-2 text-sm text-slate-400">
            Effective {effectiveDate}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Privacy Policy
          </h1>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <p>
              {siteConfig.name} is a moderated platform and public directory for
              photographers. This Privacy Policy explains what information we
              collect, why we collect it, how we share it, and the choices
              available to you.
            </p>
            <p>
              Your use of the service is also subject to our{" "}
              <Link href="/terms" className="underline underline-offset-4">
                Terms of Service
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">1. Scope</h2>
            <p>
              This Privacy Policy applies to the website, dashboards, public
              directory pages, and related services operated under the{" "}
              {siteConfig.name} brand.
            </p>
            <p>
              It covers information we collect when you browse the site, create
              an account, sign in, build a photographer profile, or contact us
              for support.
            </p>
            <p>
              It does not apply to third-party websites, image hosts, or other
              external services linked from our product. Those services operate
              under their own privacy practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              2. Information we collect
            </h2>
            <p>We collect information from a few different sources:</p>
            <ul className="space-y-2 pl-4">
              <li>
                <strong className="font-medium text-slate-700">
                  Account information.
                </strong>{" "}
                When you create or manage an account, we collect details such as
                your name, email address, login credentials, email-verification
                status, and any optional profile image you add.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  Authentication and session data.
                </strong>{" "}
                When you sign in, we process session identifiers and may store
                associated technical data such as IP address and user agent for
                security, fraud prevention, and session management.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  Submission content.
                </strong>{" "}
                If you create or submit a photographer profile, we collect the
                information you choose to provide. That can include names,
                biographies, locations, portfolio images, services, starting
                prices, public-contact preferences, and related metadata.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  Saved photographers and product activity.
                </strong>{" "}
                We store the photographers you save and related timestamps.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  Communications.
                </strong>{" "}
                If you contact support or respond to moderation or verification
                emails, we collect the contents of those communications and any
                details needed to resolve the request.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  Technical and infrastructure data.
                </strong>{" "}
                Our systems may process server logs, cache entries, and similar
                operational records needed to keep the service available,
                secure, and performant.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              3. How we use information
            </h2>
            <ul className="space-y-2 pl-4">
              <li>
                Create and manage accounts, authenticate users, and maintain
                active sessions.
              </li>
              <li>
                Review, moderate, publish, rank, and remove community
                submissions.
              </li>
              <li>
                Display public directory content and related metadata on the
                site.
              </li>
              <li>
                Send operational emails such as magic links, password resets,
                email-change confirmations, verification notices, and
                moderation-related updates.
              </li>
              <li>
                Provide support, troubleshoot issues, respond to abuse reports,
                and improve the reliability of the service.
              </li>
              <li>
                Protect the security and integrity of the app, detect suspicious
                activity, and enforce our Terms of Service and internal review
                standards.
              </li>
              <li>
                Maintain records needed for legal compliance, dispute handling,
                and legitimate business operations.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              4. Public content and visibility
            </h2>
            <p>
              {siteConfig.name} is built around public discovery. If you submit
              content for review and it is approved, the information in that
              listing may appear on public pages.
            </p>
            <p>
              Depending on your profile and account setup, that may include your
              name, avatar, bio, location, services, prices, contact options,
              and portfolio images.
            </p>
            <p>
              Please avoid submitting personal information you do not want
              displayed publicly. If you include third-party image URLs,
              viewers&apos; browsers may request those files directly from the
              external image host.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              5. When we share information
            </h2>
            <p>
              We do not sell personal information. We may share information:
            </p>
            <ul className="space-y-2 pl-4">
              <li>
                <strong className="font-medium text-slate-700">
                  With service providers and infrastructure vendors
                </strong>{" "}
                that help us run the app, such as providers involved in hosting,
                database operations, caching, email delivery, and account
                authentication.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  With reviewers, administrators, and internal staff
                </strong>{" "}
                who need access to review submissions, investigate issues, or
                provide support.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  With the public
                </strong>{" "}
                when approved submissions are published to the directory or
                public photographer pages.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  For legal or safety reasons
                </strong>{" "}
                if we believe disclosure is reasonably necessary to comply with
                law, respond to lawful requests, enforce our terms, or protect
                users, rights, or the service.
              </li>
              <li>
                <strong className="font-medium text-slate-700">
                  As part of a business transfer
                </strong>{" "}
                such as a merger, acquisition, financing, reorganization, or
                asset sale, subject to appropriate confidentiality and notice
                where required.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              6. Cookies and similar technologies
            </h2>
            <p>
              We use cookies and similar technologies primarily for essential
              service functions, including authentication, session continuity,
              security, and user preferences.
            </p>
            <p>
              As of the effective date of this policy, we do not use third-party
              advertising trackers in the product to serve behaviorally targeted
              ads. If that changes, we will update this policy before the change
              takes effect.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              7. Data retention
            </h2>
            <ul className="space-y-2 pl-4">
              <li>
                We generally keep account information for as long as your
                account remains active, or as long as needed to provide the
                service and maintain appropriate records.
              </li>
              <li>
                We keep published submissions until you remove them, we remove
                them under our policies, or they are no longer needed for the
                service.
              </li>
              <li>
                Session, cache, log, and support records may be retained for
                shorter or longer periods depending on operational needs,
                security requirements, backups, and legal obligations.
              </li>
              <li>
                If you request deletion, we will take reasonable steps to delete
                or de-identify eligible information, though some residual copies
                may remain in backups or temporary systems for a limited period.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              8. Security
            </h2>
            <p>
              We use reasonable administrative, technical, and organizational
              safeguards designed to protect personal information against
              unauthorized access, disclosure, misuse, or loss.
            </p>
            <p>
              No method of transmission over the internet and no method of
              storage is completely secure, so we cannot guarantee absolute
              security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              9. Your choices and rights
            </h2>
            <ul className="space-y-2 pl-4">
              <li>
                You can update your display name and email address from your
                account settings.
              </li>
              <li>
                You can manage your photographer profile details from the
                dashboard features we make available.
              </li>
              <li>
                You can request access, correction, or deletion of your account
                data by emailing{" "}
                <Link
                  href={`mailto:${siteConfig.contact.support}`}
                  className="underline underline-offset-4"
                >
                  {siteConfig.contact.support}
                </Link>
                .
              </li>
              <li>
                Depending on where you live, you may have additional privacy
                rights under applicable law. We will review and handle requests
                in accordance with the laws that apply to us and the request.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              10. Children&apos;s privacy
            </h2>
            <p>
              Our service is not directed to children under 13, and we do not
              knowingly collect personal information from children under 13
              without legally required consent.
            </p>
            <p>
              If you believe a child under 13 has provided us personal
              information without appropriate authorization, contact us and we
              will review the report and take appropriate action.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              11. International use
            </h2>
            <p>
              We may process and store information in countries where we or our
              service providers operate. By using the service, you understand
              that information may be transferred to and processed in
              jurisdictions outside your home country, subject to applicable
              law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              12. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              product changes, legal developments, or operational needs. When we
              do, we will update the effective date at the top of this page and,
              where appropriate, provide additional notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              13. Contact us
            </h2>
            <p>
              If you have questions about this Privacy Policy or our data
              practices, contact us at{" "}
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
