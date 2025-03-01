import { theme } from "@/app/theme";
import React from "react";
export const MetroIcon = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 136.2 144.1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        style={{
          fill: theme.colors.yellow[400],
          strokeWidth: 17,
          strokeLinejoin: "round",
          paintOrder: "stroke fill markers",
        }}
        d="M 31.5,0 V 52.7 H 0 V 69.4 L 68.1,144.1 L 136.2,69.4 V 52.7 H 104.7 V 0 H 87.2 L 68.1,23.6 L 49.0,0 Z M 48.3,24.5 L 68.1,49.1 L 87.9,24.5 V 69.3 H 113.0 L 68.1,118.2 L 23.2,69.3 H 48.3 Z"
      />
    </svg>
  );
  