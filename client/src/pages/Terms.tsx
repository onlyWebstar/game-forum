// pages/Terms.tsx
import React from 'react';
import LegalPage from '@/components/legal/LegalPage';
import type { LegalSection } from '@/components/legal/LegalPage';
import { SITE } from '@/lib/siteInfo';

const sections: LegalSection[] = [
  {
    title: 'Agreement',
    blocks: [
      `By creating an account or using ${SITE.name}, you agree to these Terms of Service and to our Privacy Policy. If you do not agree, please do not use the site.`,
    ],
  },
  {
    title: 'Who can use the site',
    blocks: [
      [
        `You must be at least ${SITE.minAge} years old. If you are under 18, you confirm that a parent or guardian allows you to use ${SITE.name}.`,
        'You must give accurate information when you register, and verify your email address.',
        'You must not use the site if you have been banned from it.',
      ],
    ],
  },
  {
    title: 'Your account',
    blocks: [
      [
        'Keep your password secret. You are responsible for everything that happens under your account.',
        'Tell us straight away if you think someone else is using your account.',
        'Do not sell, share or transfer your account. Do not choose a username that impersonates someone else or is offensive.',
        'Do not create several accounts to avoid a ban or to manipulate likes and votes.',
      ],
    ],
  },
  {
    title: 'Your content',
    blocks: [
      `You keep ownership of the posts, comments and other content you publish ("your content"). To run the site, you give us a free, worldwide, non-exclusive licence to store, display and distribute your content on and in connection with ${SITE.name}. This licence ends when your content is deleted, apart from short-term backup copies.`,
      'You are responsible for your content. Only post things you have the right to share, and do not post other people\'s private information. The opinions in posts and comments belong to their authors, not to us.',
    ],
  },
  {
    title: 'Community guidelines',
    blocks: [
      `We want ${SITE.name} to be a friendly place to talk about games. Be respectful, and do not:`,
      [
        'harass, threaten, bully or insult other members, or post hateful content about people\'s race, ethnicity, nationality, religion, gender, sexual orientation, disability or similar characteristics;',
        'post sexual content involving minors, sexually explicit material, extreme gore, or anything illegal;',
        'share other people\'s personal information (doxxing) or private messages;',
        'spam, advertise, run scams, or post phishing, malware or misleading links;',
        'share pirated games, cracks or key generators, or cheats and hacks that harm other players or break a game\'s rules;',
        'impersonate other users, moderators or game developers;',
        'put spoilers in post titles, or post the same thing over and over;',
        'try to break into accounts, disrupt the service, scrape it in bulk, or work around restrictions.',
      ],
    ],
  },
  {
    title: 'Moderation',
    blocks: [
      'Administrators and moderators may edit, remove or lock content, and warn, suspend or delete accounts that break these rules or harm the community, with or without notice. We do not have to monitor everything members post. If you think we made a mistake, contact us and we will take another look.',
    ],
  },
  {
    title: 'Games and third-party content',
    blocks: [
      `Game titles, images, logos and trademarks belong to their owners. ${SITE.name} uses them only to identify games for discussion and is not affiliated with, or endorsed by, any game publisher or developer. Game details and review scores are provided for information and may be incomplete or out of date.`,
      'Links to other websites are provided for convenience. We are not responsible for what you find there.',
    ],
  },
  {
    title: 'Copyright complaints',
    blocks: [
      'If you believe something on the site infringes your copyright, contact us with:',
      [
        'a description of the work you own;',
        'the link to the page where the material appears;',
        'your contact details;',
        'a statement that you are the owner of the work or are authorised to act for the owner.',
      ],
      'We will review your complaint and remove content where appropriate. We may close the accounts of people who repeatedly infringe copyright.',
    ],
  },
  {
    title: 'Availability and changes to the service',
    blocks: [
      `${SITE.name} is under active development. Features may change, and the site may be unavailable from time to time. We may change or stop any part of the service.`,
    ],
  },
  {
    title: 'Disclaimers',
    blocks: [
      `${SITE.name} is provided "as is" and "as available". To the extent the law allows, we give no warranties about it, including that it will always be available, error-free or free from harmful components.`,
    ],
  },
  {
    title: 'Limitation of liability',
    blocks: [
      `To the extent the law allows, we are not liable for indirect or consequential losses, or for loss of data, profits or goodwill arising from your use of ${SITE.name}. Our total liability for any claim is limited to the amount you paid us to use the service in the previous 12 months (${SITE.name} is currently free). Nothing in these terms limits liability that cannot legally be limited.`,
    ],
  },
  {
    title: 'Ending your use of the site',
    blocks: [
      `You can stop using ${SITE.name} at any time and delete your account in Settings, under Account. We may suspend or end your access if you break these terms or put the community at risk. Parts of these terms that are meant to continue after that (such as the licence for content already shared, the disclaimers and the limits of liability) will continue.`,
    ],
  },
  {
    title: 'Changes to these terms',
    blocks: [
      `We may update these terms. The "Last updated" date at the top shows the latest version. If we make important changes, we will tell you on the site or by email. If you keep using ${SITE.name} after changes, you accept them.`,
    ],
  },
  {
    title: 'Governing law',
    blocks: [
      `These terms are governed by the laws of ${SITE.governingLaw}. If you have a problem, please contact us first so we can try to sort it out. If we cannot, the courts of ${SITE.governingLaw} will have jurisdiction.`,
    ],
  },
];

const Terms: React.FC = () => (
  <LegalPage
    title="Terms of Service"
    intro={`These terms are the rules for using ${SITE.name}. Please read them together with our Privacy Policy.`}
    sections={sections}
    other={{ to: '/privacy', label: 'Privacy Policy' }}
  />
);

export default Terms;