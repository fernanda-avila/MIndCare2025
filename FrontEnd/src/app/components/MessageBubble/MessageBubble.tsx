import styles from '../../Chat/Chat.module.css';

interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'bot';
  time: string;
}

export default function MessageBubble({ message, sender, time }: MessageBubbleProps) {
  return (
    <div className={`${styles.messageBubble} ${sender === 'user' ? styles.userMessage : styles.botMessage}`}>
      <div className={styles.messageContent}>
        <p>{message}</p>
        <span className={styles.messageTime}>{time}</span>
      </div>
    </div>
  );
}