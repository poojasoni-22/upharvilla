/**
 * Reusable JSON-LD structured data component.
 * Injects a <script type="application/ld+json"> tag into the page head.
 */
export function JsonLd<T extends Record<string, unknown>>({
  schema,
}: {
  schema: T;
}) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD injection
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  );
}
