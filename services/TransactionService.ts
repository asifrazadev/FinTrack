import { firestore } from "@/config/firebase";
import { TransactionType, WalletType } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { uploadImageToCloudinary } from "./ImageService";
import { createOrUpdateWallet } from "./walletService";

// MAIN FUNCTION
export const createandUpdateTransaction = async (
  transactionData: Partial<TransactionType>
) => {
  try {
    const { type, id, walletId, amount, image } =
      transactionData;
    if (!amount || amount <= 0 || !type || !walletId) {
      return { success: false, msg: "Invalid transaction data" };
    }


    if(id){
      const oldTransaction =await getDoc(doc(firestore,"transactions",id));
      const data =  oldTransaction.data() as TransactionType;

      const shouldRevertOrg =data.type!==type|| data.amount !== amount||data.walletId !== walletId;
   

      if(shouldRevertOrg){
        let res = await revertAndUpdateWallets(data,Number(amount),type,walletId)
        if(!res.success) res;
      }

    }else{
let res = await UpdateWalletForNewTransaction(walletId,Number(amount),type)
if(!res.success){
  return res
  
}
    }
        // upload new image only (image.uri exists on picked images)
    let uploadedUrl = image;
    if (image && typeof image == "object" && image.uri) {
      uploadedUrl = await uploadImageToCloudinary(image.uri);
      transactionData.image= uploadedUrl
    }

    const TransactionRef = id?doc(firestore,"transactions", id):
    doc(collection(firestore,"transactions"))
    
    await setDoc(TransactionRef,transactionData,{merge:true})
    return { success: true, msg: "Transaction created successfully" };
  } catch (error: any) {
    const msg = error.message || "Failed to create or update transaction";
    return { success: false, msg };
  }
};

const UpdateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: "income" | "expense"
) => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnap = await getDoc(walletRef);
    if (!walletSnap.exists()) {
      return { success: false, msg: "Wallet not found" };
    }

    const walletData = walletSnap.data() as WalletType;

    const currentBalance = walletData.amount || 0;
    // Prevent expense when not enough funds
    if (type === "expense" && currentBalance < amount) {
      return { success: false, msg: "Insufficient funds in wallet" };
    }


    const fieldToUpdate = type === "income" ? "totalIncome" : "totalExpenses";

    const UpdatedAmount = type==="income"?Number(walletData.amount)+amount:Number(walletData.amount)-amount;
    const updatetotal = type==="income"?Number(walletData.totalIncome)+amount:Number(walletData.totalExpenses)+amount;

  
    await updateDoc(walletRef, {
      amount: UpdatedAmount,
      [fieldToUpdate]: updatetotal,
    });

    return { success: true, msg: "Wallet updated for new transaction" };
  } catch (error: any) {
    return {
      success: false,
      msg: error.message || "Failed to update wallet for transaction",
    };
  }
};
const revertAndUpdateWallets = async (
  data: TransactionType,
  Newamount: number,
  newtype: "income" | "expense",
  newWalletId:string
) => {
  try {
    const OrignalwalletSnap = await getDoc(doc(firestore,"wallets",data.walletId!));
    const Orignalwallet = OrignalwalletSnap.data() as WalletType
    let newWalletsanp = await getDoc(doc(firestore,"wallets",newWalletId));
    let newWallet = newWalletsanp.data() as WalletType;

    const revertType =data.type =="income"?'totalIncome'  :'totalExpenses' 
    let revertIncomeExpanse:number = data.type=="income"?-Number(data.amount): Number(data.amount);
    const reverAmount = Number(Orignalwallet.amount) + revertIncomeExpanse;
const revertIncomeExpanseTotal = Number(Orignalwallet[revertType]) - data.amount;
if(newtype=="expense"){
  if(data.walletId == newWalletId && reverAmount < Newamount){
return { success: false, msg: "Insufficient funds in wallet to update transaction" };
}
if(data.walletId !== newWalletId && Number(newWallet.amount) < Newamount){
  return { success: false, msg: "Insufficient funds in new wallet to update transaction" };
}
}

await createOrUpdateWallet({
  id:data.walletId,
  amount:reverAmount,
  [revertType]:revertIncomeExpanseTotal
})


  newWalletsanp = await getDoc(doc(firestore,"wallets",newWalletId));
  newWallet = newWalletsanp.data() as WalletType;

  const fieldToUpdate = newtype == "income" ? "totalIncome" : "totalExpenses";

  const newtransAmount =   newtype=="income"? Newamount : -Newamount;
  const newwalletAmount = Number(newWallet.amount) + newtransAmount;
  const newWalletIncomeExpanseTotal = Number(newWallet[fieldToUpdate]) + Newamount;

 await createOrUpdateWallet({
    id:newWalletId,
    amount:newwalletAmount,
    [fieldToUpdate]:newWalletIncomeExpanseTotal
  })

    return { success: true, msg: "Wallet updated for new transaction" };
  } catch (error: any) {
    return {
      success: false,
      msg: error.message || "Failed to update wallet for transaction",
    };
  }
};

export const deleteTransaction = async (
  transactionId:string
  , walletId:string
)=>{
try {
  const transactionRef = doc(firestore,"transactions",transactionId)
  const transactionSnap = await getDoc(transactionRef);
  if(!transactionSnap.exists()){
    return {success:false,msg:"Transaction not found"}
  }
  const transactionData = transactionSnap.data() as TransactionType;

  // Revert wallet amounts
  const walletRef = doc(firestore,"wallets",walletId)
  const walletSnap = await getDoc(walletRef);
  if(!walletSnap.exists()){
    return {success:false,msg:"Wallet not found"}
  }
  const walletData = walletSnap.data() as WalletType;
  const currentBalance = walletData.amount || 0;
  const fieldToUpdate = transactionData.type === "income" ? "totalIncome" : "totalExpenses";  
  const UpdatedAmount = transactionData.type==="income"?Number(currentBalance)-Number(transactionData.amount):
  Number(currentBalance)+Number(transactionData.amount);
  const updatetotal = transactionData.type==="income"?
  Number(walletData.totalIncome)-Number(transactionData.amount):
  Number(walletData.totalExpenses)-Number(transactionData.amount);
  await updateDoc(walletRef,{
    amount:UpdatedAmount,
    [fieldToUpdate]:updatetotal
  })
  await deleteDoc(transactionRef);

  return {success:true,msg:"Transaction deleted successfully"};
} catch (error:any) {
  return {success:false,msg:error.message||"Failed to delete transaction"}
}
}

import { colors } from "@/constants/theme";
import { getLast7Days } from "@/utils/common";
import { scale, verticalScale } from "@/utils/styling";

type ChartData = {
  value: number;
  label?: string;
  spacing?: number;
  labelWidth?: number;
  frontColor: string;
};

// ---------------------------------------------
// GET WEEKLY CHART DATA (INCOME & EXPENSE)
// ---------------------------------------------
export const fetchWeeklystats = async (uid: string) => {
  try {
    const db = firestore;
    const transactionsRef = collection(db, "transactions");
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7); // Last 7 days including today

    const q = query(
      transactionsRef,
      where("uid", "==", uid),
      where("date", ">", Timestamp.fromDate(weekAgo)),
      orderBy("date", "desc"),
      where("date", "<=", Timestamp.fromDate(now))
    );
    const querySnapshot = await getDocs(q);
    const weeklydata = getLast7Days()

    const transactions : TransactionType[]= [];
    querySnapshot.forEach((doc) => {
     const transaction = doc.data() as TransactionType;
     transaction.id = doc.id;
     transactions.push(transaction);

     const transactionDate = (transaction.date as Timestamp).toDate().toISOString().split("T")[0];

      const dayData = weeklydata.find(day => day.date === transactionDate);
      if (dayData) {
        if (transaction.type === "income") {
          dayData.income += transaction.amount || 0;
        } else if (transaction.type === "expense") {
          dayData.expense += transaction.amount || 0;
        }
      }
    }); 

    const stats= weeklydata.flatMap(day=>[
      {
        value: day.income,
        label: day.day,
        spacing:scale(4),
        labelWidth:verticalScale(30),
        frontColor: colors.primary, // Green for income
      },
      {
        value: day.expense,
        frontColor: colors.rose, // Red for expense
      }
    ])
    return { success: true, stats,transactions, msg: "Chart data fetched successfully" };

  } catch (err: any) {
    return { success: false, msg: err.message || "Failed to fetch chart data" };
  }
};

const getDateRange = (type: "weekly" | "monthly" | "yearly") => {
  const now = new Date();
  let startDate: Date;

  if (type === "weekly") {
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // shift Sunday to previous Monday
    startDate = new Date(now);
    startDate.setDate(now.getDate() - diff);
    startDate.setHours(0, 0, 0, 0); // start of Monday
      

  } else if (type === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
  }

  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999); // include all of today

  return { startDate, endDate };
};




// -------------------------
// Main function
// -------------------------
export const getChartDataByUid = async (uid: string, period: "weekly" | "monthly" | "yearly") => {
  try {
    const { startDate, endDate } = getDateRange(period);
    const transactionsRef = collection(firestore, "transactions");

    const q = query(
      transactionsRef,
      where("uid", "==", uid),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    // Helper to convert Date to YYYY-MM-DD string
    const dateToStr = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

    // Initialize periodData
    let periodData: any[] = [];
    if (period === "weekly") {
      const days = ["mon","tue","wed","thu","fri","sat","sun"];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        date.setHours(0,0,0,0);
        periodData.push({ date, day: days[i], income: 0, expense: 0 });
      }
    } else if (period === "monthly") {
      const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth()+1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(startDate.getFullYear(), startDate.getMonth(), i);
        date.setHours(0,0,0,0);
        periodData.push({ date, day: i.toString(), income: 0, expense: 0 });
      }
    } else { // yearly
      for (let m = 0; m < 12; m++) {
        const date = new Date(startDate.getFullYear(), m, 1);
        periodData.push({ month: m, day: date.toLocaleString("default",{month:"short"}), income: 0, expense: 0 });
      }
    }

    // Process transactions
    const transactions: TransactionType[] = [];
    querySnapshot.forEach(docSnap => {
      const t = docSnap.data() as TransactionType;
      transactions.push({ ...t, id: docSnap.id });

      const tDate = (t.date as Timestamp).toDate();
      tDate.setHours(0,0,0,0); // normalize

      if (period === "yearly") {
        const monthIndex = tDate.getMonth();
        periodData = periodData.map(d => monthIndex === d.month 
          ? { ...d, income: d.income + (t.type==="income"? t.amount:0), expense: d.expense + (t.type==="expense"? t.amount:0) }
          : d
        );
      } else {
        const tDateStr = dateToStr(tDate);
        periodData = periodData.map(d => {
          const dDate = d.date instanceof Date ? d.date : new Date(d.date);
          const dDateStr = dateToStr(dDate);
          if(dDateStr === tDateStr){
            return { 
              ...d, 
              income: d.income + (t.type==="income"? t.amount:0), 
              expense: d.expense + (t.type==="expense"? t.amount:0) 
            };
          }
          return d;
        });
      }
    });

    // Format stats for chart
    const stats = periodData.flatMap(d => [
      { value: d.income, label: d.day, spacing: scale(4), labelWidth: verticalScale(30), frontColor: colors.primary },
      { value: d.expense, frontColor: colors.rose }
    ]);

    return { success: true, stats, transactions, msg: "Chart data fetched successfully" };

  } catch(err: any) {
    return { success: false, msg: err.message || "Failed to fetch chart data" };
  }
};

