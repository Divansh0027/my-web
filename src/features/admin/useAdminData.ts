import { useState, useEffect } from 'react'
import { subscribeUsers, subscribeEnquiries, ClientUser } from '@/firebase'
import { EnquiryRecord } from '@/shared/types/types'

export interface UseAdminDataReturn {
  dbUsers: ClientUser[]
  dbEnquiries: EnquiryRecord[]
}

export function useAdminData(isAdmin: boolean): UseAdminDataReturn {
  const [dbUsers, setDbUsers] = useState<ClientUser[]>([])
  const [dbEnquiries, setDbEnquiries] = useState<EnquiryRecord[]>([])

  useEffect(() => {
    let unsubscribeUsers = () => {}
    let unsubscribeEnquiries = () => {}

    if (isAdmin) {
      unsubscribeUsers = subscribeUsers((users) => {
        setDbUsers(users)
      })
      unsubscribeEnquiries = subscribeEnquiries((enqs) => {
        setDbEnquiries(enqs as unknown as EnquiryRecord[])
      })
    } else {
      setDbUsers([])
      setDbEnquiries([])
    }

    return () => {
      unsubscribeUsers()
      unsubscribeEnquiries()
    }
  }, [isAdmin])

  return { dbUsers, dbEnquiries }
}
