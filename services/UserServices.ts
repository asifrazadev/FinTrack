import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore";

export const updateUserProfile = async (uui:string|undefined, data:UserDataType)
:Promise<ResponseType> => {
    try {
        if(!uui){
            return {
                success:false,
                msg:'User not authenticated'
            }
        }
        const userRef = doc(firestore,'users',uui);
        await updateDoc(userRef,data);
        return {
            success:true,
            msg:'Profile updated successfully'
        }
        
    } catch (error:any) {
        console.log("UPDATE USER PROFILE ERROR:", error);
        return {
            success:false,
            msg:error?.message || 'An error occurred while updating profile'
        }
        
    }
}