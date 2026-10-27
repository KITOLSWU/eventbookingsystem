import { useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../context/AppStore";
import { AppButton, Badge, Card, EmptyState, IconButton, ScreenHeader, StatTile } from "../components/ui";
import { BottomTabBar, TAB_BAR_HEIGHT } from "../components/BottomTabBar";
import { TopBar } from "../components/TopBar";
import { colors, fontSize, radius, spacing } from "../constants/theme";

export default function OrganizerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, events, logout, users, fetchEvents } = useAppStore();
  const activeTab = "organizer";

  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const totalRegistered = events.reduce((sum, event) => sum + (event.registered || 0), 0);
  const totalCheckedIn = events.reduce((sum, event) => sum + (event.checkedIn || 0), 0);

  const handleLogout = () => {
    Alert.alert("Log out?", "You will need to log in again to manage events.", [
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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <TopBar
        title="EventBooking"
        subtitle={currentUser?.username || "Not logged in"}
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

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.lg },
        ]}
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
        {!isAdmin ? (
          <EmptyState
            icon="lock-closed-outline"
            title="Admin access required"
            message="Log in with the organizer account to create events and scan tickets."
            actionLabel="Go to login"
            onAction={() => router.replace("/details")}
          />
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatTile icon="people-outline" label="Registered" value={totalRegistered} tone="primary" />
              <StatTile icon="checkmark-done-outline" label="Checked in" value={totalCheckedIn} tone="success" />
            </View>
            <View style={styles.statsRow}>
              <StatTile icon="calendar-outline" label="Events" value={events.length} tone="accent" />
              <StatTile icon="person-circle-outline" label="Users" value={users.length} tone="warning" />
            </View>

            <AppButton
              title="Add new event"
              icon="add-circle-outline"
              onPress={() => router.push("/create-event")}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open QR check-in scanner"
              onPress={() => router.push("/scanner")}
              style={({ pressed }) => [styles.scannerCard, pressed && styles.pressed]}
            >
              <View style={styles.scannerIcon}>
                <Ionicons name="scan-outline" size={26} color={colors.white} />
              </View>
              <View style={styles.scannerText}>
                <Text style={styles.scannerTitle}>QR check-in scanner</Text>
                <Text style={styles.scannerSubtitle}>
                  Scan attendee tickets and update attendance instantly.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Managed events</Text>
              <Badge label={`${events.length} total`} tone="primary" />
            </View>

            {events.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No events yet"
                message="Create your first event to start selling tickets."
                actionLabel="Add event"
                onAction={() => router.push("/create-event")}
              />
            ) : (
              <View style={styles.list}>
                {events.map((event) => {
                  const capacity = event.capacity || 0;
                  const registered = Math.min(event.registered || 0, capacity);
                  const checkedIn = Math.min(event.checkedIn || 0, registered);
                  const rate = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;

                  return (
                    <Card key={event.id} style={styles.eventCard}>
                      <View style={styles.eventTop}>
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        <Badge label={`${registered}/${capacity}`} tone="primary" />
                      </View>

                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={15} color={colors.textMuted} />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {event.venue}, {event.city}
                        </Text>
                      </View>

                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${rate}%` }]} />
                      </View>

                      <Text style={styles.attendanceText}>
                        {checkedIn} checked in · {rate}% attendance
                      </Text>
                    </Card>
                  );
                })}
              </View>
            )}
          </>
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
    gap: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  scannerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.dark,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  scannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(96,165,250,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerText: {
    flex: 1,
    gap: 2,
  },
  scannerTitle: {
    color: colors.white,
    fontSize: fontSize.subheading,
    fontWeight: "900",
  },
  scannerSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: fontSize.small,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.heading,
    fontWeight: "900",
  },
  list: {
    gap: spacing.md,
  },
  eventCard: {
    gap: spacing.sm,
  },
  eventTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  eventTitle: {
    color: colors.text,
    fontSize: fontSize.subheading,
    fontWeight: "900",
    flex: 1,
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
  progressTrack: {
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  attendanceText: {
    color: colors.textSecondary,
    fontSize: fontSize.small,
  },
  pressed: {
    opacity: 0.9,
  },
});
