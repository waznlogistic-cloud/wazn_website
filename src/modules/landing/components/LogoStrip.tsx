import "./../landing.css";
import { getAssetUrl } from "./useAssetUrl";

type Props = {
  title: string;
  names: string[]; // basenames in /assets
};

export default function LogoStrip({ title, names }: Props) {
  // duplicate list to create seamless loop
  const urls = names.map(getAssetUrl).filter(Boolean) as string[];
  const loop = [...urls, ...urls];

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="h-px flex-1 mx-4 bg-gray-300/60" />
      </div>

      <div className="overflow-hidden">
        <div className="logo-marquee rtl">
          {loop.map((src, i) => (
            <div key={i} className="logo-card">
              <img src={src} alt="logo" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
