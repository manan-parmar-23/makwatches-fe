import { cn } from "@/lib/utils";
import { Container, Heading, Reveal, Text } from "@/design-system";

/**
 * The full-accent poster band.
 *
 * This is the one place the accent runs as a field rather than as an
 * highlight, and the reference is explicit that it should appear at most once
 * on a page. Using it twice makes both instances ordinary.
 *
 * The right-hand slot takes any content -- typically Newsletter.
 */

export interface PosterCTAProps {
  headline: React.ReactNode;
  body?: React.ReactNode;
  /** Right-hand panel, e.g. a signup card. */
  aside?: React.ReactNode;
  className?: string;
}

export function PosterCTA({
  headline,
  body,
  aside,
  className,
}: PosterCTAProps) {
  return (
    <section
      className={cn(
        "border-b-2 border-mak-line bg-mak-accent text-mak-on-accent",
        className
      )}
    >
      <Container>
        <div
          className={cn(
            "grid items-center gap-10 py-20 md:py-24",
            aside && "lg:grid-cols-[1.2fr_0.8fr] lg:gap-12"
          )}
        >
          <Reveal>
            <Heading
              level="hero"
              as="h2"
              className="text-mak-on-accent [font-size:clamp(2.5rem,6vw,5.5rem)]"
            >
              {headline}
            </Heading>

            {body ? (
              <Text size="lead" className="mt-5 max-w-[420px] text-mak-on-accent/85">
                {body}
              </Text>
            ) : null}
          </Reveal>

          {aside ? <Reveal delay={1}>{aside}</Reveal> : null}
        </div>
      </Container>
    </section>
  );
}
