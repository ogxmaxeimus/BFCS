/**
 * Portfolio work data + ownership persistence (localStorage).
 * The public site and ownership page both read from here.
 */
(function () {
  const STORAGE_KEY = "bfc-work-data";

  const LICENSES = [
    {
      title: "Blue Collar Millionaire",
      href: "agreements/blue-collar-millionaire-license.html",
      description: "Design license agreement :  logo suite for apparel & merchandise",
    },
    {
      title: "BCM Past Due Statement",
      href: "agreements/blue-collar-millionaire-late-statement.html",
      description: "Overdue notice for Invoice #KSUSPO8P-0012: $110 + $25 late fee ($135 due)",
    },
    {
      title: "BCM Invoice Terms",
      href: "agreements/blue-collar-millionaire-invoice-terms.html",
      description: "Late fee & payment policy :  invoices are separate from license agreements",
    },
    {
      title: "BCM Master Design Services Agreement",
      href: "agreements/bcm-msa.pdf",
      description: "Ongoing designer/client contract for future work",
    },
    {
      title: "BCM Statement of Work Template",
      href: "agreements/bcm-sow.pdf",
      description: "Per project scope, deliverables, timeline, and payment approval form",
    },
    {
      title: "BCM Payment & Scope Addendum",
      href: "agreements/bcm-payment-addendum.pdf",
      description: "Separate scopes, simultaneous projects, overdue balances, and source file policy",
    },
  ];

  const DEFAULT_PROJECTS = [
    {
      id: "tradeverified",
      title: "TradeVerified",
      titleSub: "",
      meta: "SaaS platform, product and brand design",
      tag: "Product / UX",
      caseStudy: {
        eyebrow: "Case study: Product & UX",
        sub: "A LinkedIn style, trust first SaaS platform for skilled trades workers and the companies that hire them.",
        facts: [
          { label: "Role", value: "Founder & Lead Product Designer" },
          { label: "Team", value: "Solo designer founder directing development" },
          { label: "Tools", value: "Figma, Next.js, TypeScript, Tailwind, Supabase, Stripe" },
          { label: "Type", value: "Web app + marketing site" },
        ],
        overview:
          "As the founder and lead product designer, I conceived TradeVerified and owned the design end to end. That covered brand identity, UX architecture, and high fidelity UI across the marketing site, worker marketplace, verified profiles, and employer dashboard. It's a professional network for the skilled trades, including HVAC techs, plumbers, electricians, welders, carpenters, and more, where workers build credible profiles and employers hire with confidence. Working as a solo designer founder directing the build, I used Figma for wireframing and UI design, a Next.js, TypeScript, and Tailwind front end, and Supabase and Stripe for the backend, authentication, and subscription payments.",
        outcome:
          "The hardest problem was trust: anyone can type in a license number, so the platform had to prove credentials are real without drowning users in friction. I designed a verification system that checks licenses against official state boards and issuing bodies and then shows the source behind every badge, paired with a deliberately worker first pricing model so tradespeople never pay just to find work. The result is a complete, production ready platform that includes automated credential verification, proof backed reviews, and tailored flows for tradespeople, employers, and admins. It's positioned to stand out in a fragmented market by making trust something you can actually see.",
      },
      items: [
        {
          category: "Product",
          src: "assets/work/tv-landing.png",
          webp: "assets/work/tv-landing.webp",
          alt: "TradeVerified marketing landing page with hero and verified badge",
          width: 1024,
          height: 683,
          title: "Landing Page",
          span: "Marketing • brand",
        },
        {
          category: "Product",
          src: "assets/work/tv-marketplace.png",
          webp: "assets/work/tv-marketplace.webp",
          alt: "TradeVerified worker marketplace search with filters and verified profile cards",
          width: 1024,
          height: 683,
          title: "Marketplace",
          span: "Search • filtering UX",
        },
        {
          category: "Product",
          src: "assets/work/tv-profile.png",
          webp: "assets/work/tv-profile.webp",
          alt: "TradeVerified verified tradesperson profile with credentials and portfolio",
          width: 1024,
          height: 683,
          title: "Verified Profile",
          span: "Credentials • portfolio",
        },
        {
          category: "Product",
          src: "assets/work/tv-dashboard.png",
          webp: "assets/work/tv-dashboard.webp",
          alt: "TradeVerified employer hiring dashboard with applications and stats",
          width: 1024,
          height: 683,
          title: "Employer Dashboard",
          span: "Hiring • analytics",
        },
      ],
    },
    {
      id: "scopesignal",
      title: "ScopeSignal",
      titleSub: "",
      meta: "SaaS product, brand and go-to-market",
      tag: "Product / Brand",
      caseStudy: {
        eyebrow: "Case study: Product & brand",
        sub: "A SaaS tool that spots scope creep in client messages and helps freelancers protect unpaid work.",
        facts: [
          { label: "Role", value: "Founder & Product Designer" },
          { label: "Team", value: "Solo designer founder" },
          { label: "Tools", value: "Figma, Next.js, TypeScript, Tailwind" },
          { label: "Type", value: "Product UI + brand system" },
        ],
        overview:
          "ScopeSignal is a product I founded and designed end to end for freelancers and agencies who lose hours to vague client requests. The work covered brand identity, product UI for AI risk analysis, and a go-to-market system of social posts and stories that explain the problem, show the demo, and drive signups. The product analyzes client messages against agreed scope, scores risk, estimates dollars at risk, and drafts professional pushback replies.",
        outcome:
          "The brand needed to feel sharp and trustworthy without looking like another generic AI tool. I built a dark, signal-forward visual system around a clear risk score metaphor, then carried that language into product screens and campaign creative. The result is a cohesive product and brand story that makes scope creep visible before unpaid work piles up.",
      },
      items: [
        {
          category: "Product",
          src: "assets/work/ss-demo.png",
          webp: "assets/work/ss-demo.webp",
          alt: "ScopeSignal AI risk analysis dashboard showing high risk score and dollars at risk",
          width: 1536,
          height: 1024,
          title: "Product Demo",
          span: "Risk analysis • UI",
        },
        {
          category: "Brand Identity",
          src: "assets/work/ss-logo.png",
          webp: "assets/work/ss-logo.webp",
          alt: "ScopeSignal logo and wordmark on black",
          width: 1536,
          height: 1024,
          title: "Brand Mark",
          span: "Logo • wordmark",
        },
        {
          category: "Social",
          src: "assets/work/ss-problem.png",
          webp: "assets/work/ss-problem.webp",
          alt: "ScopeSignal social post about unpaid quick changes",
          width: 1536,
          height: 1024,
          title: "Problem Post",
          span: "Campaign • messaging",
        },
        {
          category: "Social",
          src: "assets/work/ss-how-it-works.png",
          webp: "assets/work/ss-how-it-works.webp",
          alt: "ScopeSignal how it works three step explainer graphic",
          width: 1536,
          height: 1024,
          title: "How It Works",
          span: "Product story • social",
        },
      ],
    },
    {
      id: "maxeimus",
      title: "Maxeimus",
      titleSub: "of Raleigh",
      meta: "Heritage athleisure & lifestyle",
      tag: "Full brand system",
      caseStudy: {
        eyebrow: "Case study: Brand system",
        sub: "A full heritage athleisure and lifestyle brand system spanning identity, apparel, packaging, print, and web.",
        facts: [
          { label: "Role", value: "Lead Brand & Product Designer" },
          { label: "Team", value: "Independent, with the brand owner" },
          { label: "Tools", value: "Adobe Illustrator, Photoshop, Mockups" },
          { label: "Scope", value: "Identity → packaging → social → web" },
        ],
        overview:
          "I served as the lead brand and product designer for Maxeimus of Raleigh, a heritage athleisure and lifestyle label, and delivered a complete brand system end to end. That included the crest logo and identity, stationery and wax seal, apparel graphics, packaging (hang tags, labels, gift box, and tissue), a social media template system, an editorial LA28 poster, and a web lookbook. Working independently in direct collaboration with the brand owner, I used Adobe Illustrator and Photoshop for the identity and print ready artwork, and presented each direction through realistic mockups for review and sign-off.",
        outcome:
          "The brand had to feel premium and heritage driven while staying versatile across apparel, packaging, print, and digital, and it had to stay consistent the whole way. I built a cohesive visual language anchored by the crest and seal that scaled cleanly from a tiny hang tag up to a full editorial poster, and prepared production ready files for each medium. The outcome was a unified, retail ready identity the client could confidently roll out across products, packaging, and social channels without the brand ever feeling disjointed.",
      },
      items: [
        {
          category: "Brand Identity",
          src: "assets/work/work-identity.png",
          webp: "assets/work/work-identity.webp",
          alt: "Maxeimus brand identity with crest logo, stationery, and wax seal",
          width: 1536,
          height: 1024,
          title: "Brand Identity",
          span: "Crest logo • stationery • seal",
        },
        {
          category: "Apparel",
          src: "assets/work/work-apparel.png",
          webp: "assets/work/work-apparel.webp",
          alt: "Maxeimus athleisure t-shirt apparel graphic",
          width: 1536,
          height: 1024,
          title: "Apparel",
          span: "Athleisure tee • print ready",
        },
        {
          category: "Packaging",
          src: "assets/work/work-packaging.png",
          webp: "assets/work/work-packaging.webp",
          alt: "Maxeimus packaging with hang tags, labels, gift box, and tissue",
          width: 1536,
          height: 1024,
          title: "Packaging",
          span: "Tags • labels • gift box",
        },
        {
          category: "Social",
          src: "assets/work/work-social.png",
          webp: "assets/work/work-social.webp",
          alt: "Maxeimus social media template set with Instagram grid and story layouts",
          width: 1536,
          height: 1024,
          title: "Social Templates",
          span: "Instagram system • stories",
        },
        {
          category: "Print",
          src: "assets/work/work-poster.png",
          webp: "assets/work/work-poster.webp",
          alt: "Maxeimus LA28 Summer Games editorial sunburst poster",
          width: 1536,
          height: 1024,
          title: "LA28 Poster",
          span: "Editorial print • typography",
        },
        {
          category: "Digital",
          src: "assets/work/work-thumbnail.png",
          webp: "assets/work/work-thumbnail.webp",
          alt: "Maxeimus website lookbook campaign shown on a laptop",
          width: 1536,
          height: 1024,
          title: "Web Lookbook",
          span: "Digital • campaign design",
        },
      ],
    },
    {
      id: "bcm",
      title: "Blue Collar Millionaire",
      titleSub: "",
      meta: "Apparel and lifestyle brand, Est. 2016",
      tag: "Apparel & merchandise",
      caseStudy: {
        eyebrow: "Case study: Apparel and merchandise",
        sub: "Apparel graphics, merchandise, and campaign imagery for a lifestyle brand established in 2016.",
        facts: [
          { label: "Role", value: "Brand & Product Designer" },
          { label: "Team", value: "Solo, with the founder" },
          { label: "Tools", value: "Adobe Illustrator, Photoshop, Mockups" },
          { label: "Scope", value: "Apparel, merch, campaign" },
        ],
        overview:
          "For Blue Collar Millionaire, an apparel and lifestyle brand established in 2016, I designed and mocked up the merchandise line and campaign imagery. The work spanned a lifestyle campaign shot, a charcoal hoodie with the circular monogram badge, a full merch flat lay (cap, apparel stack, tote, and mug), and an embroidered beanie. As the solo designer working directly with the founder, I used Adobe Illustrator for the vector logo suite and Photoshop with product mockups to bring the collection to life.",
        outcome:
          "The brand needed graphics that communicated grit and aspiration while still reading clearly across apparel, embroidery, and small accessories. I carried the monogram and crest marks onto hoodies, headwear, and lifestyle goods so the identity felt tangible and retail ready. The result was a cohesive merchandise range and campaign visuals the brand could take straight to market.",
      },
      items: [
        {
          category: "Campaign",
          src: "assets/work/bcm-lifestyle.png",
          webp: "assets/work/bcm-lifestyle.webp",
          alt: "Blue Collar Millionaire lifestyle campaign with olive hoodie in an industrial workshop",
          width: 1024,
          height: 682,
          title: "Campaign",
          span: "Lifestyle • brand story",
        },
        {
          category: "Apparel",
          src: "assets/work/bcm-hoodie-back.png",
          webp: "assets/work/bcm-hoodie-back.webp",
          alt: "Blue Collar Millionaires charcoal hoodie with circular monogram badge on back",
          width: 1024,
          height: 682,
          title: "Hoodie",
          span: "Apparel • back graphic",
        },
        {
          category: "Product",
          src: "assets/work/bcm-merch-flatlay.png",
          webp: "assets/work/bcm-merch-flatlay.webp",
          alt: "Blue Collar Millionaire merchandise flat lay with cap, apparel, tote bag, and mug",
          width: 1024,
          height: 682,
          title: "Merch Range",
          span: "Product • accessories",
        },
        {
          category: "Product",
          src: "assets/work/bcm-beanie.png",
          webp: "assets/work/bcm-beanie.webp",
          alt: "Blue Collar Millionaire charcoal beanie with embroidered monogram cuff",
          width: 1024,
          height: 682,
          title: "Beanie",
          span: "Headwear • embroidery",
        },
      ],
    },
    {
      id: "knightsplay",
      title: "Knights Play",
      titleSub: "Golf Center",
      meta: "Concept: public golf facility, Apex, NC",
      tag: "Rebrand concept",
      caseStudy: {
        eyebrow: "Case study: Concept",
        sub: "A concept rebrand spanning digital and environmental design for a public golf facility in Apex, NC.",
        facts: [
          { label: "Role", value: "Lead Designer" },
          { label: "Team", value: "Independent concept" },
          { label: "Tools", value: "Figma, Illustrator, Photoshop" },
          { label: "Type", value: "Concept: app, signage, print, apparel" },
        ],
        overview:
          "Knights Play Golf Center is a studio concept rebrand for a public golf facility in Apex, NC. The work spans both digital and environmental design: a mobile app concept (tee time booking, on course GPS, and order to bay), wayfinding signage, business cards and stationery, and branded staff apparel and merch. As the lead designer, I used Figma for the app UI and Illustrator and Photoshop for signage, print, and apparel mockups.",
        outcome:
          "The concept needed one identity that worked across a phone screen, a parking lot sign, a business card, and a polo, each with very different production constraints. I built a flexible KP shield system and a green and cream palette that stayed recognizable everywhere, and prepared each asset for its real world output method. The outcome is a cohesive, modern rebrand concept that elevates the customer experience from the first booking through on course wayfinding to the retail shop.",
      },
      items: [
        {
          category: "Digital",
          src: "assets/work/kp-app.png",
          webp: "assets/work/kp-app.webp",
          alt: "Knights Play Golf Center mobile app concept showing tee time booking, on course GPS, and order to bay screens",
          width: 1536,
          height: 1024,
          title: "Mobile App",
          span: "Concept • product design",
        },
        {
          category: "Signage",
          src: "assets/work/kp-wayfinding.png",
          webp: "assets/work/kp-wayfinding.webp",
          alt: "Knights Play Golf Center wayfinding signage post directing to the course, range, and clubhouse",
          width: 1536,
          height: 1024,
          title: "Wayfinding",
          span: "Environmental • signage",
        },
        {
          category: "Print",
          src: "assets/work/kp-cards.png",
          webp: "assets/work/kp-cards.webp",
          alt: "Knights Play Golf Center business cards in green and cream with gold KP shield",
          width: 1536,
          height: 1024,
          title: "Business Cards",
          span: "Stationery • print",
        },
        {
          category: "Apparel",
          src: "assets/work/kp-staff-apparel.png",
          webp: "assets/work/kp-staff-apparel.webp",
          alt: "Knights Play branded apparel flatlay with polo, cap, towel, ball marker, and accessories",
          width: 1536,
          height: 1024,
          title: "Apparel & Merch",
          span: "Polo • cap • accessories",
        },
      ],
    },
    {
      id: "ashfordvale",
      title: "Ashford Vale",
      titleSub: "LLP",
      meta: "Concept: prestige law firm website",
      tag: "Web concept",
      caseStudy: {
        eyebrow: "Case study: Concept",
        sub: "A prestige corporate and litigation firm website concept designed to attract law-firm clients to the studio.",
        facts: [
          { label: "Role", value: "Lead Designer" },
          { label: "Team", value: "Independent concept" },
          { label: "Tools", value: "HTML, CSS, JS" },
          { label: "Type", value: "Concept: website, homepage, about, contact" },
        ],
        overview:
          "Ashford Vale LLP is a fictional prestige firm concept built for Brandon Fonville Creative Studio marketing. The brief was to improve on the dense, news-led pattern common to elite firm sites: put the firm name at hero level, keep one composition in the first viewport, and make hierarchy calmer and more usable on mobile. The system uses cream, charcoal, and deep navy with Cormorant Garamond and Sora.",
        outcome:
          "The concept leads with brand, not deal headlines. Practices read as a focused editorial list, perspective replaces a press dump, and every page carries a clear concept banner. It is labeled Concept throughout and is not affiliated with any real firm.",
      },
      items: [
        {
          category: "Digital",
          src: "assets/work/av-home.png",
          webp: "assets/work/av-home.webp",
          alt: "Ashford Vale LLP concept homepage with prestige hero and firm name",
          width: 1536,
          height: 1024,
          title: "Homepage",
          span: "Concept • web",
        },
        {
          category: "Digital",
          src: "assets/work/av-practices.png",
          webp: "assets/work/av-practices.webp",
          alt: "Ashford Vale practices section with editorial practice list",
          width: 1536,
          height: 1024,
          title: "Practices",
          span: "Concept • IA",
        },
        {
          category: "Digital",
          src: "assets/work/av-about.png",
          webp: "assets/work/av-about.webp",
          alt: "Ashford Vale about page with quiet authority messaging",
          width: 1536,
          height: 1024,
          title: "About",
          span: "Concept • brand",
        },
      ],
    },
    {
      id: "harborglobal",
      title: "Harbor Global",
      titleSub: "LLP",
      meta: "Concept: international law firm website",
      tag: "Web concept",
      caseStudy: {
        eyebrow: "Case study: Concept",
        sub: "A modern international firm website concept with productized practice navigation and clearer CTAs.",
        facts: [
          { label: "Role", value: "Lead Designer" },
          { label: "Team", value: "Independent concept" },
          { label: "Tools", value: "HTML, CSS, JS" },
          { label: "Type", value: "Concept: website, homepage, about, contact" },
        ],
        overview:
          "Harbor Global LLP is a fictional international firm concept for studio marketing aimed at law firms. It improves on dense global-firm patterns with a blue and neutral system, Outfit and Source Serif 4, and a six-lane service grid that clients can scan in one screen instead of hunting through mega-menus.",
        outcome:
          "The homepage leads with the brand, one promise, and clear CTAs. Regional hubs stay light, insights stay brief, and Concept labeling appears on every page. Not affiliated with any real firm.",
      },
      items: [
        {
          category: "Digital",
          src: "assets/work/hg-home.png",
          webp: "assets/work/hg-home.webp",
          alt: "Harbor Global LLP concept homepage with international hero and firm name",
          width: 1536,
          height: 1024,
          title: "Homepage",
          span: "Concept • web",
        },
        {
          category: "Digital",
          src: "assets/work/hg-services.png",
          webp: "assets/work/hg-services.webp",
          alt: "Harbor Global productized services navigation grid",
          width: 1536,
          height: 1024,
          title: "Services",
          span: "Concept • IA",
        },
        {
          category: "Digital",
          src: "assets/work/hg-about.png",
          webp: "assets/work/hg-about.webp",
          alt: "Harbor Global about page explaining the international firm concept",
          width: 1536,
          height: 1024,
          title: "About",
          span: "Concept • brand",
        },
      ],
    },

    {
      id: "saltmarsh",
      title: "Saltmarsh",
      titleSub: "Co.",
      meta: "Concept: CPG product launch",
      tag: "Product Launch",
      caseStudy: {
        eyebrow: "Case study: Concept",
        sub: "A coastal Carolina hot sauce product launch spanning packaging, labels, landing, and launch creative.",
        facts: [
          { label: "Role", value: "Lead Designer" },
          { label: "Team", value: "Independent concept" },
          { label: "Tools", value: "HTML, CSS, JS" },
          { label: "Type", value: "Concept: Packaging, Landing, Launch" },
        ],
        overview:
          "Saltmarsh Co. is a fictional CPG brand built for Brandon Fonville Creative Studio marketing. The brief was to prove the studio's Product Launch package end to end: bottle and carton packaging, a three-SKU label system, a brand-forward product landing page, and a four-frame social launch sequence. The system uses deep ink, sea-glass teal, warm sand, and chalk with Fraunces and Manrope.",
        outcome:
          "The concept shows how a pantry product earns the shelf and the feed with one identity. Flavor rings and chalk label faces stay readable at aisle distance, the landing leads with the brand name and product set, and every page is labeled Concept. Saltmarsh is fictional and not affiliated with any real brand.",
      },
      items: [
        {
          category: "Digital",
          src: "assets/work/sm-home.png",
          webp: "assets/work/sm-home.webp",
          alt: "Saltmarsh Co. concept product landing with brand hero and three hot sauce bottles",
          width: 1536,
          height: 1024,
          title: "Landing",
          span: "Concept • web",
        },
        {
          category: "Packaging",
          src: "assets/work/sm-packaging.png",
          webp: "assets/work/sm-packaging.webp",
          alt: "Saltmarsh packaging system with bottle, carton, and label suite",
          width: 1536,
          height: 1024,
          title: "Packaging",
          span: "Concept • product",
        },
        {
          category: "Print",
          src: "assets/work/sm-labels.png",
          webp: "assets/work/sm-labels.webp",
          alt: "Saltmarsh three-flavor label system print faces",
          width: 1536,
          height: 1024,
          title: "Labels",
          span: "Concept • print",
        },
        {
          category: "Social",
          src: "assets/work/sm-launch.png",
          webp: "assets/work/sm-launch.webp",
          alt: "Saltmarsh four-frame social launch creative sequence",
          width: 1536,
          height: 1024,
          title: "Launch",
          span: "Concept • campaign",
        },
      ],
    },
    {
      id: "halden",
      title: "Halden",
      titleSub: "Build",
      meta: "Concept: design-build practice website",
      tag: "Web concept",
      caseStudy: {
        eyebrow: "Case study: Concept",
        sub: "A Carolina design-build practice website concept with a job ledger, six gates, a material index, and a planning range.",
        facts: [
          { label: "Role", value: "Lead Designer" },
          { label: "Team", value: "Independent concept" },
          { label: "Tools", value: "HTML, CSS, JS" },
          { label: "Type", value: "Concept: website, ledger, method, planning range" },
        ],
        overview:
          "Halden is a fictional design-build practice concept built for Brandon Fonville Creative Studio marketing. The brief was a site that reads like a job record: a project ledger, six gates from brief to keys, a short material index, and a planning range that stays a band, not a contract. The system uses pine and brass on paper with Newsreader, Sora, and IBM Plex Mono. Reference photographs are stand-ins.",
        outcome:
          "The homepage leads with the practice name and one house in the first view. Projects stay in a ledger with size, duration, and place. The method page names six gates, and the planning range updates from area and finish. Every page is labeled Concept. Halden is fictional and is not a licensed contractor.",
      },
      items: [
        {
          category: "Digital",
          src: "assets/work/hb-home.png",
          webp: "",
          alt: "Halden concept homepage with pine and brass hero and Marsh House photograph",
          width: 1440,
          height: 900,
          title: "Homepage",
          span: "Concept • web",
        },
        {
          category: "Digital",
          src: "assets/work/hb-projects.png",
          webp: "",
          alt: "Halden project ledger with Marsh House, Lantern Works, and Market Hall",
          width: 1440,
          height: 900,
          title: "Projects ledger",
          span: "Concept • web",
        },
        {
          category: "Digital",
          src: "assets/work/hb-method.png",
          webp: "",
          alt: "Halden method page with six gates from brief to keys",
          width: 1440,
          height: 900,
          title: "Method",
          span: "Concept • process",
        },
        {
          category: "Digital",
          src: "assets/work/hb-estimate.png",
          webp: "",
          alt: "Halden planning range with area slider and dollar band",
          width: 1440,
          height: 900,
          title: "Planning range",
          span: "Concept • tool",
        },
      ],
    },

    {
      id: "ashgrove",
      title: "Ashgrove",
      titleSub: "Custom Homes",
      meta: "Concept: custom home builder website",
      tag: "Web concept",
      caseStudy: {
        eyebrow: "Case study: Concept",
        sub: "A design-build website concept for custom home builders, made to turn high-value homeowners into booked site walks.",
        facts: [
          { label: "Role", value: "Lead Designer & Front-end Developer" },
          { label: "Team", value: "Independent concept" },
          { label: "Tools", value: "HTML, CSS, JS, Netlify" },
          { label: "Type", value: "Concept: marketing website, desktop and mobile" },
        ],
        link: { href: "/concepts/custom-home-builder/", label: "View the live concept" },
        overview:
          "Ashgrove Custom Homes is a fictional Texas Hill Country design-build firm, created for Brandon Fonville Creative Studio to show custom home builders what their website could be. I owned the concept end to end: positioning, information architecture, copy, the visual system, and a hand-built, responsive front end with no page builder or template behind it.",
        sections: [
          {
            heading: "The challenge",
            body: "Custom builders sell a seven-figure promise before a single wall exists. Most builder sites bury that promise under stock galleries, vague claims, and a contact form that feels like a cold quote request. Homeowners comparing builders want proof of craft, a clear process, and confidence about cost, and they want it quickly on a phone.",
          },
          {
            heading: "The approach",
            body: "I structured the page the way a good first meeting goes: show the work, explain how you build, answer the money question, then invite a site walk. Trust signals sit right under the hero, services read as three clear paths (design-build, build on your plans, whole-home transformations), and a five-step process gives timelines in weeks and months instead of promises. Every section ends near a call to action, so a ready buyer never has to hunt.",
          },
          {
            heading: "Design system",
            body: "Warm limestone and paper neutrals, near-black charcoal, and a single clay accent, chosen to feel like natural building materials rather than tech. Fraunces carries the headlines with italic accent words for an editorial, high-touch voice, while Manrope keeps body copy and UI crisp. Large rounded image frames, generous spacing, and restrained motion (masked headline reveals, clip-path image reveals, light parallax) let the photography do the selling.",
          },
          {
            heading: "Key features",
            list: [
              "Full-bleed hero with a live availability card that adds gentle urgency",
              "Filterable homes gallery (Modern, Ranch, Interiors) with specs on every card",
              "Scroll-linked five-step process with real timelines",
              "Founder quote and construction spec list that make craft tangible",
              "Testimonial slider, a cost-first FAQ, and a site walk form with budget chips",
              "Fully responsive, reduced-motion aware, and fast: plain HTML, CSS, and JS",
            ],
          },
        ],
        outcomeHeading: "Outcome & what it shows",
        outcome:
          "The concept shows a builder how their site can qualify leads, not just collect them. Budget and stage fields pre-sort inquiries, the FAQ handles cost and change-order objections up front, and the gallery and process sell the experience before the first call. It is a ready starting point for a real firm, adaptable to their homes, region, and brand. Ashgrove is fictional and not affiliated with any real builder.",
      },
      items: [
        {
          category: "Digital",
          src: "assets/work/ag-home.jpg",
          webp: "assets/work/ag-home.webp",
          alt: "Ashgrove Custom Homes concept homepage with a dusk exterior hero and serif headline",
          width: 1536,
          height: 1024,
          title: "Homepage",
          span: "Concept • web",
        },
        {
          category: "Digital",
          src: "assets/work/ag-homes.jpg",
          webp: "assets/work/ag-homes.webp",
          alt: "Ashgrove filterable homes gallery with modern and ranch project cards",
          width: 1536,
          height: 1024,
          title: "Homes Gallery",
          span: "Concept • portfolio",
        },
        {
          category: "Digital",
          src: "assets/work/ag-process.jpg",
          webp: "assets/work/ag-process.webp",
          alt: "Ashgrove five-step build process on a dark section with timeline",
          width: 1536,
          height: 1024,
          title: "Process",
          span: "Concept • UX",
        },
        {
          category: "Digital",
          src: "assets/work/ag-mobile.jpg",
          webp: "assets/work/ag-mobile.webp",
          alt: "Ashgrove mobile screens showing the hero, homes gallery, and site walk contact section",
          width: 1536,
          height: 1024,
          title: "Mobile",
          span: "Concept • responsive",
        },
      ],
    },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project";
  }

  function getDefaults() {
    return clone({ projects: DEFAULT_PROJECTS, licenses: LICENSES });
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaults();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.projects)) return getDefaults();
      const savedLicenses = Array.isArray(parsed.licenses) ? parsed.licenses : [];
      const savedLicenseHrefs = new Set(savedLicenses.map((license) => license.href));
      const mergedLicenses = [
        ...savedLicenses,
        ...clone(LICENSES).filter((license) => !savedLicenseHrefs.has(license.href)),
      ];
      return {
        projects: parsed.projects,
        licenses: mergedLicenses,
      };
    } catch {
      return getDefaults();
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return getDefaults();
  }

  function getDefaultProject(id) {
    return clone(DEFAULT_PROJECTS.find((project) => project.id === id) || null);
  }

  function getMissingProjectIds(data) {
    const currentIds = new Set((data.projects || []).map((project) => project.id));
    return DEFAULT_PROJECTS.map((project) => project.id).filter((id) => !currentIds.has(id));
  }

  function restoreProject(data, id) {
    const fresh = getDefaultProject(id);
    if (!fresh) return data;

    const next = {
      projects: [...data.projects],
      licenses: data.licenses || clone(LICENSES),
    };
    const existingIndex = next.projects.findIndex((project) => project.id === id);

    if (existingIndex >= 0) {
      next.projects[existingIndex] = fresh;
      return next;
    }

    const defaultOrder = DEFAULT_PROJECTS.map((project) => project.id);
    const insertAt = defaultOrder.indexOf(id);
    if (insertAt >= 0) {
      next.projects.splice(insertAt, 0, fresh);
    } else {
      next.projects.push(fresh);
    }

    return next;
  }

  function buildCaseStudies(projects) {
    const map = {};
    projects.forEach((project) => {
      map[project.id] = {
        eyebrow: project.caseStudy.eyebrow,
        title: project.titleSub ? `${project.title} ${project.titleSub}` : project.title,
        sub: project.caseStudy.sub,
        facts: project.caseStudy.facts,
        images: project.items.map((item) => ({
          src: item.src,
          caption: `${item.title}, ${item.span.replace(/ • /g, ", ")}`,
        })),
        overview: project.caseStudy.overview,
        outcome: project.caseStudy.outcome,
        sections: project.caseStudy.sections || [],
        outcomeHeading: project.caseStudy.outcomeHeading || "",
        link: project.caseStudy.link || null,
      };
    });
    return map;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderWorkItem(item) {
    const imgAttrs = `class="work-img" src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" width="${item.width || 1024}" height="${item.height || 683}"`;
    const media = item.webp
      ? `<picture><source srcset="${escapeHtml(item.webp)}" type="image/webp" /><img ${imgAttrs} /></picture>`
      : `<img ${imgAttrs} />`;

    return `<figure class="work-item" data-cat="${escapeHtml(item.category)}">
      ${media}
      <figcaption><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.span)}</span></figcaption>
    </figure>`;
  }

  function renderProject(project, options) {
    const preview = options && options.preview;
    const titleHtml = project.titleSub
      ? `${escapeHtml(project.title)} <span class="group-sub">${escapeHtml(project.titleSub)}</span>`
      : escapeHtml(project.title);

    const itemsHtml = (project.items || []).map(renderWorkItem).join("");
    const groupClass = preview ? "work-group work-group-preview" : "work-group reveal";

    return `<div class="${groupClass}" data-project="${escapeHtml(project.id)}">
      <div class="work-group-head">
        <h3>${titleHtml}</h3>
        <span class="group-meta">${escapeHtml(project.meta)}</span>
        <span class="group-tag">${escapeHtml(project.tag)}</span>
        <button type="button" class="case-study-btn" data-open="${escapeHtml(project.id)}">View case study</button>
      </div>
      <div class="work-grid">${itemsHtml}</div>
    </div>`;
  }

  function renderWorkSection(container, projects) {
    if (!container) return;
    container.innerHTML = projects.map(renderProject).join("");
  }

  function newProject() {
    const id = `project-${Date.now()}`;
    return {
      id,
      title: "New Project",
      titleSub: "",
      meta: "Client, project type",
      tag: "Category",
      caseStudy: {
        eyebrow: "Case study",
        sub: "Short project description.",
        facts: [
          { label: "Role", value: "Designer" },
          { label: "Team", value: "Solo" },
          { label: "Tools", value: "Figma, Illustrator" },
          { label: "Scope", value: "Brand design" },
        ],
        overview: "Project overview goes here.",
        outcome: "What was achieved goes here.",
      },
      items: [
        {
          category: "Product",
          src: "assets/work/example.png",
          webp: "",
          alt: "Project image",
          width: 1024,
          height: 683,
          title: "Image title",
          span: "Category • detail",
        },
      ],
    };
  }

  function newWorkItem() {
    return {
      category: "Product",
      src: "assets/work/example.png",
      webp: "",
      alt: "Project image",
      width: 1024,
      height: 683,
      title: "Image title",
      span: "Category • detail",
    };
  }

  window.WorkStore = {
    STORAGE_KEY,
    getDefaults,
    load,
    save,
    reset,
    getDefaultProject,
    getMissingProjectIds,
    restoreProject,
    buildCaseStudies,
    renderWorkSection,
    renderProject,
    renderWorkItem,
    escapeHtml,
    slugify,
    newProject,
    newWorkItem,
  };
})();
