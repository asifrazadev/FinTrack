import { colors, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Icons from "phosphor-react-native";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
function CustomTabs({ state, descriptors, navigation }: BottomTabBarProps) {
  const TabBarIcons:any = {
    index: (isFocused: boolean) => (
      <Icons.House
        size={verticalScale(24)}
        color={isFocused ? colors.primary : colors.text}
        weight={isFocused ? "fill" : "regular"}
      />
    ),
wallet : (isFocused: boolean) => (
      <Icons.Wallet
        size={verticalScale(24)}
        color={isFocused ? colors.primary : colors.text}
        weight={isFocused ? "fill" : "regular"}
      />
    ),
    statistics: (isFocused: boolean) => (
      <Icons.ChartBar
        size={verticalScale(24)}
        color={isFocused ? colors.primary : colors.text}
        weight={isFocused ? "fill" : "regular"}
      />
    ),
    profile: (isFocused: boolean) => (
      <Icons.User
        size={verticalScale(24)}
        color={isFocused ? colors.primary : colors.text}
        weight={isFocused ? "fill" : "regular"}
      />
    ),
  };
  return (
    <View style={styles.barContainer}>
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label: string =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
          key={route.name}
            //      href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItem}
          >
            {
                TabBarIcons[route.name]  && TabBarIcons[route.name](isFocused) 
            }
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default CustomTabs;

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    width: "100%",
    height: Platform.OS === "ios" ? verticalScale(73) : verticalScale(55),
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.neutral800,
    borderTopColor: colors.neutral700,
  },
  tabBarItem: {
    marginBottom: Platform.OS === "ios" ? spacingY._10 : spacingY._5,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(10),
  },
});
