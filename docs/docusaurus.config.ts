import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config = {
	title: "CameraShaker",
	tagline: "Procedural camera shake for Roblox. Built with roblox-ts",
	favicon: "img/logo.png",

	// Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
	future: {
		v4: true, // Improve compatibility with the upcoming Docusaurus v4
	},

	// Set the production url of your site here
	url: "https://paramacode.github.io",
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: "/CameraShaker/",

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: "paramacode", // Usually your GitHub org/user name.
	projectName: "CameraShaker", // Usually your repo name.
	deploymentBranch: "gh-pages",

	trailingSlash: false,

	onBrokenLinks: "warn",

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					routeBasePath: "/",
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
			},
		],
	],

	themeConfig: {
		// Replace with your project's social card
		image: "img/docusaurus-social-card.jpg",
		colorMode: {
			respectPrefersColorScheme: false,
		},
		navbar: {
			title: "Home",
			items: [
				{
					type: "docSidebar",
					sidebarId: "tutorialSidebar",
					position: "left",
					label: "Guide",
				},
				{
					href: "https://github.com/paramacode/CameraShaker",
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			copyright: `Copyright © ${new Date().getFullYear()} paramacode, Built with Docusaurus.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
			additionalLanguages: ["lua", "bash"],
		},
	},
};

export default config;