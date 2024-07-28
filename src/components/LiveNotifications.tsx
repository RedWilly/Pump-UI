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


import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useWebSocket } from '@/components/WebSocketProvider';
import { formatAmountV2 } from '@/utils/blockchainUtils';

interface Notification {
  message: string;
  type: 'buy' | 'sell' | 'tokenCreated';
  logo?: string;
}

const LiveNotifications: React.FC = () => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { newTokens, newTransactions } = useWebSocket();

  const createNotificationMessage = (data: { type: string; data: any }): Notification => {
    const addressEnd = data.data.senderAddress?.slice(-6) || data.data.creatorAddress?.slice(-6) || 'Unknown';
    
    switch (data.type) {
      case 'buy':
        return {
          message: `${addressEnd} Bought ${formatAmountV2(data.data.ethAmount)} BONE of ${data.data.symbol}`,
          type: 'buy',
          logo: data.data.logo
        };
      case 'sell':
        return {
          message: `${addressEnd} Sold ${formatAmountV2(data.data.ethAmount)} BONE of ${data.data.symbol}`,
          type: 'sell',
          logo: data.data.logo
        };
      case 'tokenCreated':
        return {
          message: `${data.data.symbol} Created by ${addressEnd}`,
          type: 'tokenCreated',
          logo: data.data.logo
        };
      default:
        console.error('Unknown notification type:', data.type);
        return {
          message: 'New activity',
          type: 'buy',
          logo: undefined
        };
    }
  };

  const closeNotification = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setCurrentNotification(null);
    }, 3000); // 3 seconds delay
  };

  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setCurrentNotification(notification);
      setIsVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (newTokens.length > 0) {
      console.log(newTokens)
      const notification = createNotificationMessage({ type: 'tokenCreated', data: newTokens[0] });
      handleNewNotification(notification);
    }

    if (newTransactions.length > 0) {
      console.log(newTransactions)
      const notification = createNotificationMessage({ type: newTransactions[0].type, data: newTransactions[0] });
      handleNewNotification(notification);
    }
  }, [newTokens, newTransactions]);

  useEffect(() => {
    if (containerRef.current && currentNotification && isVisible) {
      const container = containerRef.current;
      const totalWidth = container.scrollWidth;
      const viewportWidth = container.offsetWidth;
      const duration = 15000; // 15 seconds for a complete cycle

      if (animationRef.current) {
        animationRef.current.cancel();
      }

      animationRef.current = container.animate(
        [
          { transform: 'translateX(100%)' },
          { transform: `translateX(-${totalWidth - viewportWidth}px)` }
        ],
        {
          duration: duration,
          easing: 'linear'
        }
      );

      animationRef.current.onfinish = closeNotification;

      return () => {
        if (animationRef.current) {
          animationRef.current.cancel();
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [currentNotification, isVisible]);

  if (!isVisible || !currentNotification) return null;

  return (
    <div className="bg-blue-500 text-white py-1 overflow-hidden sticky top-0 z-50">
      <div ref={containerRef} className="flex whitespace-nowrap items-center">
        <div className="flex items-center space-x-2 mx-3">
          <span className="text-xs font-medium">{currentNotification.message}</span>
          {currentNotification.logo && (
            <Image
              src={currentNotification.logo}
              alt="Token Logo"
              width={12}
              height={12}
              className="rounded-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveNotifications;