export interface Account {
    readonly _id: string,
    readonly planId: string,
    readonly status: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly finishedAt: Date,
}