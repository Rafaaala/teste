/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVIDO: ignoreBuildErrors: true
  // Em produção, todos os erros TypeScript devem ser corrigidos
  images: {
    unoptimized: true,
  },
}

export default nextConfig
