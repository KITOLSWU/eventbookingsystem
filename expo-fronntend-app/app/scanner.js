import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../context/AppStore";
import { AppButton, Card, EmptyState, IconButton, ScreenHeader } from "../components/ui";
import { colors, fontSize, radius, spacing } from "../constants/theme";

export default function ScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, verifyTicket } = useAppStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/organizer"));

  const handleScan = async ({ data }) => {
    if (scanned || verifying) return;

    setScanned(true);
    setVerifying(true);

    try {
      setScanResult(await verifyTicket(data));
    } catch (error) {
      setScanResult({
        ok: false,
        title: "Scan error",
        message: error.message || "Failed to verify the ticket.",
      });
    } finally {
      setVerifying(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={[styles.lightRoot, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom }]}>
        <StatusBar style="dark" />
        <View style={styles.lightContent}>
          <ScreenHeader
            subtitle="Organizer"
            title="Ticket scanner"
            onBack={goBack}
          />
          <EmptyState
            icon="lock-closed-outline"
            title="Admin access required"
            message="Log in with the organizer account to scan attendee tickets."
            actionLabel="Go to login"
            onAction={() => router.replace("/details")}
          />
        </View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.cameraRoot}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.lightRoot, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom }]}>
        <StatusBar style="dark" />
        <View style={styles.lightContent}>
          <ScreenHeader subtitle="Organizer" title="Ticket scanner" onBack={goBack} />

          <Card style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <Ionicons name="camera-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.permissionTitle}>Camera permission needed</Text>
            <Text style={styles.permissionText}>
              Allow camera access so the organizer can scan event ticket QR codes.
            </Text>
            <AppButton
              title="Allow camera"
              icon="camera-outline"
              onPress={requestPermission}
              style={styles.permissionButton}
            />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cameraRoot}>
      <StatusBar style="light" />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      <View style={[styles.cameraTop, { top: insets.top + spacing.sm }]}>
        <IconButton
          icon="arrow-back"
          color={colors.white}
          backgroundColor="rgba(0,0,0,0.55)"
          accessibilityLabel="Go back"
          onPress={goBack}
        />
        <View style={styles.cameraTitlePill}>
          <Ionicons name="scan-outline" size={16} color={colors.white} />
          <Text style={styles.cameraTitle}>Scan ticket</Text>
        </View>
      </View>

      <View style={styles.scanFrame} pointerEvents="none">
        <View style={[styles.corner, styles.cornerTopLeft]} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />
      </View>

      <View style={[styles.resultSheet, { bottom: insets.bottom + spacing.lg }]}>
        {verifying ? (
          <View style={styles.verifyingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.verifyingText}>Verifying ticket…</Text>
          </View>
        ) : scanResult ? (
          <>
            <View style={styles.resultHeader}>
              <Ionicons
                name={scanResult.ok ? "checkmark-circle" : "close-circle"}
                size={26}
                color={scanResult.ok ? colors.success : colors.danger}
              />
              <Text style={styles.resultTitle}>{scanResult.title}</Text>
            </View>
            <Text style={styles.resultMessage}>{scanResult.message}</Text>
            <AppButton
              title="Scan another ticket"
              icon="scan-outline"
              onPress={() => {
                setScanned(false);
                setScanResult(null);
              }}
            />
          </>
        ) : (
          <>
            <Text style={styles.resultTitle}>Scan a customer ticket</Text>
            <Text style={styles.resultMessage}>
              Point the camera at the QR code on the ticket screen.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lightRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  lightContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  cameraRoot: {
    flex: 1,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionCard: {
    gap: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionTitle: {
    color: colors.text,
    fontSize: fontSize.subheading,
    fontWeight: "900",
    textAlign: "center",
  },
  permissionText: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    lineHeight: 22,
    textAlign: "center",
  },
  permissionButton: {
    alignSelf: "stretch",
    marginTop: spacing.sm,
  },
  cameraTop: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cameraTitlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cameraTitle: {
    color: colors.white,
    fontSize: fontSize.small,
    fontWeight: "800",
  },
  scanFrame: {
    position: "absolute",
    left: 34,
    right: 34,
    top: "26%",
    height: 260,
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: colors.white,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  resultSheet: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  verifyingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  verifyingText: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    fontWeight: "700",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultTitle: {
    color: colors.text,
    fontSize: fontSize.heading,
    fontWeight: "900",
    flex: 1,
  },
  resultMessage: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
});
