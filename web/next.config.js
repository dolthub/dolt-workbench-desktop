/** @type {import('next').NextConfig} */
const CopyPlugin = require("copy-webpack-plugin");

const nextConfig = {
  distDir: process.env.NODE_ENV === "production" ? "../app" : "./.next",
  output: process.env.NEXT_PUBLIC_FOR_ELECTRON === "true" && process.env.NODE_ENV === "production" ? "export" : "standalone", // Use standalone output for a server-based Next.js app
  images: {
    unoptimized: process.env.NEXT_PUBLIC_FOR_ELECTRON === "true" ? true : undefined,
  },
  publicRuntimeConfig: {  
    useQueryMocks: false, 
  },
  webpack:(config)=>{
    // Add the webpack-preprocessor-loader so we can use getServerSideProps conditionally
    config.module.rules.push({
      test: /\.tsx$/,
      use: [
        {
          loader: 'webpack-preprocessor-loader',
          options: {
            params: {
              isElectron: process.env.NEXT_PUBLIC_FOR_ELECTRON ==="true",
            },
          },
        },
      ],
    })
     // Copy loading.html to the app directory during the build
     config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: '../main/loading.html' ,  
            to: './loading.html',
          },
        ],
      })
    );

    return config;
  }
};
module.exports = nextConfig;
