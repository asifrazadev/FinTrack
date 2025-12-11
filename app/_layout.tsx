import { colors } from "@/constants/theme";
import { AuthProvider } from "@/context/authcontext";
import { Stack } from "expo-router";

 function StackLayout() {
  return <Stack
  screenOptions={{
    headerShown:false,
      contentStyle: { backgroundColor: colors.neutral900 },
  }
  } >
    <Stack.Screen name="(models)/ProfileModel" options={{
      presentation:"modal",
    }}/>
    <Stack.Screen name="(models)/WalletModal" options={{
      presentation:"modal"
    }}/>
    <Stack.Screen name="(models)/TransactionModal" options={{
      presentation:"modal"
    }}/>
  </Stack>;
  
}
export default function RootLayout() {
  return (
    <AuthProvider>
      < StackLayout />
    </AuthProvider>
  )
}