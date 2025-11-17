import { useEffect, useState } from "react";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-purple-500 opacity-20 blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-blue-500 opacity-20 blur-3xl animate-pulse"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            transition: "transform 0.3s ease-out",
            animationDelay: "1s",
          }}
        />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 opacity-10 blur-3xl animate-pulse" />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-white opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* 404 Number with Glitch Effect */}
        <div className="relative mb-8">
          <h1
            className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse"
            style={{
              transform: `perspective(500px) rotateX(${mousePosition.y * 0.3}deg) rotateY(${mousePosition.x * 0.3}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            404
          </h1>
          <div className="absolute inset-0 text-9xl font-black text-purple-500 opacity-50 blur-sm animate-pulse">
            404
          </div>
        </div>

        {/* Icon with Animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-purple-500 opacity-50 blur-xl animate-ping" />
            <Search className="relative h-16 w-16 text-purple-300 animate-bounce" />
          </div>
        </div>

        {/* Text Content */}
        <h2 className="mb-4 text-3xl font-bold text-white">
          Halaman Tidak Ditemukan
        </h2>
        <p className="mb-8 text-lg text-purple-200 max-w-md mx-auto">
          Sepertinya Anda tersesat di luar angkasa.
        <h3 className="mb-8 text-lg text-purple-200 max-w-md mx-auto">
          Halaman yang Anda cari tidak ada.
        </h3>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/"
            className="group relative inline-flex items-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white/20"
          >
            <Home className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            <span>Halaman Utama</span>
          </a>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;