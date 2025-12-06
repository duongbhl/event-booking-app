export interface MessagePreviewProps {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;       // "Just now", "10 min ago", "1 hour ago"
  unread: number;     // 0 nếu đã đọc hết
}
