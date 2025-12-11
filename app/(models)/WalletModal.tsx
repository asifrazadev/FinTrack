import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUplaod from '@/components/ImageUplaod'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authcontext'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'
import { WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { router, useLocalSearchParams } from 'expo-router'
import * as Icons from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
const WalletModal = () => {
  const {user,updateUserData} = useAuth();
  const [wallet, setwallet] = useState<WalletType>({
    name:'',
    image:null
  });
  const [isloading, setIsLoading] = useState(false);
 
  const oldWallet:{name:string,image:string,id:string}= useLocalSearchParams();

useEffect(()=>{
  if(oldWallet?.id){
    setwallet({
      name:oldWallet.name,
      image:oldWallet.image,
        })
  }
},[])

  const onsubmit = async () => {
    const {name,image} = wallet
  if (!name.trim()|| !image) {
      Alert.alert("Wallet", "Please provide a wallet name and icon.");
    return;
  }

  setIsLoading(true);

 const data:WalletType = {
  name,
  image,
  uid:user?.uid
 } 
 if(oldWallet?.id) data.id=oldWallet.id;
  

 const res = await createOrUpdateWallet(data);
  if (res.success) {
    
    Alert.alert("Success", res.msg);
    router.back();
  } else {
    Alert.alert("Wallet", res.msg);
  }

  setIsLoading(false);
};
const OnDelete = async() => {
  if(!oldWallet?.id) return;
  setIsLoading(true);
  const res = await deleteWallet(oldWallet.id);
  if (res.success) {
    
    Alert.alert("Success", res.msg);
    router.back();
  } else {
    Alert.alert("Wallet", res.msg);
  }
  setIsLoading(false);
  
}

const DeleteAlert = () => {
  Alert.alert(
    "Delete Wallet",
    "Are you sure you want to delete this wallet?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => OnDelete()
      },
    ]
  );
};

  return (
    <ModalWrapper>
    <View style={styles.container} >
<Header title={oldWallet.id?'update Wallet':'New Wallet'} leftIcon={<BackButton iconSize={24}/>} style={{marginBottom:spacingY._10}} />  
 {/*Form  */}
 <ScrollView contentContainerStyle={styles.form} >
  
    <View style={styles.InputContainer}>
      {/* Input fields would go here */}
      <Typo color={colors.neutral200}>Wallet Name</Typo>
      <Input
        placeholder="Savings Wallet"
        value={wallet.name}
        onChangeText={(text) => setwallet({ ...wallet, name: text })}
      />
      
    </View>
   <View style={styles.InputContainer}>
      {/* Input fields would go here */}
      <Typo color={colors.neutral200}>Wallet Icon</Typo>
      <ImageUplaod file={wallet.image} onClear={()=>{setwallet({...wallet,image:null})}} onSelect={file=>setwallet({...wallet,image:file})} />      
    </View>
 </ScrollView >
</View> 
<View style={styles.footer}>
  {oldWallet.id &&(
    <Button onPress={DeleteAlert} style={{backgroundColor: colors.rose ,paddingHorizontal:spacingX._15}}>
      <Icons.Trash size={verticalScale(24)} color={colors.white} weight='bold' />
    </Button>
  )}
  <Button onPress={onsubmit} loading={isloading}  style={{flex:1,}}>
    <Typo fontWeight={"600"} color={colors.neutral800}>{oldWallet.id?'Update Wallet':'Add Wallet'}</Typo>
  </Button>
</View>
    </ModalWrapper>
  )
}

export default WalletModal;

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'space-between',
    paddingHorizontal:spacingX._20
  },footer:{
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row',
    gap:scale(12),
    paddingHorizontal:spacingX._20,
    paddingTop:spacingY._15,
    borderTopColor:colors.neutral700,
    marginBottom:spacingY._5,
    borderTopWidth:1,

  }
    , form:{
    marginTop:spacingY._15,
    gap:spacingY._30
   }, avatarContainer:{
        position:'relative',
        alignSelf:'center',
    },avatar:{
alignSelf:'center',
width:verticalScale(135),
height:verticalScale(135),
borderRadius:200,
backgroundColor:colors.neutral300,
borderWidth:1,
borderColor:colors.neutral500
    },
   editIcon:{
position:'absolute',
bottom:spacingY._5,
right:spacingY._7,
borderRadius:100,
backgroundColor:colors.neutral100,
shadowColor: colors.black,
shadowOffset: {
    width: 0,
    height: 0,
   },
shadowOpacity: 0.25,
shadowRadius: 10,
elevation: 5,
padding:spacingY._7
},
    InputContainer:{
        gap:spacingY._10
    }
})