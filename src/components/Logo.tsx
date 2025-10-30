import waznLogo from "../assets/wazn logo.svg";

type LogoProps = {
  className?: string;
  alt?: string;
  height?: number | string;
};

export default function Logo({ className = "", alt = "Wazn Logo", height }: LogoProps) {
  const style = height ? { height, width: "auto" } : undefined;
  return <img src={waznLogo} alt={alt} className={className} style={style} />;
}
