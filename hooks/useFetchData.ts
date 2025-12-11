import { firestore } from '@/config/firebase'
import { collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

const useFetchData = <T>(
    collectionName:string,
    contraints:QueryConstraint[]=[],
) => {
    const [data,setData] =useState<T[]>([])
    const [loading,SetLoading] = useState(true)
    const [error,setError] = useState<string|null>(null)
    useEffect(() => {
   if(!collectionName) return
   const collectionRef = collection(firestore,collectionName)
   const q = query(collectionRef,...contraints)

   const unsub = onSnapshot(q,(snapShot)=>{
const fetchedData = snapShot.docs.map(doc=>{
  return {
    id:doc.id,
    ...doc.data()
  }
}) as T[]

setData(fetchedData)
SetLoading(false)
   }, (err)=>{
    console.log("error fetching data",err)
    setError(err.message)
    SetLoading(false)

   })
   return ()=> unsub()
    }, [])
    
  return {data,loading,error}
   
}

export default useFetchData

const styles = StyleSheet.create({})