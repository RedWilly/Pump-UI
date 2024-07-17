import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-400">
            © {new Date().getFullYear()} Pump Fun. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


// import { useState } from 'react';
// import { useWatchBlocks } from 'wagmi';

// const Footer: React.FC = () => {
//   const [block, setBlock] = useState<string>("");

//   useWatchBlocks({
//     blockTag: "latest",
//     onBlock(block) {
//       setBlock(block.number.toString());
//     },
//   });

//   return (
//     <footer className="bg-gray-800">
//       <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
//         <div className="mt-8 md:mt-0 md:order-1">
//           <p className="text-center text-base text-gray-400">
//             © {new Date().getFullYear()} Pump Fun. All rights reserved.
//           </p>
//           <p className="text-center text-base text-gray-400">
//             Latest Block: {block}
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// export default Footer;
