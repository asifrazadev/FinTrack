import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { auth } from '@/config/firebase'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authcontext'
import { accountOptionType } from '@/types'
import { verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { signOut } from 'firebase/auth'
import * as Icon from 'phosphor-react-native'
import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { getprofileImageUrl } from '../../services/ImageService'
const Profile = () => {

  const handleLogout =async() => {
await signOut(auth);
  }
  const showLogoutAlert = () => {
Alert.alert("Log Out","Are you sure you want to log out?",[{
    text:"Cancel",
    style:'cancel',
    onPress:()=>{
      console.log("Cancel Pressed")
    },
}
,{
    text:"Log Out",
     style:'destructive',
    onPress:()=>handleLogout()
   
}])
  }
  const HandlePress = (option:any) =>{
if(option.title==='Log Out'){
showLogoutAlert();}
if(option.routeName){
  router.push(option.routeName);
}}
  const {user} = useAuth();
  const accountOptions:accountOptionType[]=[{
    title:'Edit Profile',
    icon:(<Icon.User size={26} color={colors.white} weight='fill' />),
    bgColor:'#6366f1',
    routeName:'/(models)/ProfileModal'
  },{
    title:'Settings',
    icon:(<Icon.GearSix size={26} color={colors.white} weight='fill' />),
    bgColor:'#059669',
    // routeName:'/(models)/EditProfile'
  },{
    title:'Privacy Policy',
    icon:(<Icon.Lock size={26} color={colors.white} weight='fill' />),
    bgColor:colors.neutral600,
    // routeName:'/(models)/EditProfile'
  },
{
    title:'Log Out',
    icon:(<Icon.Power size={26} color={colors.white} weight='fill' />),
    bgColor:'#e11d',
    // routeName:'/(models)/EditProfile'
  }]
  return (
    <ScreenWrapper>
<View style={styles.container}> 
  <Header title='Profile' style={{marginVertical:spacingY._12}} leftIcon={<BackButton iconSize={22} />}/>
<View style={styles.userInfo}>
    <View style={styles.avatarContainer}>
<Image
source={getprofileImageUrl(user?.image)}
style={styles.avatar}
contentFit='cover'
transition={100}
/>
    </View>
    <View style={styles.nameContainer}>
      <Typo size={24} fontWeight='600' color={colors.neutral300}>{user?.name}</Typo>
    </View>
    <View style={styles.nameContainer}>
      <Typo size={15}  color={colors.neutral300}>{user?.email}</Typo>
    </View>
</View>
<View style={styles.accountOptions}>
  {accountOptions.map((option, index)=>(
    <Animated.View key={index} entering={FadeInDown.delay(100*index).springify().damping(100)} style={styles.listItem}>
      <TouchableOpacity onPress={()=>HandlePress(option)} style={styles.flexROw}>
        <View style={[styles.ListIcon,{backgroundColor:option.bgColor}]}>
          {option.icon}
        </View>
        <Typo size={16} fontWeight='500' style={{flex:1}}>{option.title}</Typo>
        <Icon.CaretRight size={verticalScale(20)} weight='bold' color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  ))}
</View>

  </View> 
  
     </ScreenWrapper>
  )
}

export default Profile

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizontal: spacingX._20
  },
  userInfo:{
    marginTop:verticalScale(30),
    alignItems:'center',
    gap:spacingY._15
  },
  avatarContainer:{
    position:'relative',
    alignSelf:'center',
  },
  avatar:{
    alignSelf:'center',
    width:verticalScale(135),
    height:verticalScale(135),
    borderRadius:200,
    backgroundColor:colors.neutral300
  },
  editIconContainer:{
    position:'absolute',
    bottom:0,
    right:0,
    backgroundColor:colors.neutral500,
    padding:verticalScale(8),
    borderRadius:50,
    borderWidth:2,
  },
  nameContainer:{
    alignItems:'center',
    gap:verticalScale(5)
  },
  ListIcon:{
    height:verticalScale(44),
    width:verticalScale(44),
    backgroundColor:colors.neutral500,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:radius._15,
  borderCurve:'continuous'
 },
  listItem:{
   marginBottom:verticalScale(17),
  },
  accountOptions:{
    marginTop:spacingY._40,
  },
  flexROw:{
    flexDirection:"row",
    alignItems:'center',
    gap:spacingX._10
  },
})