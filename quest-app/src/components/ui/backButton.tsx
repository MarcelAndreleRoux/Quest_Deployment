import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const text = textRef.current;
    const arrow = arrowRef.current;
    const container = containerRef.current;

    if (!button || !text || !arrow || !container) return;

    // Set initial states
    gsap.set(text, {
      width: 0,
      opacity: 0,
      marginLeft: 0,
    });

    // Get the button's right position before animation
    const buttonRect = button.getBoundingClientRect();
    const initialRight = window.innerWidth - buttonRect.right;

    // Create hover animation timeline
    const tl = gsap.timeline({ paused: true });

    tl.to(button, {
      width: "100px",
      duration: 0.3,
      ease: "power2.out",
      xPercent: 0,
      gap: 5,
      // Keep right side fixed
      onUpdate: function () {
        const newRect = button.getBoundingClientRect();
        const currentRight = window.innerWidth - newRect.right;
        const difference = currentRight - initialRight;
        gsap.set(button, { x: difference });
      },
    })
      .to(
        text,
        {
          width: "auto",
          opacity: 1,
          marginLeft: "8px",
          duration: 0.3,
          ease: "power2.out",
        },
        "<"
      )
      .to(
        arrow,
        {
          x: "-4px",
          duration: 0.2,
          ease: "power2.out",
        },
        "<"
      );

    // Add hover event listeners
    button.addEventListener("mouseenter", () => tl.play());
    button.addEventListener("mouseleave", () => tl.reverse());

    // Cleanup
    return () => {
      button.removeEventListener("mouseenter", () => tl.play());
      button.removeEventListener("mouseleave", () => tl.reverse());
      tl.kill();
    };
  }, []);

  return (
    <div className="relative w-14">
      <div ref={containerRef} className="flex justify-end max-w-24">
        <Button
          ref={buttonRef}
          onClick={() => router.back()}
          className={`
          group
          flex
          items-center
          px-3
          gap-0
          justify-start
          transition-colors
          duration-200
          overflow-hidden
          ${className}
        `}
        variant={"default"}
        size={"lg"}
        >
          <div ref={arrowRef} className="flex items-center justify-center">
            <ArrowLeft className="h-7 w-7" />
          </div>
          <span ref={textRef} className="font-medium whitespace-nowrap ml-2">
            Back
          </span>
        </Button>
      </div>
    </div>
  );
};

export default BackButton;