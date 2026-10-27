// components/legal/LegalPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { SITE } from '@/lib/siteInfo';

// A block is either a paragraph (string) or a bullet list (string[])
export type LegalBlock = string | string[];

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
  other: { to: string; label: string };
}

const LegalPage: React.FC<LegalPageProps> = ({ title, intro, sections, other }) => {
  // The contact section is added automatically, so it is always last
  const contactTitle = 'Contact us';
  const tocTitles = [...sections.map((s) => s.title), contactTitle];

  return (
    <Layout>
      <div className="min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="glass-card p-6 sm:p-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              <span className="gradient-text">{title}</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-6">Last updated: {SITE.lastUpdated}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{intro}</p>

            {/* Table of contents */}
            <nav aria-label="Contents" className="mb-10 p-4 rounded-lg bg-secondary/30">
              <h2 className="font-semibold mb-3">Contents</h2>
              <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm list-decimal pl-5">
                {tocTitles.map((t, i) => (
                  <li key={t}>
                    <a
                      href={`#section-${i + 1}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {t}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Sections */}
            {sections.map((section, i) => (
              <section key={section.title} id={`section-${i + 1}`} className="scroll-mt-24 mb-8">
                <h2 className="font-display text-xl font-bold mb-3">
                  {i + 1}. {section.title}
                </h2>
                {section.blocks.map((block, j) =>
                  Array.isArray(block) ? (
                    <ul
                      key={j}
                      className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-3"
                    >
                      {block.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j} className="text-muted-foreground leading-relaxed mb-3">
                      {block}
                    </p>
                  )
                )}
              </section>
            ))}

            {/* Contact (always last) */}
            <section id={`section-${sections.length + 1}`} className="scroll-mt-24 mb-8">
              <h2 className="font-display text-xl font-bold mb-3">
                {sections.length + 1}. {contactTitle}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Questions, requests or reports about this document or your account? Reach us here:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <a
                    href={SITE.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Message us on WhatsApp
                  </a>
                </li>
                {SITE.contactEmail && (
                  <li>
                    <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
                      {SITE.contactEmail}
                    </a>
                  </li>
                )}
              </ul>
            </section>

            <div className="pt-6 border-t border-border text-sm text-muted-foreground">
              See also our{' '}
              <Link to={other.to} className="text-primary hover:underline">
                {other.label}
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalPage;