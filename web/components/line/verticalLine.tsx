type Props = {
  height?: string;
  width?: string;
  color?: string;
};

export default function VerticalLine({
  height = "100%",
  width = "1px",
  color = "var(--white)",
}: Props) {
  return <div style={{ height, width, backgroundColor: color }} />;
}
