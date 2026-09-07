import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ArrowRightIcon,
  Badge,
  Button,
  ButtonLink,
  Container,
  Divider,
  EmptyState,
  ErrorState,
  Eyebrow,
  Heading,
  HeartIcon,
  IconButton,
  LoadingState,
  Marquee,
  Price,
  ProductCardSkeleton,
  Reveal,
  RuleGrid,
  SearchIcon,
  Skeleton,
  Tag,
  Text,
  ToastProvider,
  BagIcon,
} from "@/design-system";
import { ProductGrid, ProductImage, StockBadge } from "@/components/commerce";
import { CategoryTiles, StatGrid, TrustStrip } from "@/components/marketing";

import { GallerySection, Specimen } from "./GallerySection";
import { InteractiveGallery } from "./InteractiveGallery";
import { SAMPLE_PRODUCTS } from "./demo-data";

/**
 * The MAK Watches component gallery.
 *
 * A development reference for verifying the design system visually before the
 * storefront is rebuilt on it. Every specimen uses the same components the real
 * pages will.
 *
 * Excluded from search engines: this is an internal tool, not a storefront
 * page, and it should never be indexed or surfaced.
 *
 * A server component; only InteractiveGallery ships JavaScript.
 */

export const metadata: Metadata = {
  title: "Design System",
  description: "MAK Watches design system component gallery.",
  robots: { index: false, follow: false },
};

/**
 * Whether the gallery is reachable.
 *
 * Always available in development. In a production build it is served only
 * when NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM is set, so it can be turned on for a
 * preview deployment during review without shipping an internal tool to the
 * live storefront. noindex is belt-and-braces on top of this.
 */
const GALLERY_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM === "true";

const SECTIONS = [
  { id: "tokens", label: "Tokens" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "display", label: "Badges & price" },
  { id: "grid", label: "Rule grid" },
  { id: "states", label: "States" },
  { id: "products", label: "Product cards" },
  { id: "images", label: "Image states" },
  { id: "forms", label: "Form controls" },
  { id: "overlays", label: "Drawers & modals" },
  { id: "controls", label: "Filters & sort" },
  { id: "disclosure", label: "Accordion & tabs" },
  { id: "search", label: "Search" },
  { id: "marketing", label: "Marketing" },
  { id: "motion", label: "Motion" },
];

const SWATCHES: { token: string; label: string; className: string }[] = [
  { token: "--color-mak-bg", label: "Background", className: "bg-mak-bg" },
  { token: "--color-mak-surface", label: "Surface", className: "bg-mak-surface" },
  { token: "--color-mak-ink", label: "Ink / text", className: "bg-mak-ink" },
  { token: "--color-mak-accent", label: "Accent", className: "bg-mak-accent" },
  { token: "--color-mak-success", label: "Success", className: "bg-mak-success" },
  { token: "--color-mak-warning", label: "Warning", className: "bg-mak-warning" },
  { token: "--color-mak-error", label: "Error", className: "bg-mak-error" },
];

const ACCENT_RAMP = [
  "bg-mak-accent-100",
  "bg-mak-accent-200",
  "bg-mak-accent-300",
  "bg-mak-accent-400",
  "bg-mak-accent-500",
  "bg-mak-accent-600",
  "bg-mak-accent-700",
  "bg-mak-accent-800",
  "bg-mak-accent-900",
];

const NEUTRAL_RAMP = [
  "bg-mak-neutral-100",
  "bg-mak-neutral-200",
  "bg-mak-neutral-300",
  "bg-mak-neutral-400",
  "bg-mak-neutral-500",
  "bg-mak-neutral-600",
  "bg-mak-neutral-700",
  "bg-mak-neutral-800",
  "bg-mak-neutral-900",
];

export default function DesignSystemPage() {
  if (!GALLERY_ENABLED) notFound();

  return (
    <ToastProvider>
      {/*
        `mak` scopes the design-system base styles. The legacy globals.css sets
        its own body background and text color, so without this wrapper the
        gallery would render on the old storefront's white ground.
      */}
      <div className="mak min-h-screen bg-mak-bg">
        <header className="border-b-2 border-mak-line bg-mak-bg">
          <Container>
            <div className="py-10">
              <Eyebrow withRule className="mb-4">
                Internal reference
              </Eyebrow>
              <Heading level="display" as="h1">
                MAK Watches design system
              </Heading>
              <Text size="lead" tone="muted" className="mt-4 max-w-2xl">
                Every primitive the reconstruction is built from. Sample data is
                neutral and clearly labelled — no product names, prices or
                specifications here are real.
              </Text>

              <nav aria-label="Sections" className="mt-8">
                <ul className="flex flex-wrap gap-2">
                  {SECTIONS.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="inline-flex min-h-9 items-center border-2 border-mak-divider px-3 text-mak-small text-mak-ink no-underline transition-colors hover:border-mak-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                      >
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </Container>
        </header>

        <GallerySection
          id="tokens"
          title="Color tokens"
          note="Every color in the system comes from these tokens. The accent is defined in one place and is swappable without touching a component. Nothing hardcodes a hex."
        >
          <RuleGrid cols={{ base: 2, md: 4, lg: 4 }}>
            {SWATCHES.map((swatch) => (
              <div key={swatch.token} className="p-4">
                <div
                  className={`mb-3 h-20 w-full border-2 border-mak-line ${swatch.className}`}
                />
                <div className="font-display text-mak-small font-extrabold text-mak-ink">
                  {swatch.label}
                </div>
                <code className="text-mak-micro normal-case tracking-normal text-mak-subtle">
                  {swatch.token}
                </code>
              </div>
            ))}
          </RuleGrid>

          <Specimen label="Accent ramp 100–900" className="mt-10">
            <div className="flex w-full">
              {ACCENT_RAMP.map((cls) => (
                <div key={cls} className={`h-14 flex-1 ${cls}`} />
              ))}
            </div>
          </Specimen>

          <Specimen label="Neutral ramp 100–900">
            <div className="flex w-full">
              {NEUTRAL_RAMP.map((cls) => (
                <div key={cls} className={`h-14 flex-1 ${cls}`} />
              ))}
            </div>
          </Specimen>
        </GallerySection>

        <GallerySection
          id="typography"
          title="Typography"
          note="Archivo throughout, loaded via next/font. Headings are weight 800 with tight tracking; micro-labels are uppercase with wide tracking. Resize the window — hero and display sizes are fluid."
        >
          <div className="flex flex-col gap-8">
            <div>
              <Text size="label" tone="subtle" className="mb-2">
                Hero — clamp(44px, 7.4vw, 108px)
              </Text>
              <Heading level="hero" as="p">
                Time, engineered.
              </Heading>
            </div>

            <Divider weight="hairline" />

            <div>
              <Text size="label" tone="subtle" className="mb-2">
                Display — clamp(34px, 4.4vw, 56px)
              </Text>
              <Heading level="display" as="p">
                Find your movement.
              </Heading>
            </div>

            <Divider weight="hairline" />

            <div>
              <Text size="label" tone="subtle" className="mb-2">
                Title / Heading / Subheading
              </Text>
              <Heading level="title" as="p">
                Section title
              </Heading>
              <Heading level="heading" as="p" className="mt-2">
                Card heading
              </Heading>
              <Heading level="subheading" as="p" className="mt-2">
                Subheading
              </Heading>
            </div>

            <Divider weight="hairline" />

            <div className="max-w-2xl">
              <Text size="label" tone="subtle" className="mb-2">
                Body scale
              </Text>
              <Text size="lead">
                Lead copy, used beneath a hero or section heading.
              </Text>
              <Text className="mt-2">
                Body copy at the default size, the workhorse of the system.
              </Text>
              <Text size="small" tone="muted" className="mt-2">
                Small copy for supporting detail and metadata.
              </Text>
              <Text size="label" tone="subtle" className="mt-3">
                Label — 12px uppercase, 0.14em
              </Text>
              <Text size="micro" tone="subtle" className="mt-2">
                Micro — 10px uppercase, 0.18em
              </Text>
            </div>

            <Divider weight="hairline" />

            <div>
              <Text size="label" tone="subtle" className="mb-2">
                Eyebrow
              </Text>
              <Eyebrow withRule>The precision house</Eyebrow>
            </div>
          </div>
        </GallerySection>

        <GallerySection
          id="buttons"
          title="Buttons"
          note="One implementation, four variants. Every size meets the 44px touch minimum. Tab through them to check the accent focus ring."
        >
          <Specimen label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </Specimen>

          <Specimen label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Specimen>

          <Specimen label="With icon, and as a link">
            <Button iconRight={<ArrowRightIcon size={16} />}>
              Shop the collection
            </Button>
            <ButtonLink href="#tokens" variant="secondary">
              A link styled as a button
            </ButtonLink>
          </Specimen>

          <Specimen label="Icon buttons">
            <IconButton label="Search">
              <SearchIcon />
            </IconButton>
            <IconButton label="Wishlist, 3 saved" badge={3}>
              <HeartIcon />
            </IconButton>
            <IconButton label="Bag, 2 items" badge={2} badgeTone="accent">
              <BagIcon />
            </IconButton>
            <IconButton label="Solid" variant="solid">
              <HeartIcon />
            </IconButton>
          </Specimen>

          <div className="mt-8 bg-mak-ink p-8">
            <Text size="label" className="mb-3 text-mak-on-ink/60">
              On the ink ground
            </Text>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="inverse">Inverse</Button>
              <IconButton label="Search" variant="inverse">
                <SearchIcon />
              </IconButton>
            </div>
          </div>
        </GallerySection>

        <GallerySection
          id="display"
          title="Badges, tags & price"
          note="Square corners and visible rules throughout — never a rounded pill. Prices use en-IN grouping, so lakhs read correctly."
        >
          <Specimen label="Badges">
            <Badge>Category</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="surface">Surface</Badge>
            <Badge tone="success">In stock</Badge>
            <Badge tone="warning">Low stock</Badge>
            <Badge tone="error">Sold out</Badge>
          </Specimen>

          <Specimen label="Stock badge (derived from a count)">
            <StockBadge stock={20} />
            <StockBadge stock={3} />
            <StockBadge stock={0} />
          </Specimen>

          <Specimen label="Tags">
            <Tag>Neutral</Tag>
            <Tag tone="accent">Accent</Tag>
            <Tag tone="outline">Outline</Tag>
          </Specimen>

          <Specimen label="Price">
            <Price value={4999} size="sm" />
            <Price value={24999} size="md" />
            <Price value={249000} size="lg" />
            <Price value={38999} compareAt={49999} size="xl" />
          </Specimen>
        </GallerySection>

        <GallerySection
          id="grid"
          title="Rule grid"
          note="The signature motif. The container paints the divider colour, each cell repaints the ground, and the 2px gap between them shows through as the rule. Stats, category tiles, product grids and spec tables are all this one component."
        >
          <RuleGrid cols={{ base: 2, md: 3, lg: 4 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="p-8">
                <div className="font-display text-2xl font-extrabold text-mak-ink">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <Text size="small" tone="muted" className="mt-1">
                  Cell
                </Text>
              </div>
            ))}
          </RuleGrid>
        </GallerySection>

        <GallerySection
          id="states"
          title="Loading, empty & error"
          note="Every data-backed surface uses these rather than a blank screen or a bare spinner. Skeletons are sized like the content they replace, so nothing shifts on arrival."
        >
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Text size="label" tone="subtle" className="mb-3">
                Loading
              </Text>
              <div className="border-2 border-mak-line">
                <LoadingState label="Loading products" />
              </div>
            </div>
            <div>
              <Text size="label" tone="subtle" className="mb-3">
                Empty
              </Text>
              <EmptyState
                title="Nothing matches yet."
                description="Try removing a filter."
              />
            </div>
            <div>
              <Text size="label" tone="subtle" className="mb-3">
                Error
              </Text>
              <ErrorState description="The catalog could not be reached." />
            </div>
          </div>

          <Specimen label="Skeletons" className="mt-10">
            <div className="w-full max-w-xs">
              <Skeleton variant="title" className="mb-3" />
              <Skeleton variant="text" className="mb-2" />
              <Skeleton variant="text" className="w-2/3" />
            </div>
          </Specimen>

          <Text size="label" tone="subtle" className="mb-3">
            Product grid, loading
          </Text>
          <RuleGrid cols={{ base: 2, md: 3, lg: 4 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </RuleGrid>
        </GallerySection>

        <GallerySection
          id="products"
          title="Product cards"
          note="Hover a card on a mouse device: the image scales and the action bar fades in. On touch there is no hover to reveal it, so the bar is always visible — resize to a phone width and check. Sample products carry no images, no movement and no specifications, which is exactly how a real record with missing data renders."
        >
          <ProductGrid products={SAMPLE_PRODUCTS} priorityCount={0} />
        </GallerySection>

        <GallerySection
          id="images"
          title="Image states"
          note="A missing or failed image never shows a broken icon. The branded placeholder is contained, faded and inset so it reads as a marker — it must never be mistaken for product photography."
        >
          <RuleGrid cols={{ base: 2, md: 3, lg: 3 }}>
            <div className="p-4">
              <ProductImage media={null} alt="" />
              <Text size="small" tone="muted" className="mt-3">
                No media — placeholder
              </Text>
            </div>
            <div className="p-4">
              {/*
                A same-origin path that 404s, to exercise the onError fallback.
                Deliberately not a remote URL: next/image rejects any host not
                in the next.config.ts allow-list before the image ever loads,
                which would throw rather than demonstrate the fallback.
              */}
              <ProductImage media="/__missing-image-specimen.jpg" alt="" />
              <Text size="small" tone="muted" className="mt-3">
                Failed load — same fallback
              </Text>
            </div>
            <div className="p-4">
              <div className="border-2 border-mak-line">
                <ProductImage media={null} alt="" grayscale={false} />
              </div>
              <Text size="small" tone="muted" className="mt-3">
                Framed, as on a PDP
              </Text>
            </div>
          </RuleGrid>
        </GallerySection>

        <InteractiveGallery />

        <GallerySection
          id="marketing"
          title="Marketing sections"
          note="Every one of these takes its copy as props and has no defaults. Rendered with placeholder text here; a section given no content renders nothing rather than inventing a claim."
        >
          <Text size="label" tone="subtle" className="mb-3">
            Stat grid — values are strings, rendered verbatim
          </Text>
          <StatGrid
            stats={[
              { value: "—", label: "Placeholder metric" },
              { value: "—", label: "Placeholder metric" },
              { value: "—", label: "Placeholder metric" },
              { value: "—", label: "Placeholder metric" },
            ]}
          />

          <Text size="label" tone="subtle" className="mb-3 mt-10">
            Trust strip
          </Text>
          <TrustStrip
            items={[
              { title: "Placeholder", description: "Real policy copy goes here." },
              { title: "Placeholder", description: "Real policy copy goes here." },
              { title: "Placeholder", description: "Real policy copy goes here." },
            ]}
            className="!px-0"
          />

          <Text size="label" tone="subtle" className="mb-3 mt-10">
            Category tiles — 1-up mobile, 2-up tablet, 3-up desktop
          </Text>
          <CategoryTiles
            tiles={[
              { label: "Sample A", href: "#products", count: 4 },
              { label: "Sample B", href: "#products", count: 2 },
              { label: "Sample C", href: "#products" },
            ]}
          />
        </GallerySection>

        <GallerySection
          id="motion"
          title="Motion"
          note="One easing throughout: cubic-bezier(.16, 1, .3, 1). Reveals fire once and never replay. Turn on 'reduce motion' in your OS and reload — the marquee goes static, reveals render in their final state, and no scroll listener is attached."
          bleed
        >
          <Container>
            <Specimen label="Reveal (scroll into view)">
              <div className="grid w-full gap-2 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Reveal key={i} delay={i as 0 | 1 | 2}>
                    <div className="border-2 border-mak-line p-8">
                      <Text size="label" tone="subtle">
                        Delay {i}
                      </Text>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Specimen>
          </Container>

          <div className="mt-8">
            <Marquee>
              MECHANICAL · QUARTZ · AUTOMATIC · CHRONOGRAPH · DIVER · DRESS ·
              SPORT ·
            </Marquee>
          </div>
        </GallerySection>

        <footer className="border-t-2 border-mak-line py-10">
          <Container>
            <Text size="small" tone="subtle">
              Internal design-system reference. Not indexed, not linked from the
              storefront.
            </Text>
          </Container>
        </footer>
      </div>
    </ToastProvider>
  );
}
