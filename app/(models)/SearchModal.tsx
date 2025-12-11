import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import TransectionList from '@/components/TransectionList'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authcontext'
import useFetchData from '@/hooks/useFetchData'
import { TransactionType } from '@/types'
import { scale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import { limit, orderBy, where } from 'firebase/firestore'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
const SearchModal = () => {
  const {user} = useAuth();
  const [isloading, setIsLoading] = useState(false);
 const router = useRouter();
 const [search, setSearch]= useState("")
const constraints=[
  where("uid","==",user?.uid),
  orderBy('date',"desc"),
  limit(30)
];
const {data :alltransactions,loading,error} =useFetchData<TransactionType>("transactions",constraints)
const filteredTransactions = alltransactions.filter((item) => {
  const searchLower = search.toLowerCase();
  return (
    (item.category && item.category.toLowerCase().includes(searchLower)) ||
    (item.description && item.description.toLowerCase().includes(searchLower)) ||
    (item.type && item.type.toLowerCase().includes(searchLower))
  );
})
  return (
    <ModalWrapper style={{backgroundColor:colors.neutral900}}>
    <View style={styles.container} >
<Header title={'Search'} leftIcon={<BackButton iconSize={24}/>} style={{marginBottom:spacingY._10}} />  
 {/*Form  */}
 <ScrollView contentContainerStyle={styles.form} >
  
    <View style={styles.InputContainer}>
      {/* Input fields would go here */}
      <Typo color={colors.neutral200}>Search Input</Typo>
      <Input
        placeholder="Enter to Search"
        value={search}
        placeholderTextColor={colors.neutral400}
        containerStyle={{ backgroundColor:colors.neutral800}}
        onChangeText={(text) => setSearch(text)}
      />
      
    </View>
    <View>
      <TransectionList data={filteredTransactions} loading={loading} emptyListMessage='No Transaction Matched' />
    </View>

 </ScrollView >
</View> 

    </ModalWrapper>
  )
}

export default SearchModal;

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'space-between',
    paddingHorizontal:spacingX._20
  },
  footer:{
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
    },
    InputContainer:{
             
        gap:spacingY._10
    }
})