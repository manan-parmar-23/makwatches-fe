/**
 * The MAK Watches design system.
 *
 * Import primitives from `@/design-system`. Every visual decision -- color,
 * type scale, spacing, rule weight, easing -- lives in
 * `src/styles/mak-design-system.css` and is consumed here through Tailwind
 * tokens. Components must not hardcode a hex value or a raw px size.
 */

// Layout
export {
  Container,
  Section,
  Divider,
  RuleGrid,
  RuleGridCell,
  type ContainerProps,
  type SectionProps,
  type DividerProps,
  type RuleGridProps,
} from "./primitives/layout";

// Typography
export {
  Heading,
  Eyebrow,
  Text,
  SectionHeader,
  type HeadingProps,
  type EyebrowProps,
  type TextProps,
  type SectionHeaderProps,
} from "./primitives/typography";

// Actions
export {
  Button,
  ButtonLink,
  IconButton,
  type ButtonProps,
  type ButtonLinkProps,
  type IconButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./primitives/button";

// Display
export {
  Badge,
  Tag,
  Price,
  formatPrice,
  type BadgeProps,
  type TagProps,
  type PriceProps,
} from "./primitives/display";

// States
export {
  Skeleton,
  ProductCardSkeleton,
  LoadingState,
  EmptyState,
  ErrorState,
  type SkeletonProps,
  type LoadingStateProps,
  type EmptyStateProps,
  type ErrorStateProps,
} from "./primitives/states";

// Forms
export {
  Field,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioCards,
  type FieldProps,
  type InputProps,
  type TextareaProps,
  type SelectProps,
  type CheckboxProps,
  type RadioCardsProps,
  type RadioCardOption,
} from "./primitives/form";

// Overlays
export { Drawer, type DrawerProps } from "./primitives/drawer";
export { Modal, type ModalProps } from "./primitives/modal";
export {
  Breadcrumbs,
  type BreadcrumbsProps,
  type Crumb,
} from "./primitives/breadcrumbs";
export {
  Pagination,
  paginationRange,
  type PaginationProps,
} from "./primitives/pagination";

// Disclosure
export {
  Accordion,
  Tabs,
  type AccordionProps,
  type AccordionItem,
  type TabsProps,
  type TabItem,
} from "./primitives/disclosure";

// Feedback
export {
  ToastProvider,
  useToast,
  Tooltip,
  type Toast,
  type ToastTone,
  type TooltipProps,
} from "./primitives/feedback";

// Motion
export {
  Reveal,
  Marquee,
  Parallax,
  StickyScroller,
  type RevealProps,
  type MarqueeProps,
  type ParallaxProps,
  type StickyScrollerProps,
  type StickyScrollerPanel,
} from "./motion";

// Hooks
export {
  usePrefersReducedMotion,
  useScrollLock,
  useEscapeKey,
  useFocusTrap,
  useMounted,
  useDebouncedValue,
  useMediaQuery,
  useInViewOnce,
  useDisclosure,
} from "./hooks";

// Icons
export * from "./icons";
