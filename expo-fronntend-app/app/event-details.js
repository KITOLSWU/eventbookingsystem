import {
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../context/AppStore";
import { defaultEventImage } from "../data/events";
import { AppButton, Badge, Card, EmptyState, IconButton } from "../components/ui";
import { colors, fontSize, fonts, radius, spacing } from "../constants/theme";

export default function EventDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { currentUser, getEventById, getBookingsForCurrentUser } = useAppStore();

  const event = getEventById(id);

  if (!event) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <StatusBar style="dark" />
        <View style={styles.notFound}>
          <IconButton
            icon="arrow-back"
            accessibilityLabel="Go back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
          />
          <EmptyState
            icon="alert-circle-outline"
            title="Event not found"
            message="This event may have been removed by the organizer."
            actionLabel="Browse events"
            onAction={() => router.replace("/home")}
          />
        </View>
      </View>
    );
  }

  const capacity = event.capacity || 0;
  const registered = Math.min(event.registered || 0, capacity);
  const seatsLeft = Math.max(capacity - registered, 0);
  const progress = capacity > 0 ? registered / capacity : 0;
  const isAdmin = currentUser?.role === "admin";
  const booking = getBookingsForCurrentUser().find((item) => item.eventId === event.id);
  const soldOut = seatsLeft <= 0;
  const imageSource =
    typeof event.image === "string" && event.image.length > 0
      ? { uri: event.image }
      : event.image || defaultEventImage;

  const primaryLabel = !currentUser
    ? "Log in to book"
    : isAdmin
    ? "Organizers can't book"
    : booking
    ? "View ticket"
    : soldOut
    ? "Sold out"
    : "Book ticket";

  const primaryDisabled = Boolean(currentUser) && (isAdmin || (soldOut && !booking));

  const handlePrimary = async () => {
    if (!currentUser) {
      router.push("/details");
      return;
    }

    if (booking) {
      router.push({ pathname: "/ticket", params: { id: event.id, bookingId: booking.id } });
      return;
    }

    if (isAdmin || soldOut) return;
    router.push({ pathname: "/payment", params: { id: event.id } });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground source={imageSource} resizeMode="cover" style={styles.hero}>
          <View style={styles.heroScrim} />

          <View style={[styles.heroTop, { paddingTop: insets.top + spacing.sm }]}>
            <IconButton
              icon="arrow-back"
              color={colors.white}
              backgroundColor="rgba(0,0,0,0.4)"
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
            />
            <Badge label={event.category || "General"} tone="primary" style={styles.heroBadge} />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.heroMeta}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroMetaText} numberOfLines={1}>
                {event.date} · {event.time}
              </Text>
            </View>
            <View style={styles.heroMeta}>
              <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroMetaText} numberOfLines={1}>
                {event.venue}, {event.city}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About this event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </Card>

          <Card style={styles.sectionCard}>
            <InfoRow icon="calendar-outline" label="Date & time" value={`${event.date}, ${event.time}`} />
            <View style={styles.divider} />
            <InfoRow icon="location-outline" label="Venue" value={`${event.venue}, ${event.city}`} />
            <View style={styles.divider} />
            <InfoRow icon="person-outline" label="Organizer" value={event.organizer} />
          </Card>

          <Card style={styles.sectionCard}>
            <View style={styles.capacityHeader}>
              <Text style={styles.sectionTitle}>Capacity</Text>
              <Badge
                label={soldOut ? "Sold out" : `${seatsLeft} seats left`}
                tone={soldOut ? "danger" : "success"}
              />
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
            </View>

            <Text style={styles.capacityText}>
              {registered} registered out of {capacity}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open venue in maps"
              onPress={() => Linking.openURL(event.locationUrl)}
              style={({ pressed }) => [styles.navigateButton, pressed && styles.pressed]}
            >
              <Ionicons name="navigate-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.navigateText}>Open in maps</Text>
            </Pressable>
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>{event.price || "Free"}</Text>
        </View>

        <AppButton
          title={primaryLabel}
          icon={booking ? "qr-code-outline" : "ticket-outline"}
          onPress={handlePrimary}
          disabled={primaryDisabled}
          style={styles.bookButton}
        />
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  notFound: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  hero: {
    height: 340,
    justifyContent: "space-between",
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,10,20,0.45)",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  heroContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    flexShrink: 1,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroMetaText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: fontSize.small,
    fontWeight: "600",
  },
  sheet: {
    marginTop: -spacing.xxl,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.subheading,
    fontFamily: fonts.display,
    fontWeight: "700",
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    lineHeight: 23,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: fontSize.tiny,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSize.body,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 50,
  },
  capacityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  capacityText: {
    color: colors.textSecondary,
    fontSize: fontSize.small,
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  navigateText: {
    color: colors.primaryDark,
    fontSize: fontSize.small,
    fontWeight: "800",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  priceLabel: {
    color: colors.textMuted,
    fontSize: fontSize.tiny,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  price: {
    color: colors.text,
    fontSize: fontSize.heading,
    fontWeight: "900",
  },
  bookButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
