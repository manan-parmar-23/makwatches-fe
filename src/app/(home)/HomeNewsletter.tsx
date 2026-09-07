"use client";

import { Newsletter, PosterCTA } from "@/components/marketing";
import type { PosterContent } from "@/lib/api/storefront";

/**
 * The closing poster band.
 *
 * The accent runs as a full field here, which the reference reserves for
 * exactly one place on a page.
 *
 * The signup form is rendered without an `onSubmit`, which puts Newsletter into
 * its disabled state with a visible "Signup is not connected yet." note. There
 * is no subscriber endpoint on the backend, and a form that silently discards
 * addresses — or worse, shows a fake confirmation — would be a lie told to a
 * customer. Wiring it up is a backend task, at which point this passes a real
 * handler and the note disappears.
 */
export function HomeNewsletter({ content }: { content: PosterContent }) {
  return (
    <PosterCTA
      headline={content.headlineLines.map((line, index) => (
        <span key={line} className="block uppercase">
          {line}
          {index < content.headlineLines.length - 1 ? <br /> : null}
        </span>
      ))}
      body={content.body}
      aside={
        <Newsletter
          label={content.emailLabel}
          submitLabel={content.submitLabel}
          note={content.note}
        />
      }
    />
  );
}
