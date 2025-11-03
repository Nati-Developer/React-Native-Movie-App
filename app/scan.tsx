import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { BarCodeScanner } from "expo-barcode-scanner";

export default function ScanScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [scanned, setScanned] = useState(false);
  const [lastData, setLastData] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setLastData(String(data ?? ""));
    // Example: if your QR encodes a movie id, navigate to the movie page
    // Try to detect numeric id; otherwise, just show the data and allow rescan
    const maybeId = Number(data);
    if (!Number.isNaN(maybeId) && Number.isFinite(maybeId)) {
      router.replace(`/movie/${maybeId}`);
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-white">Requesting camera permission…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-primary px-6">
        <Text className="text-white text-center mb-4">No access to camera</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-accent px-4 py-2 rounded-full"
        >
          <Text className="text-primary font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleScanned}
        style={{ flex: 1 }}
      />

      {scanned && (
        <View className="absolute bottom-6 left-0 right-0 items-center px-6">
          {!!lastData && (
            <Text className="text-white text-center mb-3" selectable>
              {lastData}
            </Text>
          )}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setScanned(false)}
              className="bg-white px-4 py-2 rounded-full"
            >
              <Text className="text-primary font-semibold">Scan Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-accent px-4 py-2 rounded-full"
            >
              <Text className="text-primary font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}



