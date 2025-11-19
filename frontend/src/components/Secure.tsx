import { Route, useNavigate } from 'react-router-dom'
import type { FC, PropsWithChildren, } from 'react'
import { useUser, useSession } from '@descope/react-sdk'

type Role = 'standard' | 'admin'
type AllowedRoles = [Role]


type SecureProps = {
    allowedRoles?: AllowedRoles
}

const Secure:FC<PropsWithChildren<SecureProps>> = ({ children, allowedRoles = [] }) => {
    const navigate = useNavigate()
    const user = useUser()
    const { isAuthenticated, isSessionLoading } = useSession()

    if (!isAuthenticated && !isSessionLoading) {
        console.warn("Detected unauthed user, sending them home")
        navigate('/')
    }

    console.log("TO-DO: Implement Roles", allowedRoles)
    return (
        <>
        {children}
        </>
    )
}

export default Secure