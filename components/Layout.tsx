import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-light font-display">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-800 px-6 py-3 bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4 text-slate-100">
          <div className="size-6 text-primary">
            <span className="material-symbols-outlined text-[28px]">smart_display</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:gap-3">
            <h1 className="text-lg font-bold leading-tight tracking-[-0.015em]">AI 비디오 분석</h1>
            <span className="hidden md:inline-block w-px h-4 bg-slate-700"></span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Gemini 1.5 Flash
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span>사용 가이드</span>
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-slate-800" 
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCaHZQ4h6z_wiRmGexEF9hCGYNfRNuGwf5xl2Md0FdFe1CkCxVS_Bz85wox-27pu7oXzKheNwjKtC2A_fiEmj115y9V0hhD5ZpHQAvI8cY2z7rriSdWz_L-jR_AzPhgfHtQwLy_z2jI_nYRCl8UuMlmFDa20sFw5IslV5p8pmGltAmKziPBeb9EbEqVRxn5n96lAK-r1XDZE0it_nlEnVOsw8qZPE_Vgbkzw2V1JBxwDgRgVsQ8IkLFFGRQvkNR-RRW6aG2JsRc9jND")'}}
            ></div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;