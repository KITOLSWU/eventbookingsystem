import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
import { AppButton, Card, EmptyState, Field, ScreenHeader } from "../components/ui";
import { colors, fontSize, radius, spacing } from "../constants/theme";

const emptyForm = {
  title: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  city: "",
  capacity: "",
  price: "",
  description: "",
};

export default function CreateEventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addEvent, currentUser } = useAppStore();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const canSave =
    form.title.trim().length > 0 &&
    form.date.trim().length > 0 &&
    form.time.trim().length > 0 &&
    form.venue.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.capacity.trim().length > 0;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!isAdmin || saving) return;

    if (!canSave) {
      setError("Fill in title, date, time, venue, city and capacity.");
      return;
    }

    if (Number(form.capacity) <= 0) {
      setError("Capacity must be greater than zero.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const created = await addEvent({
        ...form,
        title: form.title.trim(),
        category: form.category.trim(),
        date: form.date.trim(),
        time: form.time.trim(),
        venue: form.venue.trim(),
        city: form.city.trim(),
        price: form.price.trim(),
        description: form.description.trim(),
        capacity: Number(form.capacity),
      });

      if (!created) {
        throw new Error("Could not save the event. Please try again.");
      }

      router.replace("/organizer");
    } catch (saveError) {
      setError(saveError.message || "Could not save the event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxxl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            subtitle="Organizer"
            title="Create event"
            onBack={() => (router.canGoBack() ? router.back() : router.replace("/organizer"))}
          />

          {!isAdmin ? (
            <EmptyState
              icon="lock-closed-outline"
              title="Admin access required"
              message="Log in with the organizer account to create events."
              actionLabel="Go to login"
              onAction={() => router.replace("/details")}
            />
          ) : (
            <>
              <Card style={styles.formCard}>
                <Field
                  label="Event title"
                  icon="text-outline"
                  value={form.title}
                  onChangeText={(value) => updateField("title", value)}
                  placeholder="e.g. Tech Innovators Summit"
                />

                <Field
                  label="Category"
                  icon="pricetag-outline"
                  value={form.category}
                  onChangeText={(value) => updateField("category", value)}
                  placeholder="Conference, Music, Workshop"
                />

                <View style={styles.row}>
                  <Field
                    label="Date"
                    value={form.date}
                    onChangeText={(value) => updateField("date", value)}
                    placeholder="30 Oct 2026"
                    style={styles.half}
                  />
                  <Field
                    label="Time"
                    value={form.time}
                    onChangeText={(value) => updateField("time", value)}
                    placeholder="5:00 PM"
                    style={styles.half}
                  />
                </View>

                <Field
                  label="Venue"
                  icon="location-outline"
                  value={form.venue}
                  onChangeText={(value) => updateField("venue", value)}
                  placeholder="Kohima Convention Hall"
                />

                <View style={styles.row}>
                  <Field
                    label="City"
                    value={form.city}
                    onChangeText={(value) => updateField("city", value)}
                    placeholder="Kohima"
                    style={styles.half}
                  />
                  <Field
                    label="Capacity"
                    value={form.capacity}
                    onChangeText={(value) =>
                      updateField("capacity", value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="120"
                    keyboardType="number-pad"
                    style={styles.half}
                  />
                </View>

                <Field
                  label="Price"
                  icon="cash-outline"
                  value={form.price}
                  onChangeText={(value) => updateField("price", value)}
                  placeholder="Free or Rs. 200"
                />

                <Field
                  label="Description"
                  value={form.description}
                  onChangeText={(value) => updateField("description", value)}
                  placeholder="Short event description"
                  multiline
                />
              </Card>

              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <AppButton
                title="Save event"
                icon="save-outline"
                onPress={handleSave}
                loading={saving}
                disabled={!canSave}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  formCard: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: fontSize.small,
    fontWeight: "700",
  },
});
