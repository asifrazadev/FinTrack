import Header from '@/components/Header'
import Loading from '@/components/Loading'
import ScreenWrapper from '@/components/ScreenWrapper'
import TransectionList from '@/components/TransectionList'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authcontext'
import { getChartDataByUid } from '@/services/TransactionService'
import { scale, verticalScale } from '@/utils/styling'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { BarChart } from "react-native-gifted-charts"

const Statistic = () => {
  const [Index, setIndex] = useState(0)
  const [Transaction, setTransaction] = useState<any>([])
  const [ChartLoading, setChartLoading] = useState(false)
  const { user } = useAuth()
  const [chartData, setChartData] = useState<any>([])
    const isFocused = useIsFocused();
  
  useEffect(() => {
    fetchStatsByIndex(Index)
  }, [Index,user?.uid,isFocused])

const fetchStatsByIndex = async (index: number) => {
  if (!user?.uid) return;

  setChartLoading(true);
  setChartData([]); // clear previous chart data
  setTransaction([]);

  let period: "weekly" | "monthly" | "yearly" = "weekly";
  if (index === 1) period = "monthly";
  else if (index === 2) period = "yearly";

  const res = await getChartDataByUid(user.uid, period);

  setChartLoading(false);

  if (res.success && res.stats && res.transactions) {
    setChartData(res.stats.map(d => ({ ...d })));
    setTransaction(res.transactions.map(t => ({ ...t })));
  } else {
    // Optional: clear chart if fetch failed
    setChartData([]);
    setTransaction([]);
  }
};



  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title='Statistic' />
        </View>
        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            paddingBottom: verticalScale(100)
          }}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            values={['Weekly', 'Monthly', 'Yearly']}
            selectedIndex={Index}
            onChange={(event) => setIndex(event.nativeEvent.selectedSegmentIndex)}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance='dark'
            activeFontStyle={styles.segmentFontStyle}
            style={styles.segmentStyle}
            fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
          />

          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                barWidth={scale(12)}
                spacing={[1, 2].includes(Index) ? scale(25) : scale(16)}
                roundedTop
                hideRules
                yAxisLabelPrefix='$'
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisLabelWidth={[1, 2].includes(Index) ? scale(38) : scale(35)}
                yAxisTextStyle={{ color: colors.neutral350 }}
                xAxisLabelTextStyle={{ color: colors.neutral350, fontSize: verticalScale(12) }}
                noOfSections={3}
                minHeight={5}
                isAnimated
                animationDuration={1000}
                scrollAnimation
              />
            ) : (
              <View style={styles.noCharts}></View>
            )}

            {ChartLoading && <Loading />}
          </View>

          {/* Transactions */}
          <View>
            <TransectionList
              data={Transaction}
              emptyListMessage='No transaction found'
              title='Transactions'
            />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default Statistic

const styles = StyleSheet.create({
  header: {},
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartLoadingContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: radius._12,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  noCharts: {
    height: verticalScale(210),
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  segmentStyle: {
    height: scale(37)
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black
  },
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10
  }
})
