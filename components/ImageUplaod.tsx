// ...existing code...
import { colors, radius } from "@/constants/theme";
import { getFilePath } from "@/services/ImageService";
import { ImageUploadProps } from "@/types";
import { scale, verticalScale } from "@/utils/styling";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Icons from "phosphor-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Typo from "./Typo";

const ImageUplaod = ({
  file = null,
  onSelect = (file: any) => {},
  onClear = () => {},
  containerStyle,
  imageStyle,
  placeholder = "image",
}: ImageUploadProps) => {
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // use MediaTypeOptions for older expo-image-picker versions
        // keep a fallback for newer API if available
        // @ts-ignore
        mediaTypes:
          // prefer MediaTypeOptions (older versions), fallback to MediaType when available
          (ImagePicker as any).MediaTypeOptions?.Images ??
          (ImagePicker as any).MediaType?.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      // Handle both old and new result shapes:
      // New: { canceled: boolean, assets: [{...}] }
      // Old: { cancelled: boolean, uri: string }
      const r: any = result;
      if ("canceled" in r) {
        if (!r.canceled) {
          const asset = r.assets?.[0];
          if (asset) onSelect(asset);
        }
      } else if ("cancelled" in r) {
        if (!r.cancelled) {
          // older API returns a single uri
          onSelect({ uri: r.uri });
        }
      } else {
        // fallback: if assets exist or uri exist
        if (r.assets?.length) onSelect(r.assets[0]);
        else if (r.uri) onSelect({ uri: r.uri });
      }
    } catch (error) {
      console.log("IMAGE PICK ERROR:", error);
    }
  };

  return (
    <View>
      {!file && (
        <TouchableOpacity
          style={[styles.container, containerStyle]}
          onPress={pickImage}
        >
          <Icons.UploadSimple color={colors.neutral200} />
          {placeholder && <Typo size={15}>{placeholder}</Typo>}
        </TouchableOpacity>
      )}
      {file && (
        <TouchableOpacity onPress={onClear}>
          <View style={[styles.image, imageStyle]}>
            <Image
              style={{
                flex: 1,
              }}
              source={getFilePath(file)}
              contentFit="cover"
              transition={100}
            />
            <TouchableOpacity
              style={[styles.deleteIcon]}
              onPress={onClear}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icons.XCircle
                size={24}
                color={colors.white}
                style={{ margin: -3, padding: 0 }}
                weight="fill"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ImageUplaod;

const styles = StyleSheet.create({
  container: {
    height: verticalScale(54),
    backgroundColor: colors.neutral700,
    borderRadius: radius._15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.neutral500,
    borderStyle: "dashed",
  },
  image: {
    height: scale(150),
    width: scale(150),
    borderRadius: radius._15,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  deleteIcon: {
    position: "absolute",
    right: scale(6),
    top: scale(6),

    backgroundColor: colors.black,
    borderRadius: radius._15,
    borderWidth: 0,
    shadowColor: colors.black,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
    padding: 0,
    margin: 0,
    width: 18,
  },
});