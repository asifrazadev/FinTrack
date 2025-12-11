import Loading from "@/components/Loading";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import WalletListItem from "@/components/WalletListItem";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authcontext";
import useFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
const Wallet = () => {
  const router = useRouter();
  const {user} = useAuth()
  const {data:wallets,loading,error} =useFetchData<WalletType>("wallets",[
    where("uid","==",user?.uid),
    orderBy('created',"desc")
  ])
  const getTotalBalance = () => wallets.reduce((total,item)=>{
  total = total + (item.amount||0)
  return total
},0)
  
  return (
    <ScreenWrapper style={{ backgroundColor: colors.black }}>
      <View style={styles.container}>
        {/* balance */}
        <View style={styles.balanceView}>
          <View style={{ alignItems: "center" }}>
            <Typo size={45}  fontWeight={"500"}>
            ${getTotalBalance().toFixed(2)}
            </Typo>
            <Typo size={16} color={colors.neutral300} fontWeight={"400"}>
              Total Balance
            </Typo>
          </View>
        </View>
        {/* wallets */}
        <View style={styles.wallets}>
          <View style={styles.flexRow}>
            <Typo size={20} fontWeight={"500"} >
             My Wallets
            </Typo>
            <TouchableOpacity onPress={()=>router.push('/(models)/WalletModal')}>
              <Icons.PlusCircle size={verticalScale(33)} color={colors.primary}  weight="fill"/>
            </TouchableOpacity>
          </View>

  {loading && (
    <Loading/>
  )}

  {!loading && wallets?.length === 0 && (
    <Typo size={16} color={colors.neutral400}>No wallets added yet</Typo>
  )}

  {!loading && wallets?.length > 0 && (
      <FlatList
      data={wallets}
      renderItem={({index,item})=>{
        return <WalletListItem item={item} index={index} router={router} />
      }}
      contentContainerStyle={styles.listStyle}
      />
    )
  }

        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  balanceView: {
    height: verticalScale(160),
    alignItems: "center",
    backgroundColor: colors.black,
    justifyContent: "center",
  },
  walletCard: {
  backgroundColor: colors.neutral800,
  padding: spacingX._20,
  borderRadius: radius._20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacingY._15,
},

  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacingY._10,
    justifyContent: "space-between",
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    paddingTop: spacingX._25,
    padding: spacingX._20,
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15,
  },
});
