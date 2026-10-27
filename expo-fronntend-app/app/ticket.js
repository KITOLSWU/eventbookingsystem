import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../context/AppStore";
import { AppButton, Badge, EmptyState, IconButton } from "../components/ui";
import { colors, fontSize, fonts, radius, spacing } from "../constants/theme";

export default function TicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, bookingId: bookingIdParam } = useLocalSearchParams();
  const { currentUser, getEventById, getBookingsForCurrentUser } = useAppStore();

  const event = getEventById(id);
  const userBookings = getBookingsForCurrentUser();
  const booking =
    userBookings.find((item) => item.id === bookingIdParam) ||
    userBookings.find((item) => item.eventId === id);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  if (!event || !booking) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom }]}>
        <StatusBar style="light" />
        <View style={styles.notFound}>
          <IconButton
            icon="arrow-back"
            color={colors.white}
            backgroundColor="rgba(255,255,255,0.12)"
            accessibilityLabel="Go back"
            onPress={goBack}
          />
          <EmptyState
            icon="qr-code-outline"
            title="Ticket not found"
            message="We could not find a booking for this event on your account."
            actionLabel="Browse events"
            onAction={() => router.replace("/home")}
          />
        </View>
      </View>
    );
  }

  const attended = booking.status === "Attended";

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-back"
            color={colors.white}
            backgroundColor="rgba(255,255,255,0.12)"
            accessibilityLabel="Go back"
            onPress={goBack}
          />
          <Text style={styles.topTitle}>Digital ticket</Text>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.intro}>
          <Badge label={attended ? "Checked in" : "Booking confirmed"} tone={attended ? "success" : "primary"} />
          <Text style={styles.title}>You are all set</Text>
          <Text style={styles.subtitle}>Show this QR code at the entrance for check-in.</Text>
        </View>

        <View style={styles.ticket}>
          <View style={styles.ticketHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {event.date} · {event.time}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={15} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {event.venue}, {event.city}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={15} color={colors.textMuted} />
              <Text style={styles.metaText}>Booked for {currentUser?.username || "Guest"}</Text>
            </View>
          </View>

          <View style={styles.perforation}>
            <View style={styles.notchLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.notchRight} />
          </View>

          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <QRCode value={booking.id} size={188} color={colors.dark} />
            </View>
            <Text selectable style={styles.bookingId}>
              {booking.id}
            </Text>
            <Badge
              label={attended ? "Already scanned" : "Ready to scan"}
              tone={attended ? "success" : "neutral"}
              icon={attended ? "checkmark-circle-outline" : "scan-outline"}
            />
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons
              name={attended ? "checkmark-done" : "information-circle-outline"}
              size={20}
              color={attended ? colors.success : colors.primaryDark}
            />
          </View>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>Check-in status</Text>
            <Text style={styles.statusValue}>
              {attended
                ? "This ticket has already been used at the entrance."
                : "Not scanned yet. The organizer will scan this QR code."}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Back to events"
            icon="home-outline"
            variant="soft"
            onPress={() => router.replace("/home")}
          />
          <AppButton
            title="Booking history"
            icon="receipt-outline"
            variant="onDark"
            onPress={() => router.push("/history")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  notFound: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: {
    color: colors.white,
    fontSize: fontSize.body,
    fontWeight: "800",
  },
  topSpacer: {
    width: 42,
  },
  intro: {
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: fontSize.body,
    lineHeight: 21,
  },
  ticket: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  ticketHeader: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  eventTitle: {
    color: colors.text,
    fontSize: fontSize.title,
    fontFamily: fonts.display,
    fontWeight: "700",
    marginBottom: spacing.xs,
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
  perforation: {
    flexDirection: "row",
    alignItems: "center",
  },
  notchLeft: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.dark,
    marginLeft: -11,
  },
  notchRight: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.dark,
    marginRight: -11,
  },
  dashedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  qrSection: {
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  qrWrapper: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingId: {
    color: colors.text,
    fontSize: fontSize.body,
    fontWeight: "900",
    letterSpacing: 1,
  },
  statusCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.darkSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    color: colors.white,
    fontSize: fontSize.small,
    fontWeight: "800",
  },
  statusValue: {
    color: "rgba(255,255,255,0.6)",
    fontSize: fontSize.small,
    lineHeight: 19,
  },
  actions: {
    gap: spacing.md,
  },
});
