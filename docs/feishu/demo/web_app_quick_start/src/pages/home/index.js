import React, { useEffect, useState } from "react"
//components
import UserInfo from "../../components/userinfo"
import UseAPI from '../../components/useapi'
//
import { handleJSAPIAccess, handleUserAuth } from '../../utils/auth_access_util'
import './index.css'

export default function Home() {

    const [userInfo, setUserInfo] = useState({})
    useEffect(() => {
        //鉴权处理
        handleJSAPIAccess((isSucces) => {
            console.log('handleJSAPIAccess OK: ', isSucces)
            //免登处理
            handleUserAuth((userInfo) => {
                setUserInfo(userInfo)
            })
        })
    }, [])  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="home">
            <UserInfo userInfo={userInfo} />
            <UseAPI />
        </div>
    );
}