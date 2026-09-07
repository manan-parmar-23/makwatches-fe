import type { Metadata } from "next";

import { Container, Eyebrow, Heading, Section } from "@/design-system";
import { AccountShell } from "../../(account)/AccountShell";
import { ReviewsList } from "../../(account)/ReviewsList";

/**
 * Your reviews.
 *
 * A server shell so the page always has its heading; the body is a client
 * component because the account is per-visitor and only exists behind a token.
 * Never indexed.
 */

export const metadata: Metadata = {
  title: "Your reviews",
  description: "Reviews you have written.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="mak bg-mak-bg">
      <Section spacing="default">
        <Container>
          <Eyebrow withRule className="mb-4">
            Account
          </Eyebrow>
          <Heading level="display" as="h1" className="mb-9">
            Your reviews.
          </Heading>

          <AccountShell>
            <ReviewsList />
          </AccountShell>
        </Container>
      </Section>
    </div>
  );
}
