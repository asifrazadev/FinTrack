import Button from '@/components/Button'
import HomeCard from '@/components/HomeCard'
import ScreenWrapper from '@/components/ScreenWrapper'
import TransectionList from '@/components/TransectionList'
import Typo from '@/components/Typo'
import { firestore } from "@/config/firebase"
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authcontext'
import useFetchData from '@/hooks/useFetchData'
import { TransactionType } from "@/types"
import { verticalScale } from '@/utils/styling'
import { router } from 'expo-router'
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore"
import * as Icons from 'phosphor-react-native'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

export const getUserTransactions = async (userId: string) => {
  try {
    const q = query(
      collection(firestore, "transactions"),
      where("uid", "==", userId),
    );

    const snap = await getDocs(q);

    const list: TransactionType[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TransactionType[];

    return { success: true, data: list };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      msg: error.message || "Failed to fetch transactions",
    };
  }
};

const Home = () => {
  const { user } = useAuth();

const Constrains=[
   where("uid", "==", user?.uid),
   orderBy('date',"desc"),
   limit(30)
]
 const {data:Transactions,loading,error} =useFetchData<TransactionType>("transactions",Constrains)

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typo size={16} color={colors.neutral400}>Hello</Typo>
            <Typo size={20} fontWeight="500" color={colors.neutral100}>
              {user?.name || "User"}
            </Typo>
          </View>

          <TouchableOpacity style={styles.searchIcon} onPress={()=>router.push('/(models)/SearchModal')}>
            <Icons.MagnifyingGlass
              size={verticalScale(22)}
              weight={"bold"}
              color={colors.neutral200}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          <HomeCard />

          <TransectionList
            title="Recent Transaction"
            data={Transactions}
            loading={loading}
            emptyListMessage="No Transaction Found"
          />
        </ScrollView>

        <Button
          style={styles.floatingButton}
          onPress={() => router.push("/(models)/TransactionModal")}
        >
          <Icons.Plus size={verticalScale(25)} weight="bold" />
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Home;



// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
});
