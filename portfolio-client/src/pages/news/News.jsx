import { useState, useContext } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { NewsForAdmin } from './NewsForAdmin'
import { NewsForUsers } from './NewsForUsers'
export const  News = () =>{
    const { role } = useContext(UserContext)
    
    return (<div>
        {role === 'Admin' ? <NewsForAdmin/>:<NewsForUsers/>}
    </div>)
} 