// Tier 2 atoms — async + feedback. Stateful demos so each control's
// behaviour is visible in the preview.

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Banner } from "./Banner";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ListRow, ListRowGroup } from "./ListRow";
import { Progress } from "./Progress";
import { Skeleton, SkeletonParagraph } from "./Skeleton";
import { SoftCard } from "./SoftCard";
import { Spinner } from "./Spinner";
import { ToastProvider, useToast } from "./Toast";
import { soft } from "./tokens";

const Padded = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      padding: 32,
      backgroundColor: soft.canvas,
      alignItems: "flex-start",
      minHeight: 400,
      gap: 16,
    }}
  >
    {children}
  </View>
);

const meta: Meta = {
  title: "Soft UI/Tier 2",
  parameters: { softKit: true },
  decorators: [(Story) => <Padded><Story /></Padded>],
};
export default meta;
type Story = StoryObj;

// Banner — every tone + a dismissable example.
export const BannerStory: Story = {
  name: "Banner",
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <View style={{ gap: 12, alignSelf: "stretch", maxWidth: 520 }}>
        <Banner
          tone="success"
          title="Backup completed"
          description="Latest snapshot is ready in your account."
        />
        <Banner
          tone="warning"
          title="Storage almost full"
          description="You've used 92% of your 50 GB plan."
          action="Upgrade"
        />
        <Banner
          tone="danger"
          title="Couldn't sync"
          description="The connection timed out. We'll try again in a moment."
          action="Retry"
        />
        {show && (
          <Banner
            tone="accent"
            title="New release · 2026.05"
            description="Read the changelog to see what's new."
            onDismiss={() => setShow(false)}
          />
        )}
      </View>
    );
  },
};

// Toast — fires from a button. Provider lives at story root.
export const ToastStory: Story = {
  name: "Toast (provider + hook)",
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

function ToastDemo() {
  const { show } = useToast();
  return (
    <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
      <Button
        label="Default"
        variant="soft"
        onPress={() => show({ title: "Saved", description: "Your draft is safe" })}
      />
      <Button
        label="Success"
        tone="success"
        variant="soft"
        onPress={() => show({ tone: "success", title: "Order placed", description: "We'll email a receipt." })}
      />
      <Button
        label="Warning"
        tone="warning"
        variant="soft"
        onPress={() => show({ tone: "warning", title: "Low battery", duration: 5000 })}
      />
      <Button
        label="Danger"
        tone="danger"
        variant="soft"
        onPress={() => show({ tone: "danger", title: "Couldn't connect", description: "Check your network." })}
      />
    </View>
  );
}

// Skeleton — composite + Card swap.
export const SkeletonStory: Story = {
  name: "Skeleton",
  render: () => {
    const [loading, setLoading] = useState(true);
    return (
      <View style={{ gap: 16, alignSelf: "stretch", maxWidth: 420 }}>
        <Button
          label={loading ? "Show content" : "Show skeleton"}
          variant="soft"
          onPress={() => setLoading((v) => !v)}
        />
        <SoftCard>
          {loading ? (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <Skeleton width={36} height={36} radius={18} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="60%" height={12} radius={6} />
                  <Skeleton width="40%" height={10} radius={5} />
                </View>
              </View>
              <SkeletonParagraph lines={3} />
            </View>
          ) : (
            <View>
              <Text style={{ fontFamily: soft.font.family, fontSize: 15, fontWeight: "700", color: soft.text }}>
                Loaded
              </Text>
              <Text
                style={{ fontFamily: soft.font.family, color: soft.textMuted, fontSize: 14, lineHeight: 22, marginTop: 6 }}
              >
                Real content swaps in once the network request finishes. The
                skeleton's pulse should fade out cleanly.
              </Text>
            </View>
          )}
        </SoftCard>
      </View>
    );
  },
};

// Spinner — three sizes.
export const SpinnerStory: Story = {
  name: "Spinner",
  render: () => (
    <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
      <Spinner size={16} />
      <Spinner size={24} thickness={2.5} />
      <Spinner size={36} thickness={3} color={soft.tone.success.fg} />
    </View>
  ),
};

// Progress — determinate (incrementing) + indeterminate.
export const ProgressStory: Story = {
  name: "Progress",
  render: () => {
    const [v, setV] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setV((x) => (x >= 1 ? 0 : x + 0.05)), 350);
      return () => clearInterval(id);
    }, []);
    return (
      <View style={{ gap: 16, alignSelf: "stretch", maxWidth: 360 }}>
        <Progress value={v} />
        <Progress value={v} tone="success" />
        <Progress />
      </View>
    );
  },
};

// EmptyState — primary illustration + CTA.
export const EmptyStateStory: Story = {
  name: "EmptyState",
  render: () => {
    const [acted, setActed] = useState(0);
    return (
      <View style={{ gap: 8, alignSelf: "stretch", maxWidth: 480 }}>
        <EmptyState
          icon="search"
          title="No matches"
          description="Try a different keyword, or remove a filter to broaden the search."
          actionLabel="Clear filters"
          onActionPress={() => setActed((n) => n + 1)}
        />
        <Text style={{ alignSelf: "center", color: soft.textMuted, fontSize: 13 }}>
          Cleared {acted}×
        </Text>
      </View>
    );
  },
};

// ListRow — inset-grouped iOS style. Last row has a switch in the
// trailing slot to show the slot is generic.
export const ListRowStory: Story = {
  name: "ListRow",
  render: () => {
    const [push, setPush] = useState(true);
    return (
      <View style={{ alignSelf: "stretch", maxWidth: 420, gap: 16 }}>
        <ListRowGroup>
          <ListRow
            leadingIcon="info"
            title="About"
            subtitle="Version 2026.05"
            onPress={() => {}}
          />
          <ListRow
            leadingIcon="heart"
            title="Liked items"
            subtitle="38 saved"
            onPress={() => {}}
          />
          <ListRow
            leadingIcon="trash"
            title="Clear cache"
            subtitle="Free up storage"
            onPress={() => {}}
          />
        </ListRowGroup>
        <ListRowGroup>
          <ListRow
            leadingIcon="warning"
            title="Push notifications"
            trailing={
              <View
                style={{
                  // Inline Switch lives in a sibling story; keep this row's
                  // trailing slot simple — a coloured dot tells the same
                  // story without crossing imports.
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text style={{ color: push ? soft.accent : soft.textFaint, fontWeight: "700" }}>
                  {push ? "On" : "Off"}
                </Text>
              </View>
            }
            onPress={() => setPush((v) => !v)}
            showChevron={false}
          />
          <ListRow
            leadingIcon="calendar"
            title="Calendar sync"
            subtitle="Connected to Google"
            onPress={() => {}}
          />
        </ListRowGroup>
      </View>
    );
  },
};
