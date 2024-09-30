// import React, { createContext, ReactNode, useContext, useState } from 'react';

// interface FontSizeContextType {
//   fontSize: number;
//   setFontSize: (size: number) => void;
// }

// const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

// export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
//   const [fontSize, setFontSize] = useState(25); // 초기 글자 크기 설정

//   return ( 
//     <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
//       {children}
//     </FontSizeContext.Provider>
//   );
// };

// export const useFontSize = () => {
//   const context = useContext(FontSizeContext);
//   if (!context) {
//     throw new Error('useFontSize must be used within a FontSizeProvider');
//   }
//   return context;
// };
