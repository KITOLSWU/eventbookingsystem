import { useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../context/AppStore";
import { defaultEventImage } from "../data/events";
import { Badge, Card, EmptyState, IconButton, StatTile } from "../components/ui";
import { BottomTabBar, TAB_BAR_HEIGHT } from "../components/BottomTabBar";
import { TopBar } from "../components/TopBar";
import { colors, fontSize, fonts, radius, shadow, spacing } from "../constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, events, logout, fetchEvents } = useAppStore();
  const activeTab = "home";

  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredEvents = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return events;

    return events.filter((event) =>
      [event.title, event.category, event.city, event.venue]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [query, events]);

  const totalSeats = events.reduce((sum, event) => sum + (event.capacity || 0), 0);
  const totalRegistered = events.reduce((sum, event) => sum + (event.registered || 0), 0);
  const seatsLeft = Math.max(totalSeats - totalRegistered, 0);

  const handleLogout = () => {
    Alert.alert("Log out?", "You will need to log in again to book tickets.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/details");
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchEvents();
    } finally {
      setRefreshing(false);
    }
  };

  const initial = (currentUser?.username || "G").trim().charAt(0).toUpperCase();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <TopBar
          title="EventBooking"
          subtitle={`Welcome back, ${currentUser?.username || "Guest"}`}
          right={
            <IconButton
              icon="log-out-outline"
              color={colors.danger}
              backgroundColor={colors.dangerSoft}
              accessibilityLabel="Log out"
              onPress={handleLogout}
            />
          }
        />

        <View style={styles.heading}>
          <Text style={styles.title}>Find your next event</Text>
          <Text style={styles.subtitle}>
            Discover what is happening around you and grab your seat.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search events, venues or cities"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={10}
              onPress={() => setQuery("")}
            >
              <Ionicons name="close-circle" size={19} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <StatTile icon="people-outline" label="Registrations" value={totalRegistered} tone="primary" />
          <StatTile icon="ticket-outline" label="Seats left" value={seatsLeft} tone="success" />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open booking history"
          onPress={() => router.push("/history")}
          style={({ pressed }) => [styles.historyCard, pressed && styles.pressed]}
        >
          <View style={styles.historyIcon}>
            <Ionicons name="receipt-outline" size={22} color={colors.white} />
          </View>
          <View style={styles.historyText}>
            <Text style={styles.historyTitle}>My tickets</Text>
            <Text style={styles.historySubtitle}>View bookings and QR tickets</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} numberOfLines={1}>Upcoming events</Text>
          <Badge label={`${filteredEvents.length} found`} tone="primary" />
        </View>

        {filteredEvents.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No events found"
            message={
              query
                ? `Nothing matches “${query.trim()}”. Try a different name, venue or city.`
                : "New events will appear here as soon as the organizer publishes them."
            }
            actionLabel={query ? "Clear search" : undefined}
            onAction={query ? () => setQuery("") : undefined}
          />
        ) : (
          <View style={styles.list}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() =>
                  router.push({ pathname: "/event-details", params: { id: event.id } })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
      <BottomTabBar activeTab={activeTab} />
    </View>
  );
}

function EventCard({ event, onPress }) {
  const capacity = event.capacity || 0;
  const registered = Math.min(event.registered || 0, capacity);
  const seatsLeft = Math.max(capacity - registered, 0);
  const progress = capacity > 0 ? registered / capacity : 0;
  const imageSource =
    typeof event.image === "string" && event.image.length > 0
      ? { uri: event.image }
      : event.image || defaultEventImage;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.date} at ${event.city}`}
      onPress={onPress}
      style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}
    >
      <ImageBackground source={imageSource} resizeMode="cover" style={styles.eventImage}>
        <View style={styles.imageScrim} />
        <View style={styles.imageTopRow}>
          <Badge label={event.category || "General"} tone="primary" style={styles.imageBadge} />
          <Badge label={event.price || "Free"} tone="neutral" style={styles.imageBadge} />
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
      </ImageBackground>

      <View style={styles.eventBody}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
          <Text style={styles.metaText}>
            {event.date} · {event.time}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.venue}, {event.city}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
        </View>

        <View style={styles.eventFooter}>
          <Text style={styles.seatsText}>
            {seatsLeft > 0 ? `${seatsLeft} seats left` : "Sold out"}
          </Text>
          <View style={styles.detailsLink}>
            <Text style={styles.detailsText}>Details</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.body,
    paddingVertical: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.dark,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  historyText: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    color: colors.white,
    fontSize: fontSize.subheading,
    fontWeight: "900",
  },
  historySubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: fontSize.small,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    flex: 1,
    flexShrink: 1,
    color: colors.text,
    fontSize: fontSize.heading,
    fontFamily: fonts.display,
    fontWeight: "700",
  },
  list: {
    gap: spacing.lg,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.card,
  },
  eventImage: {
    height: 168,
    justifyContent: "flex-end",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,10,20,0.35)",
  },
  imageTopRow: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  imageBadge: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  eventTitle: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "700",
  },
  eventBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: fontSize.small,
    flex: 1,
  },
  progressTrack: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  eventFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  seatsText: {
    color: colors.text,
    fontSize: fontSize.small,
    fontWeight: "800",
  },
  detailsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailsText: {
    color: colors.primary,
    fontSize: fontSize.small,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});
