type Props = {
  height?: string;
  width?: string;
  color?: string;
  margin?: string;
};

export default function HorizontalLine({
  height = "1px",
  width = "100%",
  color = "var(--white)",
  margin = "0",
}: Props) {
  return <div style={{ height, width, backgroundColor: color, margin }} />;
}
