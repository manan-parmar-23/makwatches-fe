"use client";

import { useEffect, useState } from "react";

import { ADMIN_COLORS } from "@/components/admin/home/constants";
import {
  getAdminStorefront,
  renumber,
  reorder,
  resetAdminStorefront,
  updateAdminStorefront,
  type TileWarning,
} from "@/lib/api/storefront-admin";
import type {
  CategoryTileConfig,
  FooterColumn,
  NavItem,
  ProductRail,
  StorefrontContent,
} from "@/lib/api/storefront";

import {
  AdminButton,
  AdminCard,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminToggle,
  RowActions,
} from "./controls";

/**
 * The storefront editor.
 *
 * This is the piece that makes "the admin controls the whole display without a
 * frontend deploy" true rather than aspirational: navigation, category tiles,
 * every homepage section and every product rail come from one MongoDB document,
 * and until now that document could only be changed with a direct PUT.
 *
 * Two rules shape the whole screen:
 *
 *  - It edits the *stored* document, not the public one. The public payload has
 *    already had disabled items filtered out; editing that and saving it back
 *    would delete every switched-off entry.
 *  - Rails and tiles name a selection *rule* -- "latest", "category: Men" --
 *    never a fixed list of product ids, so what they show keeps up as stock
 *    turns over.
 */

type Tab = "sections" | "navigation" | "tiles" | "rails";

const TABS: { id: Tab; label: string }[] = [
  { id: "sections", label: "Sections" },
  { id: "navigation", label: "Navigation" },
  { id: "tiles", label: "Category tiles" },
  { id: "rails", label: "Product rails" },
];

export function StorefrontEditor() {
  const [content, setContent] = useState<StorefrontContent | null>(null);
  const [warnings, setWarnings] = useState<TileWarning[]>([]);
  const [tab, setTab] = useState<Tab>("sections");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    setError(null);
    getAdminStorefront()
      .then(({ content: data, warnings: found }) => {
        setContent(data);
        setWarnings(found);
        setDirty(false);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load the storefront.")
      );
  }

  useEffect(load, []);

  // A half-finished edit is easy to lose to a stray click on the sidebar.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function edit(next: StorefrontContent) {
    setContent(next);
    setDirty(true);
    setStatus(null);
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setError(null);
    try {
      const result = await updateAdminStorefront(content);
      setContent(result.content);
      setWarnings(result.warnings);
      setDirty(false);
      setStatus("Saved. The storefront picks this up within a few minutes.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    const confirmed = window.confirm(
      "Restore the shipped defaults?\n\nThis discards the stored storefront document, including every navigation item, tile and rail you have configured. It cannot be undone."
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const result = await resetAdminStorefront();
      setContent(result.content);
      setWarnings(result.warnings);
      setDirty(false);
      setStatus("Restored to the shipped defaults.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not reset.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !content) {
    return (
      <div
        className="rounded-xl border p-6 text-sm"
        style={{ borderColor: ADMIN_COLORS.error, color: ADMIN_COLORS.error }}
      >
        {error}
        <div className="mt-4">
          <AdminButton onClick={load}>Try again</AdminButton>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
        Loading the storefront…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {warnings.length > 0 ? (
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: ADMIN_COLORS.primary, backgroundColor: "#FFFBEF" }}
        >
          <p className="text-sm font-semibold" style={{ color: ADMIN_COLORS.text }}>
            {warnings.length} category tile
            {warnings.length === 1 ? "" : "s"} cannot be shown
          </p>
          <ul className="mt-2 list-disc pl-5">
            {warnings.map((warning) => (
              <li
                key={warning.tileId}
                className="text-sm"
                style={{ color: ADMIN_COLORS.textMuted }}
              >
                {warning.message}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs" style={{ color: ADMIN_COLORS.textMuted }}>
            These tiles are skipped on the storefront rather than replaced with
            something else. Point them at a category that exists, or remove them.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm" style={{ color: ADMIN_COLORS.error }}>
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="text-sm" style={{ color: ADMIN_COLORS.success }}>
          {status}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-b pb-3" style={{ borderColor: ADMIN_COLORS.surfaceLight }}>
        {TABS.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setTab(entry.id)}
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={
              tab === entry.id
                ? { backgroundColor: ADMIN_COLORS.primary, color: ADMIN_COLORS.secondary }
                : { color: ADMIN_COLORS.textMuted }
            }
          >
            {entry.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {dirty ? (
            <span className="text-xs" style={{ color: ADMIN_COLORS.textMuted }}>
              Unsaved changes
            </span>
          ) : null}
          <AdminButton tone="danger" onClick={() => void reset()} disabled={saving}>
            Reset to defaults
          </AdminButton>
          <AdminButton
            tone="primary"
            onClick={() => void save()}
            disabled={saving || !dirty}
          >
            {saving ? "Saving…" : "Save changes"}
          </AdminButton>
        </div>
      </div>

      {tab === "sections" ? (
        <SectionsTab content={content} onChange={edit} />
      ) : tab === "navigation" ? (
        <NavigationTab content={content} onChange={edit} />
      ) : tab === "tiles" ? (
        <TilesTab content={content} onChange={edit} />
      ) : (
        <RailsTab content={content} onChange={edit} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function SectionsTab({
  content,
  onChange,
}: {
  content: StorefrontContent;
  onChange: (next: StorefrontContent) => void;
}) {
  const toggles: {
    key: keyof StorefrontContent;
    label: string;
    description: string;
  }[] = [
    { key: "hero", label: "Hero", description: "The opening statement and its headline lines." },
    { key: "marquee", label: "Marquee", description: "The scrolling band of terms under the hero." },
    { key: "trust", label: "Trust strip", description: "Short reassurance lines. Only real claims belong here." },
    { key: "stats", label: "Stats", description: "Numbers about the house. Leave off unless the figures are true." },
    { key: "categoryTiles", label: "Category tiles", description: "The shop-by-category grid." },
    { key: "craft", label: "Craft", description: "The sticky-scroll panels." },
    { key: "house", label: "House", description: "The editorial block about the brand." },
    { key: "poster", label: "Poster", description: "The closing sign-up panel." },
    {
      key: "boutique",
      label: "3D boutique",
      description:
        "The optional showroom at /boutique. Off means the route returns 404, not an empty page.",
    },
  ];

  return (
    <AdminCard
      title="Homepage sections"
      description="Which blocks the homepage renders. A section switched off disappears entirely — it is not replaced with a placeholder."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {toggles.map((toggle) => {
          const section = content[toggle.key] as { enabled: boolean };
          return (
            <div
              key={String(toggle.key)}
              className="rounded-lg border p-4"
              style={{ borderColor: ADMIN_COLORS.surfaceLight }}
            >
              <AdminToggle
                checked={Boolean(section?.enabled)}
                onChange={(next) =>
                  onChange({
                    ...content,
                    [toggle.key]: { ...section, enabled: next },
                  })
                }
                label={toggle.label}
                description={toggle.description}
              />
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

function NavigationTab({
  content,
  onChange,
}: {
  content: StorefrontContent;
  onChange: (next: StorefrontContent) => void;
}) {
  const nav = content.navigation;

  function setPrimary(items: NavItem[]) {
    onChange({ ...content, navigation: { ...nav, primary: renumber(items) } });
  }
  function setSupport(items: NavItem[]) {
    onChange({ ...content, navigation: { ...nav, support: renumber(items) } });
  }
  function setFooter(columns: FooterColumn[]) {
    onChange({ ...content, navigation: { ...nav, footer: renumber(columns) } });
  }

  return (
    <div className="flex flex-col gap-6">
      <NavList
        title="Primary navigation"
        description="The header menu. An item switched off is removed from the public payload entirely, so it never reaches the page."
        items={nav.primary}
        onChange={setPrimary}
      />

      <NavList
        title="Customer care"
        description="Shown in the mobile menu and used for support links."
        items={nav.support}
        onChange={setSupport}
      />

      <AdminCard
        title="Footer columns"
        description="Each column is a heading and its links. A column with no enabled links is not rendered."
        action={
          <AdminButton
            onClick={() =>
              setFooter([
                ...nav.footer,
                {
                  id: `column-${Date.now()}`,
                  heading: "New column",
                  enabled: true,
                  order: nav.footer.length + 1,
                  items: [],
                },
              ])
            }
          >
            Add column
          </AdminButton>
        }
      >
        <div className="flex flex-col gap-5">
          {nav.footer.map((column, index) => (
            <div
              key={column.id}
              className="rounded-lg border p-4"
              style={{ borderColor: ADMIN_COLORS.surfaceLight }}
            >
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap items-end gap-3">
                  <AdminField label="Heading">
                    <AdminInput
                      value={column.heading}
                      onChange={(e) => {
                        const next = [...nav.footer];
                        next[index] = { ...column, heading: e.target.value };
                        setFooter(next);
                      }}
                    />
                  </AdminField>
                  <AdminToggle
                    checked={column.enabled}
                    onChange={(value) => {
                      const next = [...nav.footer];
                      next[index] = { ...column, enabled: value };
                      setFooter(next);
                    }}
                    label="Shown"
                  />
                </div>
                <RowActions
                  onUp={() => setFooter(reorder(nav.footer, index, index - 1))}
                  onDown={() => setFooter(reorder(nav.footer, index, index + 1))}
                  onRemove={() =>
                    setFooter(nav.footer.filter((_, i) => i !== index))
                  }
                  disableUp={index === 0}
                  disableDown={index === nav.footer.length - 1}
                />
              </div>

              <NavRows
                items={column.items}
                onChange={(items) => {
                  const next = [...nav.footer];
                  next[index] = { ...column, items: renumber(items) };
                  setFooter(next);
                }}
              />
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

function NavList({
  title,
  description,
  items,
  onChange,
}: {
  title: string;
  description: string;
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
}) {
  return (
    <AdminCard
      title={title}
      description={description}
      action={
        <AdminButton
          onClick={() =>
            onChange([
              ...items,
              {
                id: `item-${Date.now()}`,
                label: "New item",
                href: "/",
                enabled: true,
                order: items.length + 1,
                kind: "link",
              },
            ])
          }
        >
          Add item
        </AdminButton>
      }
    >
      <NavRows items={items} onChange={onChange} />
    </AdminCard>
  );
}

function NavRows({
  items,
  onChange,
}: {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
        Nothing here yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="flex flex-wrap items-end gap-3 rounded-lg border p-3"
          style={{ borderColor: ADMIN_COLORS.surfaceLight }}
        >
          <div className="min-w-[9rem] flex-1">
            <AdminField label="Label">
              <AdminInput
                value={item.label}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = { ...item, label: e.target.value };
                  onChange(next);
                }}
              />
            </AdminField>
          </div>

          <div className="min-w-[9rem] flex-1">
            <AdminField
              label="Link"
              hint={
                item.href && !item.href.startsWith("/") && !item.href.startsWith("http")
                  ? "Paths should start with /"
                  : undefined
              }
            >
              <AdminInput
                value={item.href}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = { ...item, href: e.target.value };
                  onChange(next);
                }}
              />
            </AdminField>
          </div>

          <AdminToggle
            checked={item.enabled}
            onChange={(value) => {
              const next = [...items];
              next[index] = { ...item, enabled: value };
              onChange(next);
            }}
            label="Shown"
          />

          <RowActions
            onUp={() => onChange(reorder(items, index, index - 1))}
            onDown={() => onChange(reorder(items, index, index + 1))}
            onRemove={() => onChange(items.filter((_, i) => i !== index))}
            disableUp={index === 0}
            disableDown={index === items.length - 1}
          />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Category tiles                                                      */
/* ------------------------------------------------------------------ */

function TilesTab({
  content,
  onChange,
}: {
  content: StorefrontContent;
  onChange: (next: StorefrontContent) => void;
}) {
  const tiles = content.categoryTiles;

  function set(next: Partial<typeof tiles>) {
    onChange({ ...content, categoryTiles: { ...tiles, ...next } });
  }

  return (
    <AdminCard
      title="Category tiles"
      description="The shop-by-category grid. Follow the live category tree automatically, or choose and order the tiles yourself."
      action={
        !tiles.autoFromCategories ? (
          <AdminButton
            onClick={() =>
              set({
                tiles: [
                  ...(tiles.tiles ?? []),
                  {
                    id: `tile-${Date.now()}`,
                    enabled: true,
                    order: (tiles.tiles?.length ?? 0) + 1,
                    source: "subcategory",
                    value: "",
                    label: "",
                  },
                ],
              })
            }
          >
            Add tile
          </AdminButton>
        ) : null
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Eyebrow">
            <AdminInput
              value={tiles.eyebrow ?? ""}
              onChange={(e) => set({ eyebrow: e.target.value })}
            />
          </AdminField>
          <AdminField label="Title">
            <AdminInput
              value={tiles.title ?? ""}
              onChange={(e) => set({ title: e.target.value })}
            />
          </AdminField>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ borderColor: ADMIN_COLORS.surfaceLight }}
        >
          <AdminToggle
            checked={tiles.autoFromCategories}
            onChange={(value) => set({ autoFromCategories: value })}
            label="Follow the category tree automatically"
            description="One tile per subcategory, in tree order. Turn this off to choose and order the tiles yourself."
          />
        </div>

        {tiles.autoFromCategories ? (
          <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
            Tiles are generated from the live categories, so a category added or
            renamed in Categories appears here without any change to this page.
          </p>
        ) : (
          <TileRows
            tiles={tiles.tiles ?? []}
            onChange={(next) => set({ tiles: renumber(next) })}
          />
        )}
      </div>
    </AdminCard>
  );
}

function TileRows({
  tiles,
  onChange,
}: {
  tiles: CategoryTileConfig[];
  onChange: (tiles: CategoryTileConfig[]) => void;
}) {
  if (tiles.length === 0) {
    return (
      <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
        No tiles chosen yet, so the section renders nothing.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tiles.map((tile, index) => (
        <li
          key={tile.id}
          className="flex flex-wrap items-end gap-3 rounded-lg border p-3"
          style={{ borderColor: ADMIN_COLORS.surfaceLight }}
        >
          <div className="w-36">
            <AdminField label="Source">
              <AdminSelect
                value={tile.source}
                onChange={(e) => {
                  const next = [...tiles];
                  next[index] = {
                    ...tile,
                    source: e.target.value as CategoryTileConfig["source"],
                  };
                  onChange(next);
                }}
              >
                <option value="category">Category</option>
                <option value="subcategory">Subcategory</option>
              </AdminSelect>
            </AdminField>
          </div>

          <div className="min-w-[12rem] flex-1">
            <AdminField
              label="Value"
              hint={
                tile.source === "subcategory"
                  ? 'Written as "Men > Gold watch".'
                  : 'The category name, e.g. "Men".'
              }
            >
              <AdminInput
                value={tile.value}
                onChange={(e) => {
                  const next = [...tiles];
                  next[index] = { ...tile, value: e.target.value };
                  onChange(next);
                }}
              />
            </AdminField>
          </div>

          <div className="min-w-[9rem] flex-1">
            <AdminField label="Label" hint="Optional. Defaults to the category name.">
              <AdminInput
                value={tile.label ?? ""}
                onChange={(e) => {
                  const next = [...tiles];
                  next[index] = { ...tile, label: e.target.value };
                  onChange(next);
                }}
              />
            </AdminField>
          </div>

          <AdminToggle
            checked={tile.enabled}
            onChange={(value) => {
              const next = [...tiles];
              next[index] = { ...tile, enabled: value };
              onChange(next);
            }}
            label="Shown"
          />

          <RowActions
            onUp={() => onChange(reorder(tiles, index, index - 1))}
            onDown={() => onChange(reorder(tiles, index, index + 1))}
            onRemove={() => onChange(tiles.filter((_, i) => i !== index))}
            disableUp={index === 0}
            disableDown={index === tiles.length - 1}
          />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Product rails                                                       */
/* ------------------------------------------------------------------ */

const RAIL_SOURCES: { value: ProductRail["source"]; label: string; needsValue: boolean }[] = [
  { value: "latest", label: "Latest arrivals", needsValue: false },
  { value: "featured", label: "Featured", needsValue: false },
  { value: "bestseller", label: "Bestsellers", needsValue: false },
  { value: "newArrival", label: "Marked new", needsValue: false },
  { value: "category", label: "A category", needsValue: true },
  { value: "subcategory", label: "A subcategory", needsValue: true },
  { value: "collection", label: "A collection", needsValue: true },
];

function RailsTab({
  content,
  onChange,
}: {
  content: StorefrontContent;
  onChange: (next: StorefrontContent) => void;
}) {
  const rails = content.rails;

  function set(next: ProductRail[]) {
    onChange({
      ...content,
      rails: next.map((rail, index) => ({ ...rail, position: index + 1 })),
    });
  }

  return (
    <AdminCard
      title="Product rails"
      description="The rows of products on the homepage. Each names a rule — never a fixed list of products — so a rail keeps showing the right thing as stock changes."
      action={
        <AdminButton
          onClick={() =>
            set([
              ...rails,
              {
                id: `rail-${Date.now()}`,
                enabled: true,
                position: rails.length + 1,
                eyebrow: "",
                title: "New rail",
                source: "latest",
                value: "",
                limit: 8,
                filterable: false,
                tone: "default",
                viewAll: { label: "View all", href: "/shop" },
              },
            ])
          }
        >
          Add rail
        </AdminButton>
      }
    >
      {rails.length === 0 ? (
        <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
          No rails, so the homepage shows no product rows.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rails.map((rail, index) => {
            const source = RAIL_SOURCES.find((s) => s.value === rail.source);
            return (
              <li
                key={rail.id}
                className="rounded-lg border p-4"
                style={{ borderColor: ADMIN_COLORS.surfaceLight }}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <AdminToggle
                    checked={rail.enabled}
                    onChange={(value) => {
                      const next = [...rails];
                      next[index] = { ...rail, enabled: value };
                      set(next);
                    }}
                    label="Shown"
                  />
                  <RowActions
                    onUp={() => set(reorder(rails, index, index - 1))}
                    onDown={() => set(reorder(rails, index, index + 1))}
                    onRemove={() => set(rails.filter((_, i) => i !== index))}
                    disableUp={index === 0}
                    disableDown={index === rails.length - 1}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminField label="Eyebrow">
                    <AdminInput
                      value={rail.eyebrow ?? ""}
                      onChange={(e) => {
                        const next = [...rails];
                        next[index] = { ...rail, eyebrow: e.target.value };
                        set(next);
                      }}
                    />
                  </AdminField>

                  <AdminField label="Title">
                    <AdminInput
                      value={rail.title ?? ""}
                      onChange={(e) => {
                        const next = [...rails];
                        next[index] = { ...rail, title: e.target.value };
                        set(next);
                      }}
                    />
                  </AdminField>

                  <AdminField label="Shows">
                    <AdminSelect
                      value={rail.source}
                      onChange={(e) => {
                        const next = [...rails];
                        next[index] = {
                          ...rail,
                          source: e.target.value as ProductRail["source"],
                        };
                        set(next);
                      }}
                    >
                      {RAIL_SOURCES.map((entry) => (
                        <option key={entry.value} value={entry.value}>
                          {entry.label}
                        </option>
                      ))}
                    </AdminSelect>
                  </AdminField>

                  {source?.needsValue ? (
                    <AdminField
                      label="Which one"
                      hint={
                        rail.source === "subcategory"
                          ? 'Written as "Men > Gold watch".'
                          : undefined
                      }
                    >
                      <AdminInput
                        value={rail.value ?? ""}
                        onChange={(e) => {
                          const next = [...rails];
                          next[index] = { ...rail, value: e.target.value };
                          set(next);
                        }}
                      />
                    </AdminField>
                  ) : (
                    <AdminField label="How many">
                      <AdminInput
                        type="number"
                        min={1}
                        max={24}
                        value={rail.limit ?? 8}
                        onChange={(e) => {
                          const next = [...rails];
                          next[index] = {
                            ...rail,
                            limit: Number(e.target.value) || 8,
                          };
                          set(next);
                        }}
                      />
                    </AdminField>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
