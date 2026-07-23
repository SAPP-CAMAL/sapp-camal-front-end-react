import { CommonHttpResponseSingle } from "@/features/people/domain"

export type Slaughterhouse = {
    id: number
    code: string
    name: string
    description: string
    enablingCode: string
    status: boolean
}

export type CreateSlaughterhouseBody = {
    code: string
    name: string
    description: string
    enablingCode: string
    status?: boolean
}

export type UpdateSlaughterhouseBody = Partial<CreateSlaughterhouseBody>

export type ResponseSlaughterhouseAll = CommonHttpResponseSingle<Slaughterhouse[]>
export type ResponseSlaughterhouseSingle = CommonHttpResponseSingle<Slaughterhouse>
