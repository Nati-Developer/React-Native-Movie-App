import { icons } from "@/constants/icons";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView className="bg-primary flex-1 px-10">
      <View className="flex justify-center items-center flex-1 flex-col gap-3">
        <Image
          source={{ uri: "https://github.com/Nati-Developer.png" }}
          className="w-24 h-24 rounded-full"
        />
        <Text className="text-white text-xl font-bold mt-2">Natnael Wosen</Text>
        <Text className="text-light-200 text-base">0920269570</Text>

        <TouchableOpacity
          className="mt-4 bg-accent px-4 py-2 rounded-full"
          onPress={() => Linking.openURL("https://github.com/Nati-Developer")}
        >
          <Text className="text-white font-semibold">View GitHub Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
