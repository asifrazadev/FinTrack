import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authcontext'
import { getprofileImageUrl, uploadImageToCloudinary } from '@/services/ImageService'
import { updateUserProfile } from '@/services/UserServices'
import { UserDataType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import * as Icon from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

const ProfileModal = () => {
  const {user,updateUserData} = useAuth();
  const [userData, setUserData] = useState<UserDataType>({
    name:'',
    image:null
  });
  const [localImage, setLocalImage] = useState<string | null>(null);  // picked image but not uploaded yet
  const [isloading, setIsLoading] = useState(false);
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        image: user.image || null,
      });
    }

  }, [user]);
 const pickImage = async () => {
  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);  // only preview
    }
  } catch (error) {
    console.log("IMAGE PICK ERROR:", error);
  }
};


  const onsubmit = async () => {
  if (!userData.name.trim()) {
    Alert.alert("User", "Name cannot be empty");
    return;
  }

  setIsLoading(true);

  let uploadedUrl = userData.image; // keep old image if user didn't pick new

  // If user selected new image → upload to Cloudinary
  if (localImage) {
    uploadedUrl = await uploadImageToCloudinary(localImage);
  }

  const finalUser = {
    name: userData.name,
    image: uploadedUrl,
  };

 const res = await updateUserProfile(user!.uid, finalUser);
  if (res.success) {
    // Update user data in context
    updateUserData(user?.uid as string); 
    Alert.alert("Success", res.msg);
  } else {
    Alert.alert("Error", res.msg);
  }

  setIsLoading(false);
};

  return (
    <ModalWrapper>
    <View style={styles.container} >
<Header title='Edit Profile' leftIcon={<BackButton iconSize={24}/>} style={{marginBottom:spacingY._10}} />  
 {/*Form  */}
 <ScrollView contentContainerStyle={styles.form} >
  <View style={styles.avatarContainer}>
    {/* Avatar Image */}
    <Image
      source={getprofileImageUrl(userData.image)}
      style={styles.avatar}
      contentFit="cover"
      transition={100}
    />
    <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
    <Icon.PencilSimple size={verticalScale(20)} color={colors.neutral800} />
    </TouchableOpacity>
    </View>
    <View style={styles.InputContainer}>
      {/* Input fields would go here */}
      <Typo color={colors.neutral200}>Name</Typo>
      <Input
        placeholder="Enter your name"
        value={userData.name}
        onChangeText={(text) => setUserData({ ...userData, name: text })}
      />
    </View>
   
 </ScrollView>
</View> 
<View style={styles.footer}>
  <Button onPress={onsubmit} loading={isloading}  style={{flex:1,}}>
    <Typo fontWeight={"600"} color={colors.neutral800}>Save Changes</Typo>
  </Button>
</View>
    </ModalWrapper>
  )
}

export default ProfileModal

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