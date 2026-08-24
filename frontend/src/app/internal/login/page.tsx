import { LoginForm } from "@/components/auth/login-form";
import { BedIcon } from "@/components/ui/icons";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(120deg, rgba(0,0,0,.25), rgba(0,0,0,.72)), url('https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1600&q=90')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-md bg-background text-primary"><BedIcon className="size-6" /></span>
          <div><p className="text-lg font-semibold">Prama Homestay</p><p className="text-xs tracking-[0.12em] text-white/70 uppercase">Internal operations</p></div>
        </div>
        <div className="relative max-w-xl pb-8">
          <p className="text-4xl leading-[1.12] font-semibold tracking-[-0.03em]">Ruang kerja yang setenang pengalaman tamu.</p>
          <p className="mt-5 max-w-md text-base leading-7 text-white/72">Kelola ketersediaan, kondisi, dan detail kamar dalam satu alur operasional.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <span className="grid size-11 place-items-center rounded-md bg-primary text-white"><BedIcon className="size-5" /></span>
            <div><p className="font-semibold">Prama Homestay</p><p className="text-xs tracking-[0.1em] text-muted uppercase">Internal</p></div>
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary">Selamat datang kembali</h1>
          <p className="mt-3 max-w-sm leading-7 text-muted">Masuk menggunakan akun admin atau staff untuk melanjutkan operasional.</p>
          <LoginForm />
          <p className="mt-8 text-sm leading-6 text-muted">Akses dilindungi dan setiap perubahan terkait dengan akun internal Anda.</p>
        </div>
      </section>
    </main>
  );
}
