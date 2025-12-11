  import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authcontext";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

  const Login = () => {
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [isloading,setisLoading]=useState(false)
    const router = useRouter();
    const {login:userLogin}= useAuth();
  const HandleSubmit= async()=>{
if(!emailRef.current|| !passwordRef.current){
Alert.alert('Login','please fill the fields');
return;
}
setisLoading(true)
const response= await userLogin(
  emailRef.current,
  passwordRef.current
);
if(!response.success){
  Alert.alert('Login',response.msg);
  setisLoading(false)
  return;
}
setisLoading(false)
router.replace('/(tabs)')
  }
  const handleRoute=()=>{
  router.replace('/(auth)/register')
  }
    return (
      <ScreenWrapper style={{        paddingHorizontal:spacingX._20
}}>
        <View>
          <BackButton iconSize={28} />
          <View style={{ gap: 15, marginTop: spacingY._20 }}>
            <Typo size={30} fontWeight={"800"}>
              Hy,
            </Typo>
            <Typo
              size={30}
              fontWeight={"800"}
            >
              Welcome Back
            </Typo>
             <Typo size={16} color={colors.textLight}>
              Login now to track all your expanses
            </Typo>
         
          {/* form */}
          <View style={styles.form}>
            <Input
              onChangeText={(value) => {
                emailRef.current = value;
              }}
              placeholder="Enter your Email"
              icon={
                <Icons.At
                  size={verticalScale(26)}
                  color={colors.neutral300}
                  weight="fill"
                />
              }
            />
            <Input
              onChangeText={(value) => {
                passwordRef.current = value;
              }}
              secureTextEntry
              placeholder="Enter your Password"
              icon={
                <Icons.Lock
                  size={verticalScale(26)}
                  color={colors.neutral300}
                  weight="fill"
                />
              }
            />
            <Typo size={14} color={colors.text} style={{alignSelf:"flex-end"}}>
              Forgot Password?
            </Typo>

            <Button loading={isloading} onPress={HandleSubmit}>
              <Typo size={21} fontWeight={"700"} color={colors.neutral900}>Login</Typo>
            </Button>
          </View>
           </View>
          {/* footer */}
          <View style={styles.footer}>
  <Typo size={15}>Don't have an account?</Typo>
  <Pressable onPress={handleRoute}>
    <Typo size={15} style={{textDecorationLine:"underline"}} fontWeight={"700"} color={colors.primary}>Signup</Typo>
  </Pressable>
          </View>
        </View>
      </ScreenWrapper>
    );
  };

  export default Login;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral900,
      justifyContent: "center",
      gap: spacingY._30,
      paddingHorizontal: spacingX._20,
    },

    title: {
      fontSize: verticalScale(20),
      fontWeight: "bold",
      color: colors.text,
    },

    form: {
      marginTop:spacingY._20,
      gap: spacingY._20,
    },
  forgotPassword:{
    textAlign:"right",
    fontWeight:"500",
    color:colors.text
    
  },
  footer:{
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap:5,
    marginTop:spacingY._12
  },
  footerText:{
    textAlign:'center',
    color:colors.text,
    fontSize:verticalScale(15)
  }

  });
