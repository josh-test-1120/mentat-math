/** @type {import('next').NextConfig} */
const nextConfig = {
//    output: 'export',
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "www.cwu.edu",
                port: "",
                pathname: "/about/**"
            },
        ]
    }
};

export default nextConfig;
