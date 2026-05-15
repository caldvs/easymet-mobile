// Sample mobile screens built end-to-end with the soft-UI kit. Each story
// renders inside a 402×874 device frame (the same one preview.tsx uses
// for the existing Pages stories), so the layouts read as real mobile
// screens rather than fragments on a desk.

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BackdropOrbs } from "../BackdropOrbs";
import { Avatar } from "./Avatar";
import { AvatarGroup } from "./AvatarGroup";
import { Banner } from "./Banner";
import { BottomTabBar } from "./BottomTabBar";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { FilterChip } from "./FilterChip";
import { Sparkles } from "./GradientButton";
import { ListRow, ListRowGroup } from "./ListRow";
import { Pill } from "./Pill";
import { Progress } from "./Progress";
import { SearchPill } from "./SearchPill";
import { SegmentedControl } from "./SegmentedControl";
import { SoftCard } from "./SoftCard";
import { SoftIcon } from "./SoftIcon";
import { StatusBadge } from "./StatusBadge";
import { Switch } from "./Switch";
import { TextField } from "./TextField";
import { soft } from "./tokens";

const DEVICE_W = 402;
const DEVICE_H = 874;

// Device-frame wrapper for every sample page. Renders the animated
// `BackdropOrbs` from the main app behind the soft-UI content so the
// pages share the canvas vibe of the production app. Orbs are positioned
// absolute and `pointerEvents="none"`, so they don't block touches.
//
// The lavender bg colour matches `lib/theme.ts` lightColours.bg — picked
// specifically because the orbs read warmest on a slight indigo cast.
const PHONE_BG = "#F4F4FB";

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        width: DEVICE_W,
        height: DEVICE_H,
        backgroundColor: PHONE_BG,
        overflow: "hidden",
        borderRadius: 28,
        ...soft.shadow.chassis,
      }}
    >
      <BackdropOrbs />
      {children}
    </View>
  );
}

const meta: Meta = {
  title: "Soft UI/Sample pages",
  parameters: { softKit: true },
};
export default meta;
type Story = StoryObj;

// ---- 1. Sign-in -------------------------------------------------------
export const SignIn: Story = {
  name: "Sign in",
  render: () => {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [remember, setRemember] = useState(true);
    const [showError, setShowError] = useState(false);

    const emailError =
      showError && !email.includes("@") ? "Check your email address" : undefined;

    return (
      <Phone>
        <View style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24, gap: 24 }}>
          <View style={{ gap: 6 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: soft.surface,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                ...soft.shadow.pill,
              }}
            >
              <Sparkles color={soft.accent} size={20} />
            </View>
            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.text,
                fontSize: 28,
                fontWeight: "700",
                letterSpacing: -0.5,
              }}
            >
              Welcome back
            </Text>
            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.textMuted,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Sign in to pick up where you left off.
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <TextField
              label="Email"
              placeholder="you@example.com"
              leadingIcon="mail"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextField
              label="Password"
              placeholder="••••••••"
              leadingIcon="lock"
              value={pw}
              onChangeText={setPw}
              secure
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Checkbox value={remember} onChange={setRemember} label="Remember me" />
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.accent,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Forgot?
              </Text>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <Button
              label="Sign in"
              size="lg"
              fullWidth
              onPress={() => setShowError(!email.includes("@"))}
            />
            <Button
              label="Continue with Ask AI"
              gradient="askAI"
              leading={<Sparkles />}
              size="lg"
              fullWidth
            />
          </View>

          <View style={{ marginTop: "auto", paddingBottom: 32, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.textMuted,
                fontSize: 14,
              }}
            >
              New here?{" "}
              <Text style={{ color: soft.accent, fontWeight: "700" }}>Create account</Text>
            </Text>
          </View>
        </View>
      </Phone>
    );
  },
};

// ---- 2. Discover feed -------------------------------------------------
export const Discover: Story = {
  name: "Discover",
  render: () => {
    const [filter, setFilter] = useState<"trending" | "new" | "near">("trending");
    const [pinned, setPinned] = useState(new Set(["b"]));

    const items = useMemo(
      () => [
        {
          id: "a",
          title: "Inside the Soft UI movement",
          author: "Mira J.",
          read: "6 min read",
          tone: "accent" as const,
          tag: "Design",
        },
        {
          id: "b",
          title: "Why your design system should ship colour tokens",
          author: "Callum D.",
          read: "9 min read",
          tone: "success" as const,
          tag: "Tokens",
        },
        {
          id: "c",
          title: "Tooltips, kbd hints, and the death of the menu bar",
          author: "Ella M.",
          read: "12 min read",
          tone: "warning" as const,
          tag: "Editors",
        },
      ],
      [],
    );

    const togglePin = (id: string) =>
      setPinned((s) => {
        const next = new Set(s);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

    return (
      <Phone>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 96 }}>
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.text,
                  fontSize: 28,
                  fontWeight: "700",
                  letterSpacing: -0.5,
                }}
              >
                Discover
              </Text>
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.textMuted,
                  fontSize: 14,
                }}
              >
                Fresh reads, picked for you.
              </Text>
            </View>

            <SearchPill placeholder="Search articles" width={DEVICE_W - 40} />

            <SegmentedControl
              fullWidth
              value={filter}
              onChange={setFilter}
              options={[
                { value: "trending", label: "Trending" },
                { value: "new", label: "New" },
                { value: "near", label: "Near you" },
              ]}
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <FilterChip label="Tags" count={3} onClear={() => {}} />
              <FilterChip label="Authors" />
            </View>

            <View style={{ gap: 12 }}>
              {items.map((it) => (
                <SoftCard
                  key={it.id}
                  onPress={() => {}}
                  headerTrailing={
                    <SoftIcon
                      name={pinned.has(it.id) ? "star" : "star"}
                      size={18}
                      color={pinned.has(it.id) ? soft.tone.warning.fg : soft.textFaint}
                      filled={pinned.has(it.id)}
                    />
                  }
                >
                  <Pill label={it.tag} tone={it.tone} style={{ marginBottom: 8 }} />
                  <Text
                    style={{
                      fontFamily: soft.font.family,
                      color: soft.text,
                      fontSize: 17,
                      fontWeight: "700",
                      letterSpacing: -0.2,
                      lineHeight: 24,
                    }}
                  >
                    {it.title}
                  </Text>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Avatar size="xs" name={it.author} />
                    <Text
                      style={{
                        fontFamily: soft.font.family,
                        color: soft.textMuted,
                        fontSize: 13,
                        flex: 1,
                      }}
                    >
                      {it.author} · {it.read}
                    </Text>
                    <Pill
                      label="Save"
                      tone="neutral"
                      variant="outline"
                      leadingIcon="heart"
                      onPress={() => togglePin(it.id)}
                    />
                  </View>
                </SoftCard>
              ))}
            </View>
          </ScrollView>

          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
            <BottomTabBar
              tabs={[
                { id: "home", label: "Home", icon: "home" },
                { id: "discover", label: "Discover", icon: "search", badge: 3 },
                { id: "chats", label: "Chats", icon: "chat" },
                { id: "profile", label: "Profile", icon: "user" },
              ]}
              active="discover"
            />
          </View>
        </View>
      </Phone>
    );
  },
};

// ---- 3. Settings ------------------------------------------------------
export const Settings: Story = {
  name: "Settings",
  render: () => {
    const [push, setPush] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [appearance, setAppearance] = useState<"system" | "light" | "dark">("system");

    return (
      <Phone>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 96 }}>
            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.text,
                fontSize: 28,
                fontWeight: "700",
                letterSpacing: -0.5,
              }}
            >
              Settings
            </Text>

            <Banner
              tone="warning"
              title="Verify your email"
              description="We sent a link to dvscllm@gmail.com."
              action="Resend"
            />

            {/* Account */}
            <SectionLabel>Account</SectionLabel>
            <ListRowGroup>
              <ListRow
                leading={<Avatar size="md" initials="C" status="online" />}
                title="Callum Davies"
                subtitle="dvscllm@gmail.com"
                onPress={() => {}}
              />
              <ListRow leadingIcon="lock" title="Sign-in & security" onPress={() => {}} />
              <ListRow leadingIcon="user" title="Profile" onPress={() => {}} />
            </ListRowGroup>

            <SectionLabel>Notifications</SectionLabel>
            <ListRowGroup>
              <ListRow
                leadingIcon="bell"
                title="Push notifications"
                trailing={<Switch value={push} onChange={setPush} />}
                showChevron={false}
              />
              <ListRow
                leadingIcon="mail"
                title="Marketing emails"
                subtitle="News, tips, and updates"
                trailing={<Switch value={marketing} onChange={setMarketing} />}
                showChevron={false}
              />
            </ListRowGroup>

            <SectionLabel>Appearance</SectionLabel>
            <View
              style={[
                {
                  backgroundColor: soft.surface,
                  borderRadius: soft.radii.card,
                  padding: 12,
                },
                soft.shadow.pill,
              ]}
            >
              <SegmentedControl
                fullWidth
                value={appearance}
                onChange={setAppearance}
                options={[
                  { value: "system", label: "System" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />
            </View>

            <SectionLabel>Storage</SectionLabel>
            <SoftCard>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontFamily: soft.font.family, color: soft.text, fontWeight: "600" }}>
                  4.2 GB of 5 GB used
                </Text>
                <Text style={{ fontFamily: soft.font.family, color: soft.textMuted, fontWeight: "500" }}>
                  84%
                </Text>
              </View>
              <Progress value={0.84} tone="warning" />
              <View style={{ marginTop: 14, flexDirection: "row", gap: 8 }}>
                <Button label="Clear cache" variant="soft" tone="neutral" size="sm" />
                <Button label="Upgrade" gradient="bookCall" size="sm" />
              </View>
            </SoftCard>

            <SectionLabel>Danger zone</SectionLabel>
            <ListRowGroup>
              <ListRow leadingIcon="trash" title="Delete account" onPress={() => {}} />
            </ListRowGroup>
          </ScrollView>

          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
            <BottomTabBar
              tabs={[
                { id: "home", label: "Home", icon: "home" },
                { id: "discover", label: "Discover", icon: "search" },
                { id: "chats", label: "Chats", icon: "chat" },
                { id: "profile", label: "Profile", icon: "settings" },
              ]}
              active="profile"
            />
          </View>
        </View>
      </Phone>
    );
  },
};

// ---- 4. Profile ------------------------------------------------------
export const Profile: Story = {
  name: "Profile",
  render: () => (
    <Phone>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 96 }}>
          {/* Hero */}
          <View style={{ alignItems: "center", paddingHorizontal: 24, gap: 12 }}>
            <Avatar size="xl" name="Callum Davies" status="online" />
            <View style={{ alignItems: "center", gap: 4 }}>
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.text,
                  fontSize: 22,
                  fontWeight: "700",
                  letterSpacing: -0.3,
                }}
              >
                Callum Davies
              </Text>
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.textMuted,
                  fontSize: 14,
                }}
              >
                Designer · Manchester, UK
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <Pill label="Pro" tone="accent" leadingIcon="sparkle" />
              <Pill label="Verified" tone="success" leadingIcon="check" />
              <StatusBadge kind="online" label="Online" />
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <Button label="Follow" size="md" />
              <Button label="Message" variant="soft" size="md" leading={<SoftIcon name="chat" size={16} color={soft.accent} />} />
            </View>
          </View>

          {/* Stats card */}
          <View style={{ padding: 20, gap: 16 }}>
            <SoftCard padding={0}>
              <View style={{ flexDirection: "row" }}>
                <Stat label="Posts" value="128" />
                <Divider />
                <Stat label="Followers" value="4.2k" />
                <Divider />
                <Stat label="Following" value="312" />
              </View>
            </SoftCard>

            {/* Shared with */}
            <SoftCard title="Working on" subtitle="Design system migration">
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.textMuted,
                  fontSize: 14,
                  lineHeight: 22,
                  marginBottom: 12,
                }}
              >
                Moving EasyMet's chrome to the new soft language. Bottom sheets and
                empty states first, then the rows.
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
              >
                <AvatarGroup
                  people={[
                    { name: "Ella M." },
                    { name: "Sam P." },
                    { name: "Kim T." },
                    { name: "Riley J." },
                    { name: "Jordan B." },
                  ]}
                  size="sm"
                  max={4}
                />
                <Pill label="3 days left" tone="warning" leadingIcon="clock" />
              </View>
            </SoftCard>

            {/* Activity */}
            <SectionLabel>Activity</SectionLabel>
            <ListRowGroup>
              <ListRow
                leadingIcon="heart"
                title="Liked Mira's post"
                subtitle="2h ago"
                onPress={() => {}}
              />
              <ListRow
                leadingIcon="chat"
                title="Replied to Sam"
                subtitle="Yesterday"
                onPress={() => {}}
              />
              <ListRow
                leadingIcon="star"
                title="Saved 'Soft UI tokens'"
                subtitle="2 days ago"
                onPress={() => {}}
              />
            </ListRowGroup>
          </View>
        </ScrollView>

        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <BottomTabBar
            tabs={[
              { id: "home", label: "Home", icon: "home" },
              { id: "discover", label: "Discover", icon: "search" },
              { id: "chats", label: "Chats", icon: "chat", badge: 12 },
              { id: "profile", label: "Profile", icon: "user" },
            ]}
            active="profile"
          />
        </View>
      </View>
    </Phone>
  ),
};

// ---- Small helpers ----------------------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: soft.font.family,
        color: soft.textMuted,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: 4,
        marginLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, paddingVertical: 14, alignItems: "center" }}>
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.textMuted,
          fontSize: 12,
          fontWeight: "500",
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, backgroundColor: soft.divider, marginVertical: 12 }} />;
}
