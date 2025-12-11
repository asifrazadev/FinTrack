import { CustomButtonProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { colors, radius } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Loading from './Loading'
const Button = ({
    style,
    onPress,
    loading=false,
    children
}:CustomButtonProps) => {
    if(loading){
        return (
<View style={[styles.Button,style,{backgroundColor:'transparent'}]}>
<Loading/>
</View>
        )
    }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.Button,style]}>
      <Text>{children}</Text>
    </TouchableOpacity>
  )
}

export default Button

const styles = StyleSheet.create({
    Button:{
backgroundColor:colors.primary,
borderRadius:radius._17,
borderCurve:"continuous",
height:verticalScale(52),
justifyContent:'center',
alignItems:"center",
    }
})