export type MessageType = 'MESSAGE' | 'NEW_USER';

export interface Message {
    id?: string;
    text: string;
    date: Date;
    username: string;
    type: MessageType;
    color: string;
}
