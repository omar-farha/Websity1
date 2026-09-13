import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(2.4); opacity: 0; }
  100% { transform: scale(2.4); opacity: 0; }
`;

export default function PulseDot({ size = 10 }: { size?: number }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
      aria-label="Actively working with this client"
      title="Actively working with this client"
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          bgcolor: "success.main",
          animation: `${pulse} 1.8s ease-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          bgcolor: "success.main",
        }}
      />
    </Box>
  );
}
