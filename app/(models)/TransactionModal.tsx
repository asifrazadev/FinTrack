import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Header from '@/components/Header';
import ImageUplaod from '@/components/ImageUplaod';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import Typo from '@/components/Typo';
import DateTimePicker from '@react-native-community/datetimepicker';

import { expenseCategories, transactionTypes } from '@/constants/data';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/context/authcontext';
import useFetchData from '@/hooks/useFetchData';

import { TransactionType, WalletType } from '@/types';

import { scale, verticalScale } from '@/utils/styling';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { orderBy, where } from 'firebase/firestore';
import * as Icons from 'phosphor-react-native';

import { createandUpdateTransaction, deleteTransaction } from '@/services/TransactionService';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';


type paramType={
         id:string,
        type:"income"|"expense",
        amount:string,
        category?:string,
        date:string,
        description?:string,
        image?:any,
        uid?:string,
        walletId:string
}

const TransactionModal = () => {
  const router = useRouter();
  const { user } = useAuth();

  const oldTransaction: paramType = useLocalSearchParams()
  const [isLoading, setIsLoading] = useState(false);
const [showDatePicker, setShowDatePicker] = useState(false);
  const [Transaction, setTransaction] = useState<TransactionType>({
    type: 'expense',
    amount: 0,
    category: '',
    date: new Date(),
    walletId: '',
    image: null,
    description: '',
    uid: user?.uid
  });
  // fetch wallets
  const { data: wallets } = useFetchData<WalletType>('wallets', [
    where('uid', '==', user?.uid),
    orderBy('created', 'desc')
  ]);

  // Load old transaction when editing
  useEffect(() => {
    if (oldTransaction?.id) {
setTransaction({
   type: oldTransaction.type,
    amount: Number(oldTransaction.amount),
    category: oldTransaction.category,
    date:new Date(oldTransaction.date),
    walletId: oldTransaction.walletId,
    image: oldTransaction.image,
    description: oldTransaction.description||"",
    uid: oldTransaction.uid
})
    }
  }, []);


  const onSubmit = async () => {
   const { type, amount, walletId, date, description,category,image } = Transaction;
    if ((type == 'expense' && !category) || !amount || !walletId || !date ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if(oldTransaction.id) Transaction.id=oldTransaction.id;
      setIsLoading(true);
      Transaction.image=Transaction.image?Transaction.image:null;
  const res = await createandUpdateTransaction(Transaction);

    setIsLoading(false);
    if(res.success){
      router.back()
    } else{
      Alert.alert("transaction",res.msg)
    }
  };


  const confirmDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete
        }
      ]
    );
  };

  const onDateChange = (event:any, selectedDate?:Date) => {
const currentDate = selectedDate || (Transaction.date as Date);
setTransaction({...Transaction, date:currentDate});
setShowDatePicker(Platform.OS ==='ios'? true:false);
}
  const onDelete = async () => {
    if (!oldTransaction.id) return;

    setIsLoading(true);
     const res = await deleteTransaction(oldTransaction.id,oldTransaction.walletId);
    setIsLoading(false);

    if (res.success) {
      Alert.alert('Deleted', res.msg);
      router.back();
    } else {
      Alert.alert('Error', res.msg);
    }
  };


  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldTransaction.id ? 'Update Transaction' : 'New Transaction'}
          leftIcon={<BackButton iconSize={24} />}
          style={{ marginBottom: spacingY._10 }}
        />

        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >


          {/* Transaction Type */}
          <View style={styles.InputContainer}>
            <Typo color={colors.neutral200}>Transaction Type</Typo>
            <Dropdown 
              style={styles.dropDownContainer}
              activeColor={colors.neutral800}
              containerStyle={styles.dropDownListContainer}
              itemContainerStyle={styles.dropDownItemContainer}
              placeholderStyle={styles.dropDownPlaceholder}
              selectedTextStyle={styles.dropDownSelectedText}
              itemTextStyle={styles.dropDownText}
              data={transactionTypes}
              labelField="label"
              valueField="value"
              value={Transaction.type}
              onChange={(item) =>
                setTransaction({ ...Transaction, type: item.value })
              }
            />
          </View>

          {/* Wallet selection */}
          <View style={styles.InputContainer}>
            <Typo color={colors.neutral200}>Wallet</Typo>
            <Dropdown
              style={styles.dropDownContainer}
              activeColor={colors.neutral800}
              containerStyle={styles.dropDownListContainer}
              itemContainerStyle={styles.dropDownItemContainer}
              placeholderStyle={styles.dropDownPlaceholder}
              selectedTextStyle={styles.dropDownSelectedText}
              itemTextStyle={styles.dropDownText}
              data={wallets?.map((w) => ({
                label: `${w.name} ($${w.amount})`,
                value: w.id
              }))}
              placeholder="Select Wallet"
              labelField="label"
              valueField="value"
              value={Transaction.walletId}
              onChange={(item) =>
                setTransaction({ ...Transaction, walletId: item.value })
              }
            />
          </View>

          {/* Expense Category (only if expense) */}
          {Transaction.type === 'expense' && (
            <View style={styles.InputContainer}>
              <Typo color={colors.neutral200}>Expense Category</Typo>
              <Dropdown
                style={styles.dropDownContainer}
                activeColor={colors.neutral800}
                containerStyle={styles.dropDownListContainer}
                itemContainerStyle={styles.dropDownItemContainer}
                placeholderStyle={styles.dropDownPlaceholder}
                selectedTextStyle={styles.dropDownSelectedText}
                itemTextStyle={styles.dropDownText}
                data={Object.values(expenseCategories)}
                placeholder="Expense Category"
                labelField="label"
                valueField="value"
                value={Transaction.category}
                onChange={(item) =>
                  setTransaction({ ...Transaction, category: item.value })
                }
              />
            </View>
          )}

          {/* Amount */}
          <View style={styles.InputContainer}>
            <Typo color={colors.neutral200}>Amount</Typo>
            <Input
              keyboardType="numeric"
              placeholder="Enter amount"
              value={Transaction.amount.toString()}
              onChangeText={(val) =>
                setTransaction({ ...Transaction, amount: Number(val) })
              }
            />
          </View>

          {/* Description */}
          <View style={styles.InputContainer}>
            <View style={styles.flexRow}><Typo color={colors.neutral200}>Description</Typo>
            <Typo color={colors.neutral400} size={12} >
              (Optional)
            </Typo>
            </View>
            <Input
            multiline
            containerStyle={{
              flexDirection:'row',
              height:verticalScale(100),
              alignItems:'flex-start',
              paddingVertical:15,
            }}
              placeholder="Optional description"
              value={Transaction.description}
              onChangeText={(text) =>
                setTransaction({ ...Transaction, description: text })
              }
            />
          </View>

          {/* Date Picker */}
          <View style={styles.InputContainer}>
            <Typo color={colors.neutral200}>Transaction Date</Typo>
          {!showDatePicker && (
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Typo>
                {(Transaction.date as Date).toLocaleDateString()}
              </Typo>
            </TouchableOpacity>
          )}
          {showDatePicker && (
            <View style={Platform.OS =="ios"&& styles.iosDatePicker}>
              <DateTimePicker
              themeVariant='dark'
                value={Transaction.date as Date}
                textColor={colors.white}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
                onChange={onDateChange}
              />
              {Platform.OS ==='ios' && (
                <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Typo fontWeight={'500'} size={15} color={colors.white}>Done</Typo>
              </TouchableOpacity>
              )}
            </View>
          )}

          </View>

          {/* Image Upload */}
          <View style={styles.InputContainer}>
            <View style={styles.flexRow} >

            <Typo color={colors.neutral200}>Transaction Icon</Typo>
              <Typo color={colors.neutral400} size={12} >
              (Optional)
            </Typo>
            </View>
            <ImageUplaod
              file={Transaction.image}
              onClear={() =>
                setTransaction({ ...Transaction, image: null })
              }
              onSelect={(file) =>
                setTransaction({ ...Transaction, image: file })
              }
            />
          </View>
        </ScrollView>
      </View>


      {/* Footer Buttons */}
      <View style={styles.footer}>
        {oldTransaction?.id && (
          <Button
            onPress={confirmDelete}
            style={{
              backgroundColor: colors.rose,
              paddingHorizontal: spacingX._15
            }}
          >
            <Icons.Trash
              size={verticalScale(24)}
              color={colors.white}
              weight="bold"
            />
          </Button>
        )}

        <Button onPress={onSubmit} loading={isLoading} style={{ flex: 1 }}>
          <Typo fontWeight="600" color={colors.neutral800}>
            {oldTransaction.id ? 'Update ' : 'Submit'}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  form: {
    gap: spacingY._20,
    paddingBottom:spacingY._40,
    paddingVertical:spacingY._15
  },
  dateInput:{
    flexDirection:'row',
    alignItems:'center',
height:verticalScale(54),
    borderWidth:1,
  borderColor:colors.neutral300,
    borderRadius:radius._17,
    paddingHorizontal:spacingX._15,
    borderCurve:'continuous',
  },
  footer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:scale(12),
    paddingVertical:spacingY._20,
    paddingTop:spacingY._15,
    borderTopColor:colors.neutral700,
    marginBottom:spacingY._5,
    borderTopWidth:1,
  },
  InputContainer:{
    gap:spacingY._10,
  },
  
  iosDropDown:{
    borderWidth:1,
    borderColor:colors.neutral300,
    flexDirection:'row',
    height:verticalScale(54),
    alignItems:'center',
    justifyContent:'center',
    fontSize:verticalScale(16),
    borderRadius:radius._17,
    paddingHorizontal:spacingX._15,
borderCurve:'continuous',
  },
  androidDropDown:{
    height:verticalScale(54),
    alignItems:'center',
    justifyContent:'center',
    borderWidth:1,
    fontSize:verticalScale(16),
    color:colors.white,
    borderColor:colors.neutral300,
    borderRadius:radius._17,
  //  paddingHorizontal:spacingX._15,
    borderCurve:'continuous', 
  },
  flexRow:{
    flexDirection:'row',
    gap:spacingX._5,
    alignItems:'center',
  },
  iosDatePicker:{

  },
  datePickerButton:{
   backgroundColor:colors.neutral700,
   alignSelf:'flex-end',
   padding:spacingY._7,
   borderRadius:radius._10,
   marginRight:spacingX._7,
   paddingHorizontal:spacingX._15,
  },
  dropDownContainer:{
    height:verticalScale(54),
    borderWidth:1,
    borderColor:colors.neutral300,
    paddingHorizontal:spacingX._15,
    borderRadius:radius._15,
    borderCurve:'continuous',
  },
  dropDownText:{color:colors.white},
  dropDownSelectedText:{color:colors.white,
    fontSize:verticalScale(16)
  },
  dropDownListContainer:{
    backgroundColor:colors.neutral900,
    borderRadius:radius._15,
    borderCurve:'continuous',
    top:5,
    borderColor:colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: {
        width: 0,
        height: 5,
        },

    shadowOpacity:1,
    shadowRadius: 15,
    elevation: 10,
  },
  dropDownPlaceholder:{color:colors.white},
  dropDownItemContainer:{
    borderRadius:radius._15,
    marginHorizontal:spacingX._7,
  },
  dropDownIcon:{
    height:verticalScale(30),
    tintColor:colors.neutral300,
  }
  });