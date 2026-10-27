import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../context/AppStore";
import { Badge, Card, EmptyState, ScreenHeader, StatTile } from "../components/ui";
import { BottomTabBar, TAB_BAR_HEIGHT } from "../components/BottomTabBar";
import { TopBar } from "../components/TopBar";
import { colors, fontSize, spacing } from "../constants/theme";

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, getBookingsForCurrentUser, getEventById } = useAppStore();
  const activeTab = "history";

  const bookingHistory = getBookingsForCurrentUser();
  const attendedCount = bookingHistory.filter((booking) => booking.status === "Attended").length;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <TopBar title="EventBooking" subtitle="Booking history" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatTile
            icon="receipt-outline"
            label="Total bookings"
            value={bookingHistory.length}
            tone="primary"
          />
          <StatTile
            icon="checkmark-done-outline"
            label="Attended"
            value={attendedCount}
            tone="success"
          />
        </View>

        {bookingHistory.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No bookings yet"
            message="Tickets you book will appear here with their QR codes."
            actionLabel="Browse events"
            onAction={() => router.replace("/home")}
          />
        ) : (
          <View style={styles.list}>
            {bookingHistory.map((booking) => {
              const event = getEventById(booking.eventId);
              const attended = booking.status === "Attended";

              return (
                <Pressable
                  key={booking.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ticket for ${event?.title || "event"}`}
                  onPress={() =>
                    router.push({
                      pathname: "/ticket",
                      params: { id: booking.eventId, bookingId: booking.id },
                    })
                  }
                >
                  <Card style={styles.bookingCard}>
                    <View style={styles.bookingTop}>
                      <Badge
                        label={booking.status}
                        tone={attended ? "success" : "primary"}
                        icon={attended ? "checkmark-circle-outline" : "time-outline"}
                      />
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </View>

                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event?.title || "Event unavailable"}
                    </Text>

                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
                      <Text style={styles.metaText}>
                        {event ? `${event.date} · ${event.venue}` : "This event was removed"}
                      </Text>
                    </View>

                    <View style={styles.bookingFooter}>
                      <Text selectable style={styles.bookingId}>
                        {booking.id}
                      </Text>
                      <Text style={styles.viewTicket}>View ticket</Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
      <BottomTabBar activeTab={activeTab} />
    </View>
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
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  bookingCard: {
    gap: spacing.sm,
  },
  bookingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventTitle: {
    color: colors.text,
    fontSize: fontSize.subheading,
    fontWeight: "900",
    letterSpacing: -0.2,
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
  bookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  bookingId: {
    color: colors.textMuted,
    fontSize: fontSize.tiny,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  viewTicket: {
    color: colors.primary,
    fontSize: fontSize.small,
    fontWeight: "800",
  },
});
