You are a Senior Creative Director, Senior UI/UX Designer, Motion Designer, and Senior Next.js Architect.

I have an existing production-oriented Next.js website for a premium Gouna platform.

The platform is not a simple travel website.

It combines:

Luxury villa sales

Villa rentals

Accommodation / unit booking

Gouna trips

Diving experiences

Events

Parties

Activities

Gouna services

Online booking

Online payments

Premium experiences

The current website already has a design and working code.

Your task is NOT to simply "improve the UI".

Your task is to transform the existing website into a:

PREMIUM CINEMATIC DIGITAL EXPERIENCE

The website should feel like a luxury destination brand combined with a cinematic real-estate and travel platform.

When a user opens the website, they should feel:

"I am entering Gouna."

Not:

"I am opening another booking website."

The experience should feel premium, immersive, elegant, cinematic, modern, and expensive.

However:

DO NOT sacrifice performance.

DO NOT create a heavy website.

DO NOT destroy the existing architecture.

DO NOT introduce unnecessary dependencies.

The final result must be production-ready.

1. FIRST: AUDIT THE EXISTING PROJECT

Before changing the design, deeply inspect the existing project.

Understand:

Next.js version

App Router structure

TypeScript architecture

Tailwind setup

component architecture

server components

client components

data fetching

API architecture

database integration

authentication

payment integration

booking logic

routing

dynamic routes

image handling

existing animations

existing state management

existing reusable components

Do not start rewriting random files.

Understand the architecture first.

Then create a clear implementation strategy.

2. THE DESIGN DIRECTION

The visual direction should be:

LUXURY
+
CINEMATIC
+
MINIMAL
+
EDITORIAL
+
REAL ESTATE
+
TRAVEL
+
GOUNA LIFESTYLE

Think of the website as a combination of:

Luxury resort website
+
High-end real estate platform
+
Premium travel experience
+
Cinematic portfolio
+
Modern booking platform

The website should feel closer to a premium international hospitality brand than a normal Egyptian booking website.

3. VISUAL IDENTITY

Use a sophisticated visual system.

Avoid:

generic cards

excessive rounded containers

cheap gradients

random glassmorphism

excessive shadows

generic dashboard UI

template-like layouts

excessive borders

repetitive sections

basic hero sections

default Tailwind styling

"AI generated website" appearance

The design should have:

strong typography

large cinematic imagery

sophisticated whitespace

editorial layouts

layered compositions

asymmetric sections

large visual storytelling

premium micro-interactions

carefully controlled motion

The design must feel intentional.

4. HERO EXPERIENCE

The hero must be one of the strongest parts of the website.

Do NOT create a simple:

Image
+
Heading
+
Button

Instead create a cinematic opening experience.

The hero should feel like the beginning of a movie.

Example structure:

Full viewport cinematic visual

↓

Elegant navigation

↓

Minimal typography

↓

Strong headline

↓

Short supporting statement

↓

Primary CTA

↓

Secondary CTA

↓

Subtle scroll indicator

Possible visual treatment:

full-screen Gouna imagery

cinematic video when available

subtle image movement

slow parallax

layered typography

atmospheric overlay

controlled transitions

smooth entrance animation

Example feeling:

"Discover Gouna Beyond the Ordinary."

or a stronger brand-specific message based on the existing content.

Do NOT copy this text literally if the existing brand has better messaging.

5. CINEMATIC SCROLL EXPERIENCE

Scrolling should feel like moving through a visual story.

Do NOT animate everything.

Animation must have hierarchy.

Use:

reveal animations

clip-path reveals

image masking

scale transitions

subtle parallax

text splitting

staggered entrances

horizontal storytelling sections

pinned visual sections where appropriate

smooth section transitions

image transformations

subtle opacity transitions

Animations should be:

smooth
slow
intentional
premium

Never:

bouncy
cartoonish
excessive
random
over-animated

6. FRAMER MOTION

If Framer Motion already exists, use it intelligently.

Do not replace the existing animation architecture unnecessarily.

Create reusable motion primitives.

For example:

FadeIn
RevealText
ImageReveal
ScaleReveal
StaggerContainer
ParallaxImage
SectionReveal

Do not write custom animation logic repeatedly in every component.

Centralize reusable motion behavior.

7. LENIS / SMOOTH SCROLL

If Lenis is already installed:

Keep it.

Improve the implementation if necessary.

The scrolling experience should feel:

smooth
controlled
premium

But avoid excessive smoothing that makes the website feel slow.

Make sure:

mobile performance remains good

touch scrolling works naturally

accessibility is not broken

reduced motion is respected

8. NAVIGATION

The navbar should feel premium and minimal.

Do not make a huge traditional navbar.

Possible structure:

Logo

Destinations / Explore
Stay
Villas
Experiences
Diving
Events
Services

Then:

Language
Login
Book Now

The exact navigation must follow the existing business structure.

The navbar should transition intelligently when scrolling.

For example:

At hero:
transparent / overlay navigation

After scrolling:
subtle solid/blurred navigation

Use animation carefully.

9. EXPERIENCE CATEGORIES

Do not show everything as ordinary cards.

Create cinematic category sections.

For example:

STAY

Large immersive image.

Small typography.

"Your private escape in Gouna."

Then:

VILLAS

A large architectural visual.

Then:

EXPERIENCES

Diving
Trips
Water activities
Desert experiences

Then:

EVENTS

Parties
Private events
Nightlife

Then:

SERVICES

Premium Gouna services.

Each category should feel like a chapter in a story.

10. PROPERTY / VILLA EXPERIENCE

The villa section is extremely important.

Do NOT create a generic ecommerce grid.

The villa discovery experience should feel like luxury real estate.

Use:

large photography

architectural compositions

large typography

location

bedrooms

bathrooms

capacity

price

availability

amenities

Cards should feel premium.

When hovering:

image movement

subtle zoom

information reveal

elegant CTA

smooth transition

But keep the interaction subtle.

11. PROPERTY DETAIL PAGE

The property detail page should feel like a premium real estate presentation.

Structure could include:

Cinematic gallery

↓

Property identity

↓

Location

↓

Price

↓

Availability

↓

Features

↓

Amenities

↓

Interior / exterior gallery

↓

Map

↓

Booking / purchase CTA

↓

Related properties

Do not make it look like an ecommerce product page.

It should feel like a luxury property presentation.

12. BOOKING EXPERIENCE

The booking system must remain highly usable.

Do not sacrifice UX for aesthetics.

Booking should clearly show:

selected unit

date

guests

price

taxes/fees if applicable

availability

services

payment

confirmation

Use elegant progressive steps if appropriate.

The booking flow must feel premium but extremely clear.

13. PAYMENT EXPERIENCE

Payment is business-critical.

Do not visually hide important payment information.

Create a trustworthy checkout experience.

Clearly display:

booking details

total price

payment method

secure payment indication

terms

confirmation

Do not change existing payment logic unless necessary.

Only improve the presentation.

14. EXPERIENCES

Trips, diving, activities, and events should not be displayed like ordinary products.

Create editorial experience layouts.

Example:

Large image

Small category label

Large title

Short story

Location

Duration

Price

CTA

The user should feel:

"I want to experience this."

not:

"I am looking at a database record."

15. DIVING EXPERIENCE

Diving deserves its own visual language.

Use:

underwater imagery

darker atmospheric sections

smooth transitions

immersive photography

depth-inspired visual movement

But maintain the overall brand identity.

Do not create a completely different website.

16. EVENTS & PARTIES

Events should feel energetic without becoming visually cheap.

Use:

strong imagery

editorial typography

date/time

location

event category

ticket/booking CTA

Create cinematic event discovery.

17. SERVICES

Services should be presented as premium concierge-style offerings.

Examples:

Airport transfer
Private transportation
Cleaning
Chef
Boat
Concierge
Restaurant reservations
Activities
Other Gouna services

Do not use a grid of generic icon cards.

Use visual storytelling.

18. IMAGE SYSTEM

Images are extremely important.

Use Next.js Image correctly.

Optimize:

width

height

sizes

priority

loading

responsive images

modern formats

Do not load huge original images unnecessarily.

Hero images should be optimized carefully.

Use blur placeholders where useful.

Do not create performance problems just to achieve cinematic visuals.

19. MOTION PERFORMANCE

IMPORTANT:

The website must remain fast.

Do not animate:

every text element

every card

every icon

every section

every image

Use animation only where it improves storytelling.

Prefer:

transform
opacity
clip-path

Avoid expensive continuous animations.

Avoid unnecessary:

box-shadow animations
filter animations
layout animations

Avoid excessive DOM complexity.

20. MOBILE EXPERIENCE

Mobile is NOT a reduced desktop version.

Design mobile intentionally.

The cinematic feeling must remain on:

iPhone

Android

tablets

But animations must be lighter where necessary.

Do not use huge desktop-only animations on mobile.

Ensure:

touch interactions

readable typography

proper image ratios

usable booking controls

usable navigation

payment usability

21. RESPONSIVE DESIGN

Test:

360px
390px
414px
768px
1024px
1280px
1440px
1920px

Make sure the layout remains premium at all sizes.

Do not simply shrink desktop components.

22. TYPOGRAPHY

Typography should be one of the main design elements.

Use a sophisticated typographic hierarchy.

Large cinematic headlines.

Small uppercase labels where appropriate.

Editorial body text.

Strong contrast between:

Display
Heading
Subheading
Body
Metadata

Do not use too many font families.

If Arabic is supported, make sure the typography works beautifully in both:

Arabic RTL

English LTR

23. COLOR SYSTEM

Use a restrained luxury palette based on the existing brand identity.

Possible direction:

deep charcoal
warm white
sand
stone
sea-inspired accent

But FIRST inspect the existing brand colors.

Do not randomly change the brand.

The palette should feel inspired by:

Gouna
Sea
Sand
Architecture
Sunset
Luxury

Avoid excessive gradients.

24. MICRO INTERACTIONS

Add high-quality micro interactions:

button hover

magnetic interaction where appropriate

image hover

navigation transitions

cursor interaction where appropriate

menu transitions

card transitions

gallery transitions

booking controls

But keep them subtle.

The website should feel expensive, not like a motion demo.

25. CURSOR

If a custom cursor is implemented:

Make it extremely subtle.

Do not create a huge distracting cursor.

It should respond intelligently to:

images

buttons

links

draggable galleries

Disable or simplify it on touch devices.

26. PAGE TRANSITIONS

Create elegant page transitions if they fit the existing architecture.

Transitions should be short and smooth.

Do not make the user wait for animations before accessing content.

Performance and usability always come first.

27. LOADING EXPERIENCE

Create a premium loading experience.

Do not create a 5-second cinematic intro.

Use a lightweight transition.

Example:

Logo

↓

subtle progress

↓

hero reveal

The user should never feel blocked.

28. EMPTY / ERROR STATES

Even error states must feel part of the design system.

Create elegant:

404
500
No Results
No Availability
Booking Error
Payment Error

states.

Keep them useful and actionable.

29. ACCESSIBILITY

Maintain:

semantic HTML

keyboard navigation

focus states

accessible buttons

accessible forms

ARIA labels

proper contrast

reduced motion support

Respect:

prefers-reduced-motion

When reduced motion is enabled:

disable parallax

reduce transitions

disable unnecessary motion

keep the website fully functional

30. ARCHITECTURE

This is CRITICAL.

Do not turn the project into a giant collection of client components.

Preserve Server Components wherever possible.

Use Client Components only when needed for:

interaction

animation

state

browser APIs

Keep:

data fetching
SEO
static content
server logic

on the server whenever possible.

31. COMPONENT ARCHITECTURE

Create reusable components.

For example:

components/
layout/
navigation/
hero/
sections/
property/
experience/
booking/
payment/
gallery/
motion/
ui/

Do not create hundreds of tiny meaningless components.

Components should have clear responsibility.

32. DESIGN SYSTEM

Create reusable primitives for:

Buttons
Container
Section
Typography
Cards
Images
Badges
Price
Metadata
Motion

This prevents inconsistent styling.

33. DATA / UI SEPARATION

Do not hardcode business data inside presentation components.

Separate:

Data

from:

Presentation

For example:

PropertyCard

should receive property data.

It should not contain fake business logic.

34. API & BUSINESS LOGIC

DO NOT rewrite working:

APIs

booking logic

payment logic

authentication

database logic

unless there is a clear architectural problem.

The visual redesign must not break the business.

35. TypeScript

Maintain strict TypeScript quality.

Avoid:

any
unnecessary type assertions
duplicated interfaces

Use proper types for:

Property
Villa
Booking
Experience
Event
Service
Payment
User

Reuse existing types when possible.

36. SEO

Because this is a travel + real estate + booking platform, SEO is extremely important.

Ensure pages have:

proper metadata

title

description

Open Graph

structured data where appropriate

canonical URLs

semantic headings

Property pages should be SEO-friendly.

Experience pages should be SEO-friendly.

Event pages should be SEO-friendly.

37. CINEMATIC DESIGN RULE

Follow this principle:

DO NOT make every section cinematic.

If everything is visually loud, nothing feels special.

Use:

quiet sections
+
strong visual moments
+
dramatic transitions
+
clean information sections

Create rhythm.

Think of the website like a movie:

Opening scene
↓
Story
↓
Visual climax
↓
Information
↓
Experience
↓
Call to action
↓
Ending

38. PERFORMANCE BUDGET

The website must remain production-ready.

Do not add libraries just because they look impressive.

Before adding a dependency ask:

"Can this be implemented using existing tools?"

Prefer existing:

Next.js
React
Tailwind
Framer Motion
Lenis

if already installed.

Avoid unnecessary:

3D engines
WebGL
heavy animation libraries
large UI libraries

unless there is a real business/design reason.

39. DO NOT CREATE AN AI-GENERATED LOOK

This is extremely important.

Avoid visual patterns that make websites look AI-generated:

excessive rounded cards

random gradients

repetitive sections

identical cards everywhere

giant centered headings everywhere

excessive glassmorphism

random floating blobs

generic dark mode

excessive neon

too many shadows

unnecessary icons

The result should look designed by a professional creative studio.

40. FINAL QUALITY BAR

The final website should look like a serious premium company could launch it publicly.

Imagine the client saying:

"This looks like a $50,000+ digital experience."

Not:

"This looks like a nice template."

The website must communicate:

Luxury
Trust
Exclusivity
Gouna
Travel
Real Estate
Experience
Quality

41. IMPLEMENTATION PROCESS

Follow this order:

PHASE 1
Audit existing codebase.

PHASE 2
Audit existing visual design.

PHASE 3
Create a new visual direction.

PHASE 4
Create reusable design primitives.

PHASE 5
Redesign global layout/navigation.

PHASE 6
Redesign homepage.

PHASE 7
Redesign property/villa discovery.

PHASE 8
Redesign property details.

PHASE 9
Redesign experiences.

PHASE 10
Redesign events.

PHASE 11
Redesign services.

PHASE 12
Redesign booking.

PHASE 13
Redesign payment UI without changing payment logic.

PHASE 14
Implement cinematic motion.

PHASE 15
Optimize mobile.

PHASE 16
Optimize performance.

PHASE 17
Accessibility audit.

PHASE 18
SEO audit.

PHASE 19
TypeScript/build/lint audit.

PHASE 20
Final visual consistency audit.

42. IMPORTANT IMPLEMENTATION RULE

Do NOT rewrite the entire project blindly.

Reuse existing functionality.

Reuse existing APIs.

Reuse existing data models.

Reuse existing authentication.

Reuse existing booking logic.

Reuse existing payment logic.

Reuse existing business logic.

Improve the presentation layer and architecture only where necessary.

If an existing component is good:

KEEP IT.

If it is visually weak:

REDESIGN IT.

If it is architecturally bad:

REFACTOR IT CAREFULLY.

43. FINAL TEST

Before declaring the work complete:

Run:

npm run build

and:

npm run lint

if available.

Fix all errors.

Check for:

hydration errors

console errors

broken images

layout shifts

animation glitches

mobile overflow

RTL issues

broken routes

broken buttons

broken forms

broken booking

broken payment UI

unnecessary client components

FINAL OUTPUT

Do not just describe what you would do.

Actually implement the redesign in the existing project.

The final result must be:

Cinematic
Premium
Luxury
Modern
Immersive
Fast
Responsive
Accessible
SEO-friendly
Maintainable
Production-ready

Most importantly:

The website should feel like a cinematic digital journey through Gouna, while still functioning as a serious booking, real-estate, experiences, events, services, and payment platform.

Do not sacrifice architecture or performance for visual effects.

Premium visual quality + excellent UX + clean architecture + production performance is the goal.