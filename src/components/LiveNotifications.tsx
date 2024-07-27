// import React, { useState, useEffect, useRef } from 'react';
// import Image from 'next/image';

// interface Notification {
//   id: string;
//   message: string;
//   type: 'tokensBought' | 'tokensSold' | 'tokenCreated';
//   logo?: string;
// }

// const LiveNotifications: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [isSmallScreen, setIsSmallScreen] = useState(false);

//   useEffect(() => {
//     const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_BASE_URL as string);

//     socket.onopen = () => {
//       console.log('Connected to WebSocket');
//     };

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === 'tokensBought' || data.type === 'tokensSold' || data.type === 'tokenCreated') {
//         const newNotification: Notification = {
//           id: Date.now().toString(),
//           message: createNotificationMessage(data),
//           type: data.type,
//           logo: data.data.logo,
//         };
//         setNotifications((prev) => {
//           const updatedNotifications = [newNotification, ...prev];
//           const uniqueNotifications = updatedNotifications.reduce((acc, current) => {
//             const x = acc.find(item => item.message === current.message);
//             if (!x) {
//               return acc.concat([current]);
//             } else {
//               return acc;
//             }
//           }, [] as Notification[]).slice(0, 3);
//           return uniqueNotifications;
//         });
//       }
//     };

//     return () => {
//       socket.close();
//     };
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsSmallScreen(window.innerWidth < 640);
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);

//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     if (containerRef.current) {
//       const container = containerRef.current;
//       const totalWidth = container.scrollWidth;
//       const viewportWidth = container.offsetWidth;

//       // Adjust duration based on number of notifications and screen size
//       const baseDuration = isSmallScreen ? 10000 : 15000;
//       const duration = isSmallScreen || notifications.length > 1
//         ? (totalWidth / viewportWidth) * baseDuration * Math.max(notifications.length, 1)
//         : baseDuration * 2; // Longer duration for single message on desktop

//       const animation = container.animate(
//         [
//           { transform: `translateX(${isSmallScreen || notifications.length > 1 ? '-' : ''}${totalWidth}px)` },
//           { transform: `translateX(${isSmallScreen || notifications.length > 1 ? '100%' : '-100%'})` }
//         ],
//         {
//           duration: duration,
//           iterations: Infinity,
//           easing: 'linear'
//         }
//       );

//       return () => {
//         animation.cancel();
//       };
//     }
//   }, [notifications, isSmallScreen]);

//   const createNotificationMessage = (data: any) => {
//     const addressEnd = data.data.senderAddress.slice(-6);
//     switch (data.type) {
//       case 'tokensBought':
//         return `${addressEnd} Bought ${formatEth(data.data.ethAmount)} BONE of ${data.data.symbol}`;
//       case 'tokensSold':
//         return `${addressEnd} Sold ${formatEth(data.data.ethAmount)} BONE of ${data.data.symbol}`;
//       case 'tokenCreated':
//         return `${data.data.symbol} Created by ${addressEnd}`;
//       default:
//         return 'New activity';
//     }
//   };

//   const formatEth = (wei: string) => {
//     return (parseInt(wei) / 1e18).toFixed(4);
//   };

//   if (notifications.length === 0) return null;

//   return (
//     <div className="bg-blue-500 text-white py-1 overflow-hidden sticky top-0 z-50">
//       <div ref={containerRef} className="flex whitespace-nowrap items-center">
//         {(isSmallScreen || notifications.length > 1 ? [...notifications, ...notifications] : notifications).map((notification, index) => (
//           <React.Fragment key={`${notification.id}-${index}`}>
//             <div className="flex items-center space-x-2 mx-3 sm:mx-6">
//               <span className="text-xs sm:text-sm font-medium">{notification.message}</span>
//               {notification.type !== 'tokenCreated' && notification.logo && (
//                 <Image
//                   src={notification.logo}
//                   alt="Token Logo"
//                   width={16}
//                   height={16}
//                   className="rounded-full hidden sm:inline"
//                 />
//               )}
//             </div>
//             {(isSmallScreen || notifications.length > 1) && index < notifications.length * 2 - 1 && (
//               <div className="h-1 w-1 sm:h-2 sm:w-2 bg-white rounded-full mx-2 sm:mx-4"></div>
//             )}
//           </React.Fragment>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default LiveNotifications;


//issue to fix event dont finish loading then reset and also stuck- making the notification stuck in a lope 
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useWebSocket } from '@/components/WebSocketProvider';

interface Notification {
  id: string;
  message: string;
  type: 'buy' | 'sell' | 'tokenCreated';
  logo?: string;
}

interface Transaction {
  id: string;
  tokenId: string;
  type: 'buy' | 'sell';
  senderAddress: string;
  recipientAddress: string;
  ethAmount: string;
  tokenAmount: string;
  txHash: string;
  timestamp: string;
  tokenPrice: string;
  name: string;
  symbol: string;
  logo: string;
}

const LiveNotifications: React.FC = () => {
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { newTokens, newTransactions } = useWebSocket();
  const animationRef = useRef<Animation | null>(null);
  const maxActiveNotifications = 3;

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createNotificationMessage = useCallback((data: { type: string; data: any }) => {
    const addressEnd = data.data.senderAddress?.slice(-6) || 'Unknown';
    
    switch (data.type) {
      case 'buy':
        return `${addressEnd} Bought ${formatEth(data.data.ethAmount)} BONE of ${data.data.symbol}`;
      case 'sell':
        return `${addressEnd} Sold ${formatEth(data.data.ethAmount)} BONE of ${data.data.symbol}`;
      case 'tokenCreated':
        return `${data.data.symbol} Created by ${addressEnd}`;
      default:
        console.error('Unknown notification type:', data.type);
        return 'New activity';
    }
  }, []);

  const formatEth = useCallback((wei: string) => {
    return (parseFloat(wei) / 1e18).toFixed(4);
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setActiveNotifications(prev => {
      if (prev.length >= maxActiveNotifications) {
        return [...prev.slice(1), notification];
      }
      return [...prev, notification];
    });
  }, []);

  useEffect(() => {
    if (newTokens.length > 0) {
      newTokens.forEach(token => {
        addNotification({
          id: Date.now().toString(),
          message: createNotificationMessage({ type: 'tokenCreated', data: token }),
          type: 'tokenCreated',
          logo: token.logo,
        });
      });
    }
  }, [newTokens, addNotification, createNotificationMessage]);

  useEffect(() => {
    if (newTransactions.length > 0) {
      newTransactions.forEach((transaction: Transaction) => {
        addNotification({
          id: transaction.id,
          message: createNotificationMessage({ type: transaction.type, data: transaction }),
          type: transaction.type,
          logo: transaction.logo,
        });
      });
    }
  }, [newTransactions, addNotification, createNotificationMessage]);

  const startAnimation = useCallback(() => {
    if (containerRef.current && activeNotifications.length > 0) {
      const container = containerRef.current;
      const totalWidth = container.scrollWidth;
      const viewportWidth = container.offsetWidth;

      const baseDuration = isSmallScreen ? 10000 : 15000;
      const duration = (totalWidth / viewportWidth) * baseDuration;

      animationRef.current = container.animate(
        [
          { transform: 'translateX(100%)' },
          { transform: `translateX(-${totalWidth}px)` }
        ],
        {
          duration: duration,
          easing: 'linear'
        }
      );

      animationRef.current.onfinish = () => {
        setActiveNotifications(prev => {
          const newActive = prev.slice(1);
          return newActive;
        });
      };
    }
  }, [activeNotifications, isSmallScreen]);

  useEffect(() => {
    if (activeNotifications.length > 0) {
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [activeNotifications, startAnimation]);

  if (activeNotifications.length === 0) return null;

  return (
    <div className="bg-blue-500 text-white py-1 overflow-hidden sticky top-0 z-50">
      <div ref={containerRef} className="flex whitespace-nowrap items-center">
        {activeNotifications.map((notification, index) => (
          <React.Fragment key={`${notification.id}-${index}`}>
            <div className="flex items-center space-x-2 mx-3 sm:mx-6">
              <span className="text-xs sm:text-sm font-medium">{notification.message}</span>
              {notification.type !== 'tokenCreated' && notification.logo && (
                <Image
                  src={notification.logo}
                  alt="Token Logo"
                  width={16}
                  height={16}
                  className="rounded-full hidden sm:inline"
                />
              )}
            </div>
            {index < activeNotifications.length - 1 && (
              <div className="h-1 w-1 sm:h-2 sm:w-2 bg-white rounded-full mx-2 sm:mx-4"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LiveNotifications;