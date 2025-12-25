import React from "react";
import dynamic from "next/dynamic"; // Or your preferred dynamic import solution
import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

export type LucideIconName = keyof typeof dynamicIconImports;

interface IconProps extends LucideProps {
  name: LucideIconName
}

const DynamicLucideIcon: React.FC<IconProps> = ({ name, ...props }) => {
  // Validar que el nombre del icono exista en los imports disponibles
  const iconName = (name && dynamicIconImports[name]) ? name : "badge-info";
  
  const LucideIcon = dynamic(dynamicIconImports[iconName], {
    ssr: false, // Set to true if you are using SSR and want server-side rendering of icons
  });

  return <LucideIcon {...props} />;
};

export default DynamicLucideIcon;
