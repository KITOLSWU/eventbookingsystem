import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { AppButton, Card, Field, IconButton } from "../components/ui";
import { colors, fontSize, fonts, radius, spacing } from "../constants/theme";

const PAYMENT_METHODS = [
  { id: "card", label: "Credit or debit card", icon: "card-outline", detail: "Visa, Mastercard and RuPay" },
  { id: "upi", label: "UPI", icon: "phone-portrait-outline", detail: "Pay using your UPI ID" },
];

function getAmount(price) {
  const amount = Number(String(price || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { bookEvent, currentUser, getEventById } = useAppStore();
  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const event = getEventById(id);
  const amount = getAmount(event?.price);
  const isFree = amount === 0;

  if (!event) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.header}>
          <IconButton icon="arrow-back" accessibilityLabel="Go back" onPress={() => router.back()} />
          <Text style={styles.title}>Payment</Text>
        </View>
        <Text style={styles.muted}>This event could not be found. Go back and choose another event.</Text>
      </View>
    );
  }

  const handleContinue = async () => {
    if (!currentUser) {
      router.replace("/details");
      return;
    }

    if (!isFree && method === "card") {
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length < 12 || !cardName.trim() || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length < 3) {
        Alert.alert("Check card details", "Enter a card number, name, expiry (MM/YY) and CVV to continue.");
        return;
      }
    }
    if (!isFree && method === "upi" && !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
      Alert.alert("Check UPI ID", "Enter a valid UPI ID, for example name@bank.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await bookEvent(event.id);
      if (created) {
        router.replace({ pathname: "/ticket", params: { id: event.id, bookingId: created.id } });
      } else {
        Alert.alert("Booking failed", "Could not reserve a seat. Please try again.");
      }
    } catch (error) {
      Alert.alert("Booking failed", error.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <IconButton icon="arrow-back" accessibilityLabel="Back to event" onPress={() => router.back()} />
            <Text style={styles.title}>Checkout</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            <Card style={styles.summary}>
              <Text style={styles.eyebrow}>YOUR BOOKING</Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventMeta}>{event.date} · {event.venue}</Text>
              <View style={styles.separator} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{isFree ? "Free" : `₹${amount.toLocaleString("en-IN")}`}</Text>
              </View>
            </Card>

            {!isFree ? (
              <>
                <Text style={styles.sectionTitle}>Choose a payment method</Text>
                <View style={styles.methods}>
                  {PAYMENT_METHODS.map((item) => {
                    const selected = method === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => setMethod(item.id)}
                        style={[styles.method, selected && styles.methodSelected]}
                      >
                        <Ionicons name={item.icon} size={23} color={selected ? colors.primary : colors.textSecondary} />
                        <View style={styles.methodCopy}>
                          <Text style={styles.methodTitle}>{item.label}</Text>
                          <Text style={styles.methodDetail}>{item.detail}</Text>
                        </View>
                        <Ionicons
                          name={selected ? "radio-button-on" : "radio-button-off"}
                          size={21}
                          color={selected ? colors.primary : colors.textMuted}
                        />
                      </Pressable>
                    );
                  })}
                </View>

                <Card style={styles.formCard}>
                  {method === "card" ? (
                    <>
                      <Field
                        label="Card number"
                        icon="card-outline"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        keyboardType="number-pad"
                        maxLength={19}
                      />
                      <Field
                        label="Name on card"
                        placeholder="Name as shown on card"
                        value={cardName}
                        onChangeText={setCardName}
                        autoCapitalize="words"
                      />
                      <View style={styles.cardRow}>
                        <Field
                          label="Expiry"
                          placeholder="MM/YY"
                          value={expiry}
                          onChangeText={(value) => {
                            const digits = value.replace(/\D/g, "").slice(0, 4);
                            setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                          }}
                          keyboardType="number-pad"
                          maxLength={5}
                          style={styles.cardHalf}
                        />
                        <Field
                          label="CVV"
                          placeholder="•••"
                          value={cvv}
                          onChangeText={(value) => setCvv(value.replace(/\D/g, ""))}
                          keyboardType="number-pad"
                          maxLength={4}
                          secureTextEntry
                          style={styles.cardHalf}
                        />
                      </View>
                    </>
                  ) : (
                    <Field
                      label="UPI ID"
                      icon="at-outline"
                      placeholder="name@bank"
                      value={upiId}
                      onChangeText={setUpiId}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                  )}
                </Card>
              </>
            ) : (
              <Card style={styles.freeNotice}>
                <Ionicons name="checkmark-circle-outline" size={22} color={colors.success} />
                <Text style={styles.freeText}>This event is free. No payment method is needed.</Text>
              </Card>
            )}

            <View style={styles.demoNotice}>
              <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
              <Text style={styles.demoText}>
                Demo checkout: no real payment is processed. Do not enter real card or bank details.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <AppButton
            title={isFree ? "Confirm free booking" : "Simulate payment and book"}
            icon={isFree ? "ticket-outline" : "lock-closed-outline"}
            onPress={handleContinue}
            loading={submitting}
            style={styles.payButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  title: { flex: 1, color: colors.text, fontSize: fontSize.heading, fontFamily: fonts.display, fontWeight: "700" },
  muted: { color: colors.textSecondary, fontSize: fontSize.body, paddingHorizontal: spacing.xl },
  headerSpacer: { width: 42 },
  content: { padding: spacing.xl, gap: spacing.lg },
  summary: { gap: spacing.sm },
  eyebrow: { color: colors.textMuted, fontSize: fontSize.tiny, fontWeight: "900", letterSpacing: 1 },
  eventTitle: { color: colors.text, fontSize: fontSize.subheading, fontFamily: fonts.display, fontWeight: "700" },
  eventMeta: { color: colors.textSecondary, fontSize: fontSize.small },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { color: colors.textSecondary, fontSize: fontSize.body, fontWeight: "700" },
  totalAmount: { color: colors.text, fontSize: fontSize.heading, fontWeight: "900" },
  sectionTitle: { color: colors.text, fontSize: fontSize.subheading, fontFamily: fonts.display, fontWeight: "700" },
  methods: { gap: spacing.sm },
  method: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  methodCopy: { flex: 1, gap: 3 },
  methodTitle: { color: colors.text, fontSize: fontSize.body, fontWeight: "800" },
  methodDetail: { color: colors.textSecondary, fontSize: fontSize.small },
  formCard: { gap: spacing.lg },
  cardRow: { flexDirection: "row", gap: spacing.md },
  cardHalf: { flex: 1 },
  freeNotice: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  freeText: { flex: 1, color: colors.success, fontSize: fontSize.body, fontWeight: "700" },
  demoNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
  },
  demoText: { flex: 1, color: colors.warning, fontSize: fontSize.small, lineHeight: 19 },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payButton: { width: "100%" },
});
