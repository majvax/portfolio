import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    // add the name of the repository so that the static files are served from the correct path
    // shouldn't be necessary now that I'm using a custom domain
    // basePath: '/portfolio',
    // assetPrefix: '/portfolio/',
    images: {
        unoptimized: true,
    },

};

export default nextConfig
