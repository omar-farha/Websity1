-- Websity dashboard seed data
-- Run this once, after schema.sql, in the Supabase SQL editor.
-- Copies the content that used to be hardcoded in the Next.js app.

insert into services (number, title, description, sort_order) values
('01', 'Website Design & Development', 'Crafting responsive, fast, and user-friendly websites tailored to your brand and business goals. From concept to deployment, we build stunning websites that convert.', 0),
('02', 'Shopify Website Help', 'Specialized in creating and optimizing Shopify stores. Whether you''re starting from scratch or improving an existing one, we streamline your e-commerce presence for better performance and sales.', 1),
('03', 'Dashboard Management', 'We help you build or manage custom admin dashboards that simplify your workflow, including user analytics, product control, order tracking, and more—all in one place.', 2),
('04', 'Website Maintenance & Fixes', 'Ensure your website stays secure, up-to-date, and error-free. We provide ongoing maintenance services and quick bug fixes to keep your site running smoothly.', 3);

insert into faqs (question, answer, sort_order) values
('What is Websity and what services do you offer?', 'Websity is a digital service studio that specializes in website design & development, Shopify store setup and optimization, dashboard management, and ongoing website maintenance and fixes.', 0),
('How long does it take to complete a project?', 'Timelines vary depending on the project scope. Simple websites may take a few days, while more complex dashboards or e-commerce stores can take 1–3 weeks. We always provide a clear timeline before starting.', 1),
('Can you help me manage my Shopify store?', 'Absolutely! We offer expert Shopify support—from custom theme setup and design tweaks to performance optimization and store management.', 2),
('What does your dashboard management service include?', 'We help you build and manage admin dashboards tailored to your business. This includes managing analytics, orders, users, and content with a clean and intuitive interface.', 3),
('Do you offer support after the project is done?', 'Yes! We offer flexible maintenance plans or one-time support packages to help with updates, troubleshooting, or enhancements after your site goes live.', 4);

insert into approach_steps (title, company_name, icon, icon_bg, date_label, points, sort_order) values
('Planning & Strategy', '', '1', '#0fd8d7', 'Stage', array['We''ll collaborate to map out your website''s goals, target audience, and key functionalities. We''ll discuss things like site structure, navigation, and content requirements.'], 0),
('Development & Progress Update', '', '2', '#0fd8d7', 'Stage', array['Once we agree on the plan, I cue my lofi playlist and dive into coding. From initial sketches to polished code, I keep you updated every step of the way.'], 1),
('Development & Launch', '', '3', '#0fd8d7', 'Stage', array['This is where the magic happens! Based on the approved design, I''ll translate everything into functional code, building your website from the ground up.'], 2),
('Testing & Quality Assurance', '', '4', '#0fd8d7', 'Stage', array['Before we go live, I rigorously test your website to ensure everything works flawlessly. This includes checking for bugs, optimizing performance, and ensuring a smooth user experience.'], 3);

insert into projects (
  slug, title, role, year, tagline, description, tags, stack, image_url, live_url,
  testimonial_name, testimonial_role, testimonial_rating, testimonial_quote, sort_order
) values
(
  'personal-portfolio', 'Personal Portfolio', 'Design & Development', 2024,
  'Portfolio website showcasing projects and skills.',
  'A single-page portfolio built to load fast and read clearly on any device — a project archive, case studies, and a direct contact path, with nothing standing between the visitor and the work.',
  array['Minimalist', 'Clean'], array['Next.js', 'Tailwind CSS', 'Framer Motion'],
  '/projects/personal-portfolio.png', null,
  'Client name', 'Role, Company', 5, 'Add your client''s testimonial here.', 0
),
(
  'ne3ma', 'Ne3ma', 'Design & Development', 2024,
  'Platform for connecting donors with clients.',
  'A donation platform built around trust — clear progress tracking per case, transparent fund allocation, and a short checkout flow so people actually complete their donation.',
  array['Sleek', 'Modern'], array['React', 'Node.js', 'Stripe'],
  '/projects/ne3ma.png', null,
  'Client name', 'Role, Company', 5, 'Add your client''s testimonial here.', 1
),
(
  'retail-ecommerce-store', 'Retail E-Commerce Store', 'Design & Development', 2023,
  'E-commerce platform with advanced features for better user experience.',
  'A storefront rebuilt around fast filtering, real-time stock, and a streamlined checkout — tuned for the mobile traffic that makes up most of the store''s visitors.',
  array['Elegant', 'Professional'], array['Shopify', 'Liquid', 'JavaScript'],
  '/projects/retail-ecommerce-store.png', null,
  'Client name', 'Role, Company', 5, 'Add your client''s testimonial here.', 2
),
(
  'operations-dashboard', 'Operations Dashboard', 'Design & Development', 2023,
  'Dashboard for managing business operations.',
  'An internal admin panel unifying orders, inventory, and team roles in one place, built so a non-technical operations team can manage day-to-day work without waiting on a developer.',
  array['Elegant', 'Professional'], array['React', 'Express', 'PostgreSQL'],
  '/projects/operations-dashboard.png', null,
  'Client name', 'Role, Company', 5, 'Add your client''s testimonial here.', 3
);
