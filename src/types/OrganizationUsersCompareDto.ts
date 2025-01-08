export interface User {
    email: string
    displayName: string | null
    id: number
    organizationId: number
    organizationDisplayName: string
  }
  
  export  interface UserPair {
    sourceUser: User
    targetUser: User
  }

  
  export interface OrganizationDto {
    id: number
    displayName: string
    legalName: string
  }
  
  export interface UserMatchDto {
    id: number
    displayName: string
    email: string
  }
  

  
  export interface OrganizationUsersCompareDto {
    sourceOrganization: OrganizationDto
    targetOrganization: OrganizationDto
    matchedUsers: UserMatchDto[]
    unmatchedSourceUsers: UserMatchDto[]
    unmatchedTargetUsers: UserMatchDto[]
  }



