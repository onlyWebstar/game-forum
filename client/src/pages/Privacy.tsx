// pages/Privacy.tsx
import React from 'react';
import LegalPage from '@/components/legal/LegalPage';
import type { LegalSection } from '@/components/legal/LegalPage';
import { SITE } from '@/lib/siteInfo';

const sections: LegalSection[] = [
  {
    title: 'Who we are',
    blocks: [
      `${SITE.name} is an online community where people discuss video games. It is operated by ${SITE.operator} ("we", "us", "our"). This policy explains what personal information we collect, how we use and share it, and the choices you have.`,
    ],
  },
  {
    title: 'What we collect',
    blocks: [
      `When you use ${SITE.name} we collect:`,
      [
        'Account details: your username, email address and password. Your password is stored only as a one-way hash, so nobody, including us, can read it. You may also add a profile picture link and a short bio.',
        'Content you create: your posts, comments, likes and dislikes, tags, and the games you mark as favorites.',
        'Your settings: your notification and privacy preferences.',
        'Activity on the site: notifications generated for you, your level, experience points and badges, your post, comment and like counts, and when you were last active.',
        'Technical data: our hosting providers keep standard server logs (such as IP address, browser type and the time of each request). We use them to run the service and keep it secure.',
        'Sign-in data from Google or Discord: if you choose to sign in with one of them, we receive the name, email address and profile picture they share with us.',
      ],
      'We do not collect payment information, and we do not ask for sensitive documents such as government IDs.',
    ],
  },
  {
    title: 'How we use your information',
    blocks: [
      'We use your information to:',
      [
        'create and secure your account, and confirm your email address;',
        'send account emails, such as email verification and password reset links;',
        'show your posts, comments and profile as described below;',
        'send in-app notifications about comments, replies and likes, according to your settings;',
        'enforce our Terms of Service, moderate content, and prevent spam and abuse;',
        'fix problems and improve the site.',
      ],
      'We do not sell your personal information, and we do not show advertising.',
    ],
  },
  {
    title: 'What other people can see',
    blocks: [
      [
        'Everyone can see your username, profile picture, level and badges, and the posts and comments you publish in the forum.',
        'Your profile page follows your privacy settings. You can make it public, visible to logged-in members only, or private. You can also choose whether your email address is shown (off by default) and whether your recent posts and last-active time are shown.',
        'Site administrators and moderators can view all profiles so they can moderate the community.',
        'Making your profile private or hiding your activity does not hide posts and comments you have already published in the forum.',
      ],
    ],
  },
  {
    title: 'Who we share information with',
    blocks: [
      'We use trusted service providers to run the site. They handle data for us and only as needed to provide their service:',
      [
        'MongoDB Atlas: stores our database (accounts, posts, comments and settings).',
        'Render and Vercel: host the server and the website.',
        'Brevo: delivers account emails such as verification and password reset messages.',
        'ui-avatars.com: draws the default profile picture (your initials). Your username is part of the image address it receives.',
        'Google and Discord: only if you choose to sign in with them.',
      ],
      'Images and links you add, such as a profile picture address, are loaded from the website that hosts them, and that website can see your browser requested them.',
      'We may also disclose information if the law requires it, or to protect the safety and rights of our users and the service. We do not share your information with advertisers.',
    ],
  },
  {
    title: 'Where your data is stored',
    blocks: [
      'Our database is currently hosted in France. Our hosting and email providers may process data in other countries, including the United States. We choose providers that protect data with appropriate safeguards.',
    ],
  },
  {
    title: 'Cookies and local storage',
    blocks: [
      "To keep you signed in, we store a login token in your browser's local storage. It is removed when you log out. We may also set a short-lived session cookie while you sign in. We do not use advertising or cross-site tracking cookies.",
    ],
  },
  {
    title: 'How long we keep information',
    blocks: [
      [
        'Account and content data are kept while your account is active.',
        'Email verification and password reset links expire after 24 hours and 1 hour respectively, and are stored only in hashed form.',
        'Notifications are deleted automatically after 90 days.',
        'If you delete your account, it is deactivated and can no longer be used. Your posts and comments may remain visible under your username, and some data may stay in our database and backups, unless you ask us to remove or anonymise it. Contact us if you want everything erased.',
      ],
    ],
  },
  {
    title: 'Security',
    blocks: [
      'Passwords are hashed, traffic to the site uses HTTPS, and access to our systems is limited. No online service is perfectly secure, so please choose a strong, unique password and keep it private.',
    ],
  },
  {
    title: 'Your choices and rights',
    blocks: [
      [
        'Edit your username, bio and profile picture under Edit Profile.',
        'Change your notification and privacy preferences in Settings.',
        'Change your password in Settings, or use "Forgot password" if you cannot log in.',
        'Delete your account in Settings, under Account.',
      ],
      'You can also contact us to ask for a copy of your data, to correct it, to have it erased, or to object to how we use it. Depending on where you live, including under the Nigeria Data Protection Act 2023, you may have legal rights over your personal data, including the right to complain to the Nigeria Data Protection Commission. We will respond within a reasonable time.',
    ],
  },
  {
    title: 'Children',
    blocks: [
      `${SITE.name} is not meant for children under ${SITE.minAge}, and we do not knowingly collect their information. If you are under 18, please use the site with the permission of a parent or guardian. If you believe a child under ${SITE.minAge} has created an account, contact us and we will remove it.`,
    ],
  },
  {
    title: 'Changes to this policy',
    blocks: [
      'We may update this policy from time to time. The "Last updated" date at the top shows when it last changed. If we make important changes, we will tell you on the site or by email.',
    ],
  },
];

const Privacy: React.FC = () => (
  <LegalPage
    title="Privacy Policy"
    intro={`Your privacy matters to us. Please read this policy together with our Terms of Service.`}
    sections={sections}
    other={{ to: '/terms', label: 'Terms of Service' }}
  />
);

export default Privacy;