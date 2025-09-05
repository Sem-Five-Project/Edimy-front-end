
import Image from "next/image";

export function Logo() {
  return (
    <div className=" w-full justify-center items-center flex  ">
    <div className=" h-17 flex items-center justify-center w-45    bg-white rounded-xl shadow-md ">
      <Image
        src="/EdimyAdmin.png"
        width={150}
        height={32}
        alt="EdimyAdmin logo"
        role="presentation"
        quality={100}
        className="object-contain"
      />
    </div>
    </div>
  );
}
