import React from "react";
import BackButton from "@/components/ui/backButton";

interface BackButtonContainerProps {
  className?: string;
}

const BackButtonContainer: React.FC<BackButtonContainerProps> = ({
  className,
}) => {
  return (
    <div className={`relative w-14 ${className || ""}`}>
      <BackButton className="fixed" />
    </div>
  );
};

export default BackButtonContainer;