export interface Log {
    timeStamp: Date;
    title: string
}
export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    digitalID: string;
    event: string;
    time: Date;
    activityLog?: Log[];
}

export interface UserRowProps {
    user: User;
}
  
export interface UsersTableProps {
    users: User[];
    offset: number;
    totalUsers: number;
    productsPerPage: number;
    onPrev: () => void;
    onNext: () => void;
}

export interface UserCardProps {
    user: User;
    activityLogs: string[];
}