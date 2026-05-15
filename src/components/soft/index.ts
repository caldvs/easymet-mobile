// Public surface of the soft-UI kit. Atoms grouped by tier so consumers
// can pick the slice they need.

// Foundation
export { SoftIcon, type IconName } from "./SoftIcon";
export { SoftMenu, useMenuState, type MenuOption } from "./SoftMenu";
export { SoftPill } from "./SoftPill";
export { minTouch, pressFeedback, withPressFeedback } from "./interaction";
export {
  soft,
  type GradientKind,
  type StatusKind,
  type Tone,
} from "./tokens";

// Tier 1 — universal app atoms
export { Avatar, type AvatarSize, type AvatarStatus } from "./Avatar";
export { Button, type ButtonSize, type ButtonVariant } from "./Button";
export { Checkbox } from "./Checkbox";
export { RadioGroup, RadioOption } from "./Radio";
export { SegmentedControl, type SegmentOption } from "./SegmentedControl";
export { SoftCard } from "./SoftCard";
export { SoftModal } from "./Modal";
export { Switch } from "./Switch";
export { TextField, type TextFieldProps } from "./TextField";

// Tier 2 — async + feedback
export { Banner } from "./Banner";
export { EmptyState } from "./EmptyState";
export { ListRow, ListRowGroup } from "./ListRow";
export { Progress } from "./Progress";
export { Skeleton, SkeletonParagraph } from "./Skeleton";
export { Spinner } from "./Spinner";
export { ToastProvider, useToast } from "./Toast";

// Gap-fillers (post-audit) — used by the EasyMet migration.
export { BottomTabBar, type BottomTab } from "./BottomTabBar";
export { Pill } from "./Pill";
export { Refreshable } from "./Refreshable";

// Tier 3 — specialised
export { Accordion } from "./Accordion";
export { AvatarGroup } from "./AvatarGroup";
export { DatePicker } from "./DatePicker";
export { Slider } from "./Slider";
export { Tabs } from "./Tabs";

// Pre-existing atoms (kept for backwards-compat; some are now niche)
export { DashedPill } from "./DashedPill";
export { FilterChip } from "./FilterChip";
export { GradientButton, Sparkles } from "./GradientButton";
export { IconToggle } from "./IconToggle";
export { SearchPill } from "./SearchPill";
export { StatusBadge } from "./StatusBadge";
export { StatusPill } from "./StatusPill";
export { Stepper } from "./Stepper";
export {
  AlignSegmented,
  ColourSwatch,
  Toolbar,
  ToolbarDropdown,
  ToolbarGroup,
  type AlignValue,
} from "./Toolbar";
export { Tooltip } from "./Tooltip";
export { UserChip } from "./UserChip";
