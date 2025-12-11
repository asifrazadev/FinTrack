import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { uploadImageToCloudinary } from "./ImageService";

export const createOrUpdateWallet= async(Walletdata:Partial<WalletType>) : Promise<ResponseType> =>{

try {
    let WallettoSave ={...Walletdata}
  // If user selected new image → upload to Cloudinary
  if (WallettoSave.image?.uri) {
    WallettoSave.image = await uploadImageToCloudinary(WallettoSave.image.uri);
  }
  if(!Walletdata?.id){
    WallettoSave.amount=0;
    WallettoSave.totalExpenses=0
    WallettoSave.totalIncome=0;
    WallettoSave.created=new Date()
  }
  
    const walletRef = Walletdata?.id ? doc(firestore,"wallets",Walletdata.id):
    doc(collection(firestore,"wallets"))
await setDoc(walletRef,WallettoSave,{merge:true})
return {success:true,data:{...WallettoSave,id:walletRef.id},msg:"wallet saved"}

} catch (error:any) {

    const msg = error.message ||"error"
    return {success:false,msg}
    
}
}

export const deleteWallet= async(walletId:string) : Promise<ResponseType> =>{

  try {

      const walletRef = doc(firestore,"wallets",walletId)
      // delete all transactions associated with this wallet 
      const transactionsSnapshot = await getDocs(query(collection(firestore, "transactions"), where("walletId", "==", walletId)));
      const deletePromises = transactionsSnapshot.docs.map((transactionDoc) => deleteDoc(transactionDoc.ref));
      await Promise.all(deletePromises);
      await deleteDoc(walletRef)
  return {success:true,msg:"wallet deleted"}
  } catch (error:any) {

      const msg = error.message ||"Failed to Delete wallet"
      return {success:false,msg}
  }
  }