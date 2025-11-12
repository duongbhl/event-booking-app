export type NotifyType = 'reminder' | 'chat' | 'payment' | 'system' | 'invitation';


export const sendNotification = async (
    userId: string,
    { title, message, type }: { title: string; message: string; type: NotifyType }
) => {
    console.log('Notify', userId, title, message, type);
};