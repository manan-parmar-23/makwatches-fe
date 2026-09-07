"use client";

import { useState } from "react";

import {
  Accordion,
  Button,
  Drawer,
  Modal,
  Tabs,
  Text,
  Tooltip,
  useToast,
  Checkbox,
  Field,
  Input,
  RadioCards,
  Select,
  Textarea,
} from "@/design-system";
import {
  CategoryChips,
  FilterSheet,
  FilterSidebar,
  QuickView,
  SearchSuggestions,
  SortSelect,
  type FilterSelection,
  type SortValue,
} from "@/components/commerce";

import { GallerySection, Specimen } from "./GallerySection";
import {
  SAMPLE_EMPTY_SEARCH,
  SAMPLE_FILTERS,
  SAMPLE_PRODUCT,
  SAMPLE_SEARCH_RESULT,
} from "./demo-data";

/**
 * The interactive half of the gallery.
 *
 * Split into its own client component so the gallery page itself can stay a
 * server component and only this subtree ships as JavaScript.
 */
export function InteractiveGallery() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [chip, setChip] = useState("all");
  const [sort, setSort] = useState<SortValue>("featured");
  const [selection, setSelection] = useState<FilterSelection>({});

  const [checked, setChecked] = useState(true);
  const [payment, setPayment] = useState<"razorpay" | "cod">("razorpay");

  const { toast } = useToast();

  return (
    <>
      <GallerySection
        id="forms"
        title="Form controls"
        note="The error state belongs to the primitive, not to each form: Field renders the message, ties it to the control through aria-describedby and marks it invalid. Tab through these and check every control shows an accent focus ring; the radio rows are real inputs, so arrow keys move between them."
      >
        <Specimen label="Text, select and textarea">
          <div className="flex max-w-[420px] flex-col gap-5">
            <Field label="Recipient" required>
              <Input placeholder="Full name" />
            </Field>
            <Field label="Pincode" hint="Delivering to New Delhi, DL.">
              <Input defaultValue="110001" inputMode="numeric" />
            </Field>
            <Field label="State" required>
              <Select defaultValue="DL">
                <option value="DL">Delhi</option>
                <option value="MH">Maharashtra</option>
                <option value="KA">Karnataka</option>
              </Select>
            </Field>
            <Field label="Delivery note">
              <Textarea rows={3} placeholder="Anything the courier should know" />
            </Field>
          </div>
        </Specimen>

        <Specimen label="Error state">
          <div className="max-w-[420px]">
            <Field label="Phone" required error="Enter a phone number the courier can reach.">
              <Input defaultValue="12" type="tel" />
            </Field>
          </div>
        </Specimen>

        <Specimen label="Checkbox">
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            label="Save this address to my account"
          />
        </Specimen>

        <Specimen label="Radio cards">
          <div className="max-w-[520px]">
            <RadioCards
              legend="Payment method"
              name="gallery-payment"
              value={payment}
              onChange={setPayment}
              options={[
                {
                  value: "razorpay",
                  label: "Pay online",
                  description: "Card, UPI, netbanking or wallet.",
                },
                {
                  value: "cod",
                  label: "Cash on delivery",
                  description: "Not available for this pincode.",
                  disabled: true,
                },
              ]}
            />
          </div>
        </Specimen>
      </GallerySection>

      <GallerySection
        id="overlays"
        title="Drawers & modals"
        note="Focus is trapped while open and restored to the trigger on close; Escape dismisses; the page behind is locked. Open one and press Tab repeatedly to verify focus never escapes."
      >
        <Specimen label="Triggers">
          <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button variant="secondary" onClick={() => setQuickViewOpen(true)}>
            Open quick view
          </Button>
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            Open filter sheet
          </Button>
        </Specimen>

        <Specimen label="Toast">
          <Button variant="secondary" onClick={() => toast("A neutral message.")}>
            Default
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast("Saved successfully.", { tone: "success" })}
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast("Only 2 left, so the quantity was reduced.", {
                tone: "warning",
              })
            }
          >
            Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast("That did not work.", { tone: "error" })}
          >
            Error
          </Button>
        </Specimen>

        <Specimen label="Tooltip">
          <Tooltip label="Supplementary detail">
            <Button variant="secondary">Hover or focus me</Button>
          </Tooltip>
        </Specimen>

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Drawer"
          titleAside="specimen"
          footer={
            <Button block variant="primary" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="p-6">
            <Text size="small" tone="muted">
              Slides from the right at 450ms on the house easing. Full width
              below 430px, capped at 430px above it.
            </Text>
          </div>
        </Drawer>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Modal"
        >
          <div className="p-6">
            <Text size="small" tone="muted">
              Centred, capped at 90vh, scrolls internally. Clicking the scrim or
              pressing Escape dismisses it.
            </Text>
          </div>
        </Modal>

        <QuickView
          product={SAMPLE_PRODUCT}
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />

        <FilterSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          filters={SAMPLE_FILTERS}
          selection={selection}
          onChange={setSelection}
          onReset={() => setSelection({})}
          resultCount={4}
        />
      </GallerySection>

      <GallerySection
        id="controls"
        title="Filters, sort & chips"
        note="Chips are a radio group, so arrow keys move between them. Sort is a native select, which gets the platform picker on mobile. Filter facets come from the API, so a facet with no values never renders."
      >
        <Specimen label="Category chips">
          <CategoryChips
            options={[
              { value: "all", label: "All" },
              { value: "a", label: "Sample A", count: 4 },
              { value: "b", label: "Sample B", count: 2 },
            ]}
            value={chip}
            onChange={setChip}
          />
        </Specimen>

        <Specimen label="Sort">
          <SortSelect value={sort} onChange={setSort} className="max-w-xs" />
        </Specimen>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="border-2 border-mak-line p-6">
            <FilterSidebar
              filters={SAMPLE_FILTERS}
              selection={selection}
              onChange={setSelection}
              onReset={() => setSelection({})}
              resultCount={4}
            />
          </div>
          <div className="border-2 border-mak-divider p-6">
            <Text size="label" tone="subtle" className="mb-2">
              Current selection
            </Text>
            <pre className="overflow-x-auto text-mak-small text-mak-muted">
              {JSON.stringify(selection, null, 2)}
            </pre>
          </div>
        </div>
      </GallerySection>

      <GallerySection
        id="disclosure"
        title="Accordion & tabs"
        note="Both use native buttons with the correct ARIA wiring. Tabs use roving focus: Tab enters the list once, then Left/Right moves between tabs."
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Specimen label="Accordion">
              <div className="w-full">
                <Accordion
                  items={[
                    {
                      id: "a",
                      title: "First section",
                      content: "Panel content stays mounted but hidden, so in-page search still finds it.",
                    },
                    {
                      id: "b",
                      title: "Second section",
                      content: "Chevron rotates on the house easing.",
                    },
                  ]}
                  defaultOpen={["a"]}
                />
              </div>
            </Specimen>
          </div>

          <div>
            <Specimen label="Tabs">
              <div className="w-full">
                <Tabs
                  items={[
                    { id: "one", label: "Overview", content: <Text size="small" tone="muted">First panel.</Text> },
                    { id: "two", label: "Details", content: <Text size="small" tone="muted">Second panel.</Text> },
                    { id: "three", label: "Care", content: <Text size="small" tone="muted">Third panel.</Text> },
                  ]}
                />
              </div>
            </Specimen>
          </div>
        </div>
      </GallerySection>

      <GallerySection
        id="search"
        title="Search suggestions"
        note="Three states: nothing typed (recent searches), results grouped by kind, and no matches with a route out. The overlay itself is reachable from the header specimen above."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="border-2 border-mak-line p-6">
            <Text size="label" tone="subtle" className="mb-3">
              With results
            </Text>
            <SearchSuggestions result={SAMPLE_SEARCH_RESULT} />
          </div>
          <div className="border-2 border-mak-line p-6">
            <Text size="label" tone="subtle" className="mb-3">
              No matches
            </Text>
            <SearchSuggestions result={SAMPLE_EMPTY_SEARCH} />
          </div>
        </div>
      </GallerySection>
    </>
  );
}
