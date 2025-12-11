import { expenseCategories, incomeCategory } from '@/constants/data'
import { colors, radius, spacingY } from '@/constants/theme'
import { TransactionItemProps, TransactionListType, TransactionType } from '@/types'
import { verticalScale } from '@/utils/styling'
import { FlashList } from "@shopify/flash-list"
import { useRouter } from 'expo-router'
import { Timestamp } from 'firebase/firestore'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Loading from './Loading'
import Typo from './Typo'



const TransectionList = ({
  data, title, loading,
  emptyListMessage
}: TransactionListType) => {
  const router= useRouter()
  const handleClick = (item: TransactionType) => {
    router.push({
      pathname:"/(models)/TransactionModal",
     params:{
      id:item!.id,
      type:item.type,
      amount:item.amount,
      category:item?.category,
      date:(item.date as Timestamp).toDate().toISOString(),
      description:item?.description,
      image:item?.image,
      uid:item.uid,
      walletId:item.walletId
     }
    })
}
  return (
    <View style={styles.container}>
      {title && (
        <Typo size={20} fontWeight="500">
          {title}
        </Typo>
      )}

      <View style={styles.list}>
        <FlashList
          data={data}
          renderItem={({ item, index }) =>
            <TransactionItem item={item} index={index} handleClick={handleClick} />
          }
        />
      </View>

      {!loading && data.length === 0 && (
        <Typo size={16} color={colors.neutral500}
          style={{ textAlign: "center", marginTop: spacingY._15 }}>
          {emptyListMessage || 'No transactions available.'}
        </Typo>
      )}

      {loading && <Loading size={50} />}
    </View>
  )
}

export default TransectionList

const TransactionItem = ({ item, index, handleClick }: TransactionItemProps) => {

  const category = item.type==="income"? incomeCategory:expenseCategories[item.category!]
  const IconComponent = category.icon;

  // Color logic
  const isIncome = item.type === "income";
  const amountColor = isIncome ? colors.green : colors.rose;

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).damping(100)}>
      <TouchableOpacity onPress={() => handleClick(item)} style={styles.row}>

        {/* Icon */}
        <View style={[styles.icon, { backgroundColor: category.bgColor }]}>
          {IconComponent && (
            <IconComponent
              size={verticalScale(25)}
              weight="fill"
              color={colors.white}
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.categoryDes}>
          <Typo size={17}>{isIncome?"Income":category.label}</Typo>
          <Typo size={14} color={colors.neutral400} textProps={{ numberOfLines: 1 }}>
            {item?.description || "No description"}
          </Typo>
        </View>

        {/* Amount + Date */}
        <View style={styles.amountDate}>
          <Typo size={16} fontWeight="500" color={amountColor}>
            {isIncome ? '+' : '-'}${(item.amount || 0).toFixed(2)}
          </Typo>

          <Typo size={14} color={colors.neutral400}>
            {item.date
              ? (item.date as Timestamp).toDate().toLocaleDateString("en-GB",{
                day:"numeric",
                month:"short"
              })
              : "No date"}
          </Typo>
        </View>

      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacingY._17 },
  list: { minHeight: 3 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacingY._12,
    marginBottom: spacingY._12,
    paddingHorizontal: spacingY._10,
    padding: spacingY._10,
    backgroundColor: colors.neutral800,
    borderRadius: radius._17,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._12,
    borderCurve: "continuous",
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: "flex-end",
    gap: 3,
  },
})
