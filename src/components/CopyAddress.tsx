import React from 'react'
import { FaRegCopy } from "react-icons/fa6";
import { handleCopy } from './Nav';


const CopyAddress = ({ data }: { data?: string }) => {
  return (
    <span>{data?.slice(0, 5)}...{data?.slice(51, 56)}    <span onClick={() => data && handleCopy(data)}><FaRegCopy /></span></span>
  )
}

export default CopyAddress