import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authcontext'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from 'phosphor-react-native'
import React from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import Typo from './Typo'

const HomeCard = () => {
const {user}= useAuth();

const {data:wallets,
  error,
  loading:walletLoading
}= useFetchData<WalletType>("wallets",[
    where("uid","==",user?.uid),
    orderBy('created',"desc")
  ])

  const getTotalBalance =()=>{
  return   wallets.reduce((totals:any,item:WalletType)=>{
      totals.balance=totals.balance +Number(item.amount);
      totals.Income=totals.Income +Number(item.totalIncome);
      totals.Expenses=totals.Expenses +Number(item.totalExpenses);
      return totals

    },{balance:0,Income:0,Expenses:0})
  }
  return (
    <ImageBackground
    source={require('@/assets/images/card.png')}
    resizeMode='stretch'
    style={styles.bgImage}>
    <View style={styles.container}>
      <View>
      <View style={styles.totalBalanceRow}>
        <Typo color={colors.neutral800} size={17} fontWeight={'500'}>Total Balance</Typo>
        <Icons.DotsThreeOutline size={verticalScale(23)}
        color={colors.black} weight='bold'/>
      </View>
         <Typo color={colors.black} size={30} fontWeight={'bold'}>$ {walletLoading?"----":getTotalBalance()?.balance || 0}</Typo>
    </View>
    <View style={styles.stats}>
      <View style={{gap: verticalScale(5),}}>
        <View style={styles.IncomeExpense}> 
          <View style={styles.statsIcon}>
            <Icons.ArrowDown size={verticalScale(15)} color={colors.black} weight='bold'/>
          </View>
          <Typo color={colors.neutral700}  fontWeight={'700'} size={16}>Income</Typo>
        </View>
       <View style={{alignSelf:'center'}}>
         <Typo color={colors.green} fontWeight={'600'} size={18}>$ {walletLoading?"----":getTotalBalance()?.Income || 0}</Typo>
       </View>
        </View>
        <View style={{gap: verticalScale(5),}}>
        <View style={styles.IncomeExpense}> 
          <View style={styles.statsIcon}>
            <Icons.ArrowUp size={verticalScale(15)} color={colors.black} weight='bold'/>
          </View>
          <Typo color={colors.neutral700}  fontWeight={'700'} size={16}>Expenses</Typo>
        </View>
       <View style={{alignSelf:'center'}}>
         <Typo color={colors.rose} fontWeight={'600'} size={18}>$ {walletLoading?"----":getTotalBalance()?.Expenses || 0}</Typo>
       </View>
        </View>
        </View>
    </View>
    </ImageBackground>
  )
}

export default HomeCard

const styles = StyleSheet.create({
  
bgImage: {
height: scale(210),
width: "100%",
},
container:{
padding: spacingX._20,
paddingHorizontal: scale (23),
height: "87%",
width: "100%",
justifyContent: "space-between",
},
totalBalanceRow: {

flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
marginBottom: spacingY._5,
},
stats: {

flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
},
statsIcon: {
backgroundColor: colors.neutral350,
padding: spacingY._5,
borderRadius: 50,
},
IncomeExpense:{
  flexDirection: "row",
  alignItems: "center",
  gap: spacingX._7,}
})
